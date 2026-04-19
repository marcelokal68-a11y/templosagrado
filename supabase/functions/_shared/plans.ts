// Allowlist of valid Stripe price IDs — server-side source of truth.
// Prevents clients from passing arbitrary priceIds (old test prices, typos,
// competitors' plans, etc.) into create-checkout / change-subscription.
//
// When creating a new price in Stripe Dashboard, add it here AND deploy.

export const VALID_PRICE_IDS = new Set<string>([
  // Devoto plans
  "price_1T3dRaCkGJ1CW5bG9N43LMuq", // monthly R$19,90
  "price_1T3dZcCkGJ1CW5bGZvBy9ibE", // annual  R$199,00
  // Iluminado (TOP) plans
  "price_1T3ddNCkGJ1CW5bGQUj9TNmC", // monthly R$39,90
  "price_1T3ddZCkGJ1CW5bGatX1GaLX", // annual  R$399,00
]);

export function isValidPriceId(priceId: unknown): priceId is string {
  return typeof priceId === "string" && VALID_PRICE_IDS.has(priceId);
}
