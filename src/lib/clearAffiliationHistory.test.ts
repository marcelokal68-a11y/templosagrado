import { describe, it, expect, vi, beforeEach } from "vitest";

const deleteCalls: any[] = [];

vi.mock("@/integrations/supabase/client", () => {
  // Chainable mock that records the final terminal `.eq()` / `.filter()` call.
  function makeBuilder(table: string) {
    const ctx: any = { table, op: null as string | null, filters: [] as any[] };
    const chain: any = {
      delete: () => {
        ctx.op = "delete";
        return chain;
      },
      eq: (col: string, val: any) => {
        ctx.filters.push({ kind: "eq", col, val });
        deleteCalls.push({ ...ctx, filters: [...ctx.filters] });
        return chain;
      },
      filter: (col: string, _op: string, val: any) => {
        ctx.filters.push({ kind: "filter", col, val });
        deleteCalls.push({ ...ctx, filters: [...ctx.filters] });
        return chain;
      },
      then: (resolve: any) => resolve({ error: null }),
    };
    return chain;
  }
  return {
    supabase: {
      from: (table: string) => makeBuilder(table),
    },
  };
});

import { clearAffiliationHistory } from "./clearAffiliationHistory";

describe("clearAffiliationHistory", () => {
  beforeEach(() => {
    deleteCalls.length = 0;
  });

  it("does nothing without a userId", async () => {
    await clearAffiliationHistory("", "christianity", null);
    expect(deleteCalls).toHaveLength(0);
  });

  it("deletes chat_messages and activity_history for the previous religion", async () => {
    await clearAffiliationHistory("user-1", "christianity", null);
    const tables = deleteCalls.map((c) => c.table);
    expect(tables).toContain("chat_messages");
    expect(tables).toContain("activity_history");
    // every recorded call scoped to the user
    for (const c of deleteCalls) {
      expect(c.filters.some((f: any) => f.col === "user_id" && f.val === "user-1")).toBe(true);
    }
  });

  it("scopes deletes to the previous philosophy when provided", async () => {
    await clearAffiliationHistory("user-2", null, "stoicism");
    const philosophyFilters = deleteCalls.flatMap((c) =>
      c.filters.filter((f: any) => f.col === "philosophy" || f.col === "metadata->>philosophy"),
    );
    expect(philosophyFilters.length).toBeGreaterThan(0);
    expect(philosophyFilters.every((f: any) => f.val === "stoicism")).toBe(true);
  });
});
