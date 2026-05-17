import { useEffect, useRef, useState } from 'react';

export type TraditionSwitchNotice = { from: string; to: string } | null;

/**
 * Observa mudanças de religião/filosofia do `chatContext` e expõe um
 * aviso temporário ({from, to}) que some automaticamente após `durationMs`.
 *
 * Regras:
 *  - O aviso só dispara quando há um valor anterior (não na primeira
 *    seleção do usuário) e o novo valor é diferente.
 *  - A escolha simultânea de religion/philosophy é resolvida com
 *    `philosophy || religion` (mesma prioridade usada na UI do ChatArea).
 *  - Trocar para vazio (limpar tradição) não dispara o banner.
 *
 * Usado por `ChatArea` (UI) e por testes de integração.
 */
export function useTraditionSwitchNotice(
  religion: string,
  philosophy: string,
  durationMs = 8000,
): {
  notice: TraditionSwitchNotice;
  dismiss: () => void;
} {
  const [notice, setNotice] = useState<TraditionSwitchNotice>(null);
  const lastRef = useRef<string>('');

  useEffect(() => {
    const current = philosophy || religion || '';
    const prev = lastRef.current;
    if (prev && current && prev !== current) {
      setNotice({ from: prev, to: current });
      lastRef.current = current;
      const timer = setTimeout(() => setNotice(null), durationMs);
      return () => clearTimeout(timer);
    }
    lastRef.current = current;
  }, [religion, philosophy, durationMs]);

  return { notice, dismiss: () => setNotice(null) };
}
