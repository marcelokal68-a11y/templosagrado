import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { corsHeadersFor } from "../_shared/cors.ts";

const ADMIN_EMAILS = [
  "marcelokal68@gmail.com",
  "kalichsztein.marcelo@gmail.com",
  "gustavonobre5387@gmail.com",
];

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) throw new Error("Not authenticated");
    const user = { id: claims.claims.sub as string, email: claims.claims.email as string };

    const { action, ...body } = await req.json();

    // Auto-seed admin on login
    if (action === "check-role") {
      if (ADMIN_EMAILS.includes(user.email!)) {
        await supabase.from("user_roles").upsert(
          { user_id: user.id, role: "admin" },
          { onConflict: "user_id,role" }
        );
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
      return new Response(JSON.stringify({ isAdmin }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Admin-only actions below ---
    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!adminCheck) throw new Error("Forbidden");

    if (action === "list-users") {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users ?? [];

      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      const roleMap = new Map<string, string[]>();
      for (const r of roles ?? []) {
        const existing = roleMap.get(r.user_id) ?? [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      }

      const now = Date.now();
      const users = authUsers.map((u: any) => {
        const profile: any = profileMap.get(u.id);
        const userRoles = roleMap.get(u.id) ?? [];
        const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
        const isOnline = lastSignIn > 0 && (now - lastSignIn) < 5 * 60 * 1000;

        let trialDaysLeft = 0;
        if (profile?.trial_ends_at) {
          const ms = new Date(profile.trial_ends_at).getTime() - now;
          if (ms > 0) trialDaysLeft = Math.ceil(ms / (1000 * 60 * 60 * 24));
        }

        return {
          id: u.id,
          email: u.email ?? "",
          display_name: profile?.display_name ?? u.email ?? "",
          is_subscriber: profile?.is_subscriber ?? false,
          is_pro: profile?.is_pro ?? false,
          is_admin: userRoles.includes("admin"),
          is_online: isOnline,
          trial_days_left: trialDaysLeft,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        };
      });

      return new Response(JSON.stringify(users), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-stats") {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users ?? [];
      const { data: profiles } = await supabase.from("profiles").select("is_subscriber, trial_ends_at");

      const now = Date.now();
      const totalUsers = authUsers.length;
      const onlineUsers = authUsers.filter((u: any) => {
        const t = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
        return t > 0 && (now - t) < 5 * 60 * 1000;
      }).length;
      const subscribers = (profiles ?? []).filter((p: any) => p.is_subscriber).length;
      const trialing = (profiles ?? []).filter((p: any) => {
        if (!p.trial_ends_at) return false;
        return new Date(p.trial_ends_at).getTime() > now && !p.is_subscriber;
      }).length;

      return new Response(JSON.stringify({ totalUsers, onlineUsers, subscribers, trialing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-analytics") {
      // Lazy import Stripe to avoid loading on every action
      const { default: Stripe } = await import("https://esm.sh/stripe@18.5.0");
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      // --- 1. Users + profiles snapshot
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const authUsers = authData?.users ?? [];
      const { data: profiles } = await supabase.from("profiles").select("user_id, is_subscriber, trial_ends_at, created_at");
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      const now = Date.now();

      const totalUsers = authUsers.length;
      let trialActive = 0;
      let trialExpired = 0;
      let convertedFromTrial = 0;

      // For conversion: someone is "converted" if subscriber AND has a trial_ends_at in the past (used trial then paid)
      for (const u of authUsers) {
        const p: any = profileMap.get(u.id);
        if (!p) continue;
        const trialMs = p.trial_ends_at ? new Date(p.trial_ends_at).getTime() : 0;
        const trialIsActive = trialMs > now && !p.is_subscriber;
        const trialIsExpired = trialMs > 0 && trialMs <= now && !p.is_subscriber;
        if (trialIsActive) trialActive++;
        if (trialIsExpired) trialExpired++;
        if (p.is_subscriber && trialMs > 0 && trialMs <= now) convertedFromTrial++;
      }
      const trialFinished = convertedFromTrial + trialExpired;
      const conversionRate = trialFinished > 0 ? (convertedFromTrial / trialFinished) * 100 : 0;

      // --- 2. Stripe: active subs grouped by product, plus MRR
      const subs: any[] = [];
      let starting_after: string | undefined = undefined;
      // Pull up to 300 active subs (3 pages of 100)
      for (let i = 0; i < 3; i++) {
        const page: any = await stripe.subscriptions.list({
          status: "active",
          limit: 100,
          ...(starting_after ? { starting_after } : {}),
          expand: ["data.items.data.price"],
        });
        subs.push(...page.data);
        if (!page.has_more) break;
        starting_after = page.data[page.data.length - 1]?.id;
      }
      // Also include trialing subs in counts (still revenue once they convert)
      const trialingSubs: any[] = [];
      const trialingPage: any = await stripe.subscriptions.list({
        status: "trialing",
        limit: 100,
        expand: ["data.items.data.price"],
      });
      trialingSubs.push(...trialingPage.data);

      // Canceled subs in last 30 days for churn
      const thirtyDaysAgo = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000);
      const canceledPage: any = await stripe.subscriptions.list({
        status: "canceled",
        limit: 100,
        expand: ["data.items.data.price"],
      });
      const recentCancels = canceledPage.data.filter(
        (s: any) => s.canceled_at && s.canceled_at >= thirtyDaysAgo
      );

      // Aggregate by product name
      const fmtPrice = (p: any) => {
        const amount = (p.unit_amount ?? 0) / 100;
        const interval = p.recurring?.interval ?? "month";
        // Normalize to monthly for MRR
        const monthly =
          interval === "year" ? amount / 12 :
          interval === "week" ? amount * 4.33 :
          interval === "day"  ? amount * 30 :
          amount;
        return { amount, interval, monthly };
      };

      const planAgg: Record<string, {
        product_id: string;
        plan_name: string;
        active: number;
        trialing: number;
        canceled_30d: number;
        mrr: number;
        currency: string;
      }> = {};

      const ensure = (productId: string, name: string, currency: string) => {
        if (!planAgg[productId]) {
          planAgg[productId] = {
            product_id: productId,
            plan_name: name,
            active: 0,
            trialing: 0,
            canceled_30d: 0,
            mrr: 0,
            currency,
          };
        }
        return planAgg[productId];
      };

      // Cache for product names
      const productNameCache = new Map<string, string>();
      const getProductName = async (productId: string): Promise<string> => {
        if (productNameCache.has(productId)) return productNameCache.get(productId)!;
        try {
          const prod: any = await stripe.products.retrieve(productId);
          productNameCache.set(productId, prod.name);
          return prod.name;
        } catch {
          productNameCache.set(productId, productId);
          return productId;
        }
      };

      const ingest = async (sub: any, key: "active" | "trialing" | "canceled_30d") => {
        for (const item of sub.items.data) {
          const price = item.price;
          const productId = typeof price.product === "string" ? price.product : price.product?.id;
          if (!productId) continue;
          const name = await getProductName(productId);
          const { monthly } = fmtPrice(price);
          const row = ensure(productId, name, price.currency || "brl");
          row[key] += 1;
          if (key === "active" || key === "trialing") {
            row.mrr += monthly * (item.quantity ?? 1);
          }
        }
      };

      for (const s of subs) await ingest(s, "active");
      for (const s of trialingSubs) await ingest(s, "trialing");
      for (const s of recentCancels) await ingest(s, "canceled_30d");

      const planBreakdown = Object.values(planAgg);
      const totalMrr = planBreakdown.reduce((sum, p) => sum + p.mrr, 0);
      const totalActiveSubs = planBreakdown.reduce((sum, p) => sum + p.active + p.trialing, 0);
      const totalCanceled30d = planBreakdown.reduce((sum, p) => sum + p.canceled_30d, 0);
      const churnRate = totalActiveSubs + totalCanceled30d > 0
        ? (totalCanceled30d / (totalActiveSubs + totalCanceled30d)) * 100
        : 0;

      // --- 3. Signups per day (last 30 days)
      const signupsByDay: Record<string, number> = {};
      const conversionsByDay: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        signupsByDay[d] = 0;
        conversionsByDay[d] = 0;
      }
      for (const u of authUsers) {
        const day = (u.created_at || "").slice(0, 10);
        if (day in signupsByDay) signupsByDay[day]++;
      }
      for (const s of subs) {
        const created = s.created ? new Date(s.created * 1000).toISOString().slice(0, 10) : null;
        if (created && created in conversionsByDay) conversionsByDay[created]++;
      }
      const timeline = Object.keys(signupsByDay).map((day) => ({
        day,
        signups: signupsByDay[day],
        conversions: conversionsByDay[day],
      }));

      return new Response(JSON.stringify({
        totals: {
          totalUsers,
          trialActive,
          trialExpired,
          convertedFromTrial,
          conversionRate,
          totalActiveSubs,
          totalCanceled30d,
          churnRate,
          totalMrr,
          arr: totalMrr * 12,
        },
        planBreakdown,
        timeline,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create-invite") {
      const { label, questions_limit, max_uses, expires_at } = body;
      const { data, error: insertErr } = await supabase
        .from("invite_links")
        .insert({
          label: label || null,
          questions_limit: questions_limit ?? 999,
          max_uses: max_uses || null,
          created_by: user.id,
          expires_at: expires_at || null,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list-invites") {
      const { data } = await supabase
        .from("invite_links")
        .select("*")
        .order("created_at", { ascending: false });
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle-invite") {
      const { id, is_active } = body;
      await supabase.from("invite_links").update({ is_active }).eq("id", id);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "promote-admin") {
      const { target_email } = body;
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const target = authUsers?.users?.find((u: any) => u.email === target_email);
      if (!target) throw new Error("User not found");
      await supabase.from("user_roles").upsert(
        { user_id: target.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "demote-admin") {
      const { target_user_id, target_email } = body;
      let targetId = target_user_id as string | undefined;
      if (!targetId && target_email) {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        targetId = authUsers?.users?.find((u: any) => u.email === target_email)?.id;
      }
      if (!targetId) throw new Error("User not found");
      if (targetId === user.id) throw new Error("Você não pode rebaixar a si mesmo");
      // Bloquear rebaixamento de admins hard-coded
      const { data: targetAuth } = await supabase.auth.admin.getUserById(targetId);
      const targetEmail = targetAuth?.user?.email?.toLowerCase();
      if (targetEmail && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(targetEmail)) {
        throw new Error("Este admin é protegido e não pode ser rebaixado");
      }
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetId)
        .eq("role", "admin");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Free Access management ---
    if (action === "list-free-access") {
      const { data } = await supabase
        .from("free_access_emails")
        .select("*")
        .order("created_at", { ascending: false });
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add-free-access") {
      const { email, note } = body;
      if (!email || typeof email !== "string") throw new Error("Email required");
      const cleanEmail = email.trim().toLowerCase();
      const { error: insErr } = await supabase
        .from("free_access_emails")
        .upsert({ email: cleanEmail, note: note || null }, { onConflict: "email" });
      if (insErr) throw insErr;
      // Also update existing profile if present
      await supabase.rpc("sync_free_access_profiles");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove-free-access") {
      const { email } = body;
      if (!email) throw new Error("Email required");
      await supabase.from("free_access_emails").delete().eq("email", email.trim().toLowerCase());
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unknown action");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isAuthError = msg === "No auth header" || msg === "Not authenticated" || msg === "Forbidden";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: isAuthError ? 401 : 500,
    });
  }
});
