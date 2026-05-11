/**
 * Integration test that simulates the on-screen faith switch:
 * - the user picks a new tradition
 * - a Sonner toast appears with an "Undo" action and a 15s timer
 * - clicking Undo cancels the pending DB deletion
 *
 * Mirrors the pattern used in `src/components/ContextPanel.tsx` `applyOption`
 * and in `src/pages/Profile.tsx` `saveReligion`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster, toast } from "sonner";
import React from "react";

// Track every supabase delete-chain terminal call.
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

/**
 * Tiny harness component that reproduces the exact applyOption pattern:
 * pressing the button schedules the deletion + shows the undo toast.
 */
function FaithSwitcherHarness({
  prevReligion,
  onScheduled,
}: {
  prevReligion: string;
  onScheduled?: (timerId: ReturnType<typeof setTimeout>) => void;
}) {
  const cancelledRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSwitch = () => {
    cancelledRef.current = false;
    timerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      void clearAffiliationHistory(USER, prevReligion, null);
    }, UNDO_MS);
    onScheduled?.(timerRef.current);

    toast.success("Tradição atualizada", {
      duration: UNDO_MS,
      action: {
        label: "Desfazer",
        onClick: () => {
          cancelledRef.current = true;
          if (timerRef.current) clearTimeout(timerRef.current);
        },
      },
    });
  };

  return (
    <>
      <button onClick={handleSwitch}>Mudar para Budismo</button>
      <Toaster />
    </>
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

  it("clicking Desfazer no toast cancela o timer e impede TODAS as queries de delete", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FaithSwitcherHarness prevReligion="christianity" />);

    await user.click(screen.getByRole("button", { name: /mudar para budismo/i }));

    // Toast com botão "Desfazer" aparece
    const undoBtn = await screen.findByRole("button", { name: /desfazer/i });
    expect(undoBtn).toBeInTheDocument();

    // Antes de qualquer espera, nenhuma query disparou
    expect(supabaseCalls).toHaveLength(0);

    // Avança parcialmente — ainda não disparou
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(supabaseCalls).toHaveLength(0);

    // Usuário clica em "Desfazer"
    await user.click(undoBtn);

    // Mesmo após exceder a janela de 15s, nenhuma query foi feita
    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS + 1000);
    });
    expect(supabaseCalls).toHaveLength(0);
  });

  it("sem clicar em Desfazer, após 15s as queries esperadas (chat_messages + activity_history) são disparadas", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<FaithSwitcherHarness prevReligion="christianity" />);

    await user.click(screen.getByRole("button", { name: /mudar para budismo/i }));
    await screen.findByRole("button", { name: /desfazer/i });

    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS);
      // microtasks da deleção
      await Promise.resolve();
    });

    const tables = supabaseCalls.map((c) => c.table);
    expect(tables).toContain("chat_messages");
    expect(tables).toContain("activity_history");
    // tudo escopado no user correto
    for (const c of supabaseCalls) {
      expect(c.filters.some((f) => f.col === "user_id" && f.val === USER)).toBe(true);
    }
    // chat_messages filtra pela religion anterior
    expect(
      supabaseCalls.some(
        (c) => c.table === "chat_messages" && c.filters.some((f) => f.col === "religion" && f.val === "christianity"),
      ),
    ).toBe(true);
  });

  it("trocas em sequência: clicar Desfazer na 1ª e confirmar a 2ª apaga apenas a fé corrente", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { rerender } = render(<FaithSwitcherHarness prevReligion="christianity" />);

    await user.click(screen.getByRole("button", { name: /mudar/i }));
    const firstUndo = await screen.findByRole("button", { name: /desfazer/i });
    await user.click(firstUndo); // desfaz a primeira

    // Segunda troca, agora saindo de buddhism
    rerender(<FaithSwitcherHarness prevReligion="buddhism" />);
    await user.click(screen.getByRole("button", { name: /mudar/i }));
    await screen.findByRole("button", { name: /desfazer/i });

    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS);
      await Promise.resolve();
    });

    // Nenhuma query apaga christianity (foi desfeita)
    const deletedReligions = supabaseCalls
      .filter((c) => c.table === "chat_messages")
      .flatMap((c) => c.filters.filter((f) => f.col === "religion").map((f) => f.val));
    expect(deletedReligions).not.toContain("christianity");
    expect(deletedReligions).toContain("buddhism");
  });
});
