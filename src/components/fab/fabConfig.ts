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

/**
 * Verifica se a rota atual deve exibir o FAB.
 *
 * Aceita:
 *  - rota exata: `/verse`
 *  - subrotas/parâmetros: `/verse/123`, `/verse/abc/detalhe`
 *  - querystring/hash: `/verse?x=1`, `/verse#top`
 *  - trailing slash: `/verse/`
 *
 * Rejeita falsos positivos como `/versearch` ou `/learning`.
 */
export function isFabRoute(pathname: string): boolean {
  if (!pathname) return false;
  // Normaliza: remove querystring/hash e trailing slash (exceto raiz).
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  return FAB_ROUTES.some((p) => clean === p || clean.startsWith(`${p}/`));
}
