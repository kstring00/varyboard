import { products, type ProductId } from "@/content/facts";

/**
 * Buy buttons are plain links to Shopify cart permalinks. No cart UI on our side.
 * https://{shop}/cart/{variantId}:{qty}[,{variantId}:{qty}]
 */
const shopDomain = process.env.NEXT_PUBLIC_SHOP_DOMAIN ?? "thevaryboard.com";

export type CartLine = { id: ProductId; qty?: number };

export function cartUrl(lines: CartLine[]): string {
  const parts = lines.map(({ id, qty = 1 }) => `${products[id].variantId}:${qty}`);
  return `https://${shopDomain}/cart/${parts.join(",")}`;
}

export const buyLinks = {
  board: cartUrl([{ id: "board" }]),
  boardXT: cartUrl([{ id: "boardXT" }]),
  bands: cartUrl([{ id: "bands" }]),
  carabiner: cartUrl([{ id: "carabiner" }]),
  boardPlusBands: cartUrl([{ id: "board" }, { id: "bands" }]),
  boardXTPlusBands: cartUrl([{ id: "boardXT" }, { id: "bands" }]),
} as const;
