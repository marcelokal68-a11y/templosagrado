import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Captura todas as chamadas terminais do supabase (chain delete().eq()/filter())
const supabaseCalls: Array<{ table: string; filters: any[] }> = [];

vi.mock("@/integrations/supabase/client", () => {
  function makeBuilder(table: string) {
    const ctx: any = { table, filters: [] as any[] };
    const chain: any = {
      delete: () => chain,
      eq: (col: string, val: any) => {
        ctx.filters.push({ kind: "eq", col, val });
        supabaseCalls.push({ table: ctx.table, filters: [...ctx.filters] });
        return chain;
      },
      filter: (col: string, _op: string, val: any) => {
        ctx.filters.push({ kind: "filter", col, val });
        supabaseCalls.push({ table: ctx.table, filters: [...ctx.filters] });
        return chain;
      },
      then: (resolve: any) => resolve({ error: null }),
    };
    return chain;
  }
  return { supabase: { from: (table: string) => makeBuilder(table) } };
});

import { scheduleAffiliationClear, DEFAULT_UNDO_MS } from "./scheduleAffiliationClear";

const USER = "user-test-123";

function callsForTable(table: string) {
  return supabaseCalls.filter((c) => c.table === table);
}
function hasFilter(call: { filters: any[] }, col: string, val: any) {
  return call.filters.some((f) => f.col === col && f.val === val);
}

describe("Faith switch — deletion integration", () => {
  beforeEach(() => {
    supabaseCalls.length = 0;
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("apaga chat_messages e activity_history da religião anterior após 15s", async () => {
    scheduleAffiliationClear({ userId: USER, prevReligion: "christianity" });

    // Antes do timer: nada foi deletado
    expect(supabaseCalls).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);

    const chatDeletes = callsForTable("chat_messages");
    const activityDeletes = callsForTable("activity_history");

    expect(chatDeletes.length).toBeGreaterThan(0);
    expect(activityDeletes.length).toBeGreaterThan(0);

    // Sempre escopado pelo user_id correto
    for (const c of [...chatDeletes, ...activityDeletes]) {
      expect(hasFilter(c, "user_id", USER)).toBe(true);
    }

    // chat_messages filtra pela religion anterior
    expect(chatDeletes.some((c) => hasFilter(c, "religion", "christianity"))).toBe(true);

    // activity_history filtra por type='chat' + metadata->>religion
    expect(
      activityDeletes.some(
        (c) => hasFilter(c, "type", "chat") && hasFilter(c, "metadata->>religion", "christianity"),
      ),
    ).toBe(true);
  });

  it("undo dentro da janela impede QUALQUER deleção no banco", async () => {
    const handle = scheduleAffiliationClear({ userId: USER, prevReligion: "buddhism" });
    vi.advanceTimersByTime(10000);
    handle.cancel();
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);
    expect(supabaseCalls).toHaveLength(0);
  });

  it("trocas em sequência apagam apenas a fé do schedule não cancelado", async () => {
    const first = scheduleAffiliationClear({ userId: USER, prevReligion: "christianity" });
    vi.advanceTimersByTime(2000);
    first.cancel();
    scheduleAffiliationClear({ userId: USER, prevReligion: "buddhism" });

    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);

    const chatDeletes = callsForTable("chat_messages");
    // Nenhuma deleção apaga christianity
    expect(chatDeletes.some((c) => hasFilter(c, "religion", "christianity"))).toBe(false);
    // Mas apaga buddhism
    expect(chatDeletes.some((c) => hasFilter(c, "religion", "buddhism"))).toBe(true);
  });

  it("troca de filosofia apaga pelo campo philosophy, não religion", async () => {
    scheduleAffiliationClear({ userId: USER, prevPhilosophy: "stoicism" });
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);

    const chatDeletes = callsForTable("chat_messages");
    const activityDeletes = callsForTable("activity_history");

    expect(chatDeletes.some((c) => hasFilter(c, "philosophy", "stoicism"))).toBe(true);
    expect(chatDeletes.some((c) => hasFilter(c, "religion", "stoicism"))).toBe(false);
    expect(
      activityDeletes.some(
        (c) => hasFilter(c, "type", "chat") && hasFilter(c, "metadata->>philosophy", "stoicism"),
      ),
    ).toBe(true);
  });

  it("nunca apaga dados de outro usuário", async () => {
    scheduleAffiliationClear({ userId: USER, prevReligion: "islam" });
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);
    for (const c of supabaseCalls) {
      const userFilter = c.filters.find((f) => f.col === "user_id");
      expect(userFilter?.val).toBe(USER);
    }
  });
});
