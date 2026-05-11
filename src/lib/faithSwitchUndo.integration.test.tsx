/**
 * Integration test that simulates the on-screen faith switch:
 * - the user picks a new tradition
 * - an "Undo" control is rendered alongside a 15s pending deletion
 * - clicking Undo cancels the pending DB deletion timer
 * - letting the timer expire fires the expected delete queries
 *
 * Mirrors the pattern used in `src/components/ContextPanel.tsx` `applyOption`
 * and in `src/pages/Profile.tsx` `saveReligion`. We render a small React
 * harness instead of the full Sonner toast (which uses internal animation
 * timers incompatible with vitest fake timers); the click + timer + cancel
 * logic exercised here is exactly what the production toast wires up.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import React from "react";

const supabaseCalls: Array<{ table: string; filters: any[] }> = [];
vi.mock("@/integrations/supabase/client", () => {
  function makeBuilder(table: string) {
    const ctx: any = { table, filters: [] as any[] };
    const chain: any = {
      delete: () => chain,
      eq: (col: string, val: any) => {
        ctx.filters.push({ col, val });
        supabaseCalls.push({ table: ctx.table, filters: [...ctx.filters] });
        return chain;
      },
      filter: (col: string, _op: string, val: any) => {
        ctx.filters.push({ col, val });
        supabaseCalls.push({ table: ctx.table, filters: [...ctx.filters] });
        return chain;
      },
      then: (resolve: any) => resolve({ error: null }),
    };
    return chain;
  }
  return { supabase: { from: (table: string) => makeBuilder(table) } };
});

import { clearAffiliationHistory } from "./clearAffiliationHistory";

const UNDO_MS = 15000;
const USER = "user-screen-1";

function FaithSwitcherHarness({ prevReligion }: { prevReligion: string }) {
  const [pending, setPending] = React.useState(false);
  const cancelledRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSwitch = () => {
    cancelledRef.current = false;
    setPending(true);
    timerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      void clearAffiliationHistory(USER, prevReligion, null);
      setPending(false);
    }, UNDO_MS);
  };

  const handleUndo = () => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPending(false);
  };

  return (
    <div>
      <button onClick={handleSwitch}>Mudar para Budismo</button>
      {pending && (
        <div role="status" aria-label="Tradição atualizada">
          <span>Tradição atualizada</span>
          <button onClick={handleUndo}>Desfazer</button>
        </div>
      )}
    </div>
  );
}

describe("Faith switch on-screen undo (integration)", () => {
  beforeEach(() => {
    supabaseCalls.length = 0;
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("clicar Desfazer cancela o timer e impede TODAS as queries de delete", async () => {
    render(<FaithSwitcherHarness prevReligion="christianity" />);
    fireEvent.click(screen.getByRole("button", { name: /mudar para budismo/i }));

    // Toast/banner com "Desfazer" aparece
    const undoBtn = screen.getByRole("button", { name: /desfazer/i });
    expect(undoBtn).toBeInTheDocument();
    expect(supabaseCalls).toHaveLength(0);

    // Avança parcialmente — ainda nada
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(supabaseCalls).toHaveLength(0);

    // Usuário clica Desfazer
    fireEvent.click(undoBtn);

    // Mesmo passando da janela completa, nenhuma query foi feita
    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS + 1000);
      await Promise.resolve();
    });
    expect(supabaseCalls).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /desfazer/i })).not.toBeInTheDocument();
  });

  it("sem desfazer, após 15s dispara DELETE em chat_messages e activity_history", async () => {
    render(<FaithSwitcherHarness prevReligion="christianity" />);
    fireEvent.click(screen.getByRole("button", { name: /mudar para budismo/i }));

    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    const tables = supabaseCalls.map((c) => c.table);
    expect(tables).toContain("chat_messages");
    expect(tables).toContain("activity_history");
    for (const c of supabaseCalls) {
      expect(c.filters.some((f) => f.col === "user_id" && f.val === USER)).toBe(true);
    }
    expect(
      supabaseCalls.some(
        (c) =>
          c.table === "chat_messages" &&
          c.filters.some((f) => f.col === "religion" && f.val === "christianity"),
      ),
    ).toBe(true);
  });

  it("trocas em sequência: desfazer a 1ª e confirmar a 2ª apaga apenas a fé corrente", async () => {
    const { rerender } = render(<FaithSwitcherHarness prevReligion="christianity" />);
    fireEvent.click(screen.getByRole("button", { name: /mudar/i }));
    fireEvent.click(screen.getByRole("button", { name: /desfazer/i }));

    rerender(<FaithSwitcherHarness prevReligion="buddhism" />);
    fireEvent.click(screen.getByRole("button", { name: /mudar/i }));

    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS);
      await Promise.resolve();
      await Promise.resolve();
    });

    const deletedReligions = supabaseCalls
      .filter((c) => c.table === "chat_messages")
      .flatMap((c) => c.filters.filter((f) => f.col === "religion").map((f) => f.val));
    expect(deletedReligions).not.toContain("christianity");
    expect(deletedReligions).toContain("buddhism");
  });
});
