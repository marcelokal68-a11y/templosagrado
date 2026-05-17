/**
 * Configuração compartilhada do FAB "Voltar ao Chat".
 *
 * Centraliza:
 *  - Rotas onde o FAB aparece
 *  - Posicionamento (right/bottom) por breakpoint
 *  - Espaçamento de segurança (padding-bottom) que cada página
 *    deve aplicar ao seu container rolável para que o FAB nunca
 *    cubra o final do conteúdo.
 *
 * Sempre que mudar o tamanho/posição do FAB, ajuste APENAS aqui.
 */

export const FAB_ROUTES = [
  '/learn',
  '/verse',
  '/mural',
  '/journey',
  '/prayers',
  '/practice',
] as const;

/** Classes de posicionamento do botão (usadas pelo BackToChatFab). */
export const FAB_POSITION_CLASS =
  'fixed z-40 right-4 bottom-20 md:bottom-6';

/**
 * Padding-bottom que toda página com FAB deve aplicar ao seu
 * container rolável principal. Calculado a partir de:
 *   altura do botão (h-12 = 48px) + bottom offset + folga.
 *
 * Mobile: bottom-20 (80px) + 48 + folga ≈ pb-40 (160px)
 * Desktop: bottom-6 (24px) + 48 + folga ≈ pb-24 (96px)
 */
export const FAB_SAFE_PADDING = 'pb-40 md:pb-24';

export function isFabRoute(pathname: string): boolean {
  return FAB_ROUTES.some((p) => pathname.startsWith(p));
}
