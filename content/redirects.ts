/**
 * 301 redirects from the old Shopify theme URLs to the new site.
 * Consumed by next.config.ts. Add a line here if an old URL is discovered later.
 */
export const redirects: { from: string; to: string }[] = [
  { from: "/products/vb", to: "/vary-board" },
  { from: "/products/vb-1", to: "/vary-board-xt" },
  { from: "/products/resistance-bands", to: "/resistance-bands" },
  { from: "/pages/physical-therapy", to: "/professionals" },
  { from: "/pages/our-story", to: "/our-story" },
  { from: "/pages/faqs", to: "/faq" },
  { from: "/pages/photo-gallery", to: "/install" },
  { from: "/pages/how-to-install-the-vary-board", to: "/install" },
  { from: "/pages/contact", to: "/contact" },
  { from: "/policies/shipping-policy", to: "/shipping" },
  { from: "/policies/refund-policy", to: "/returns" },
  { from: "/policies/privacy-policy", to: "/privacy" },
  { from: "/policies/terms-of-service", to: "/terms" },
  { from: "/pages/shipping-policy", to: "/shipping" },
  { from: "/pages/refund-policy", to: "/returns" },
  { from: "/pages/privacy-policy", to: "/privacy" },
  { from: "/pages/terms-of-service", to: "/terms" },
  { from: "/pages/warranty", to: "/warranty" },
  { from: "/collections/all", to: "/vary-board" },
];
