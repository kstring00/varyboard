/**
 * Public routes: the sitemap and every footer link come from here, so a page is never
 * linked twice under two spellings. Add a route here when its page ships.
 */
export interface Route {
  path: string;
  label: string;
  priority: number;
}

export const routes: Route[] = [
  { path: "/", label: "Home", priority: 1 },
  { path: "/plan", label: "Find your plan", priority: 0.9 },
  { path: "/fit", label: "Will it fit?", priority: 0.8 },
  { path: "/vary-board", label: "Vary Board", priority: 0.9 },
  { path: "/vary-board-xt", label: "Vary Board XT", priority: 0.9 },
  { path: "/resistance-bands", label: "Resistance Bands", priority: 0.8 },
  { path: "/professionals", label: "Clinics & hospitals", priority: 0.8 },
  { path: "/our-story", label: "Our story", priority: 0.7 },
  { path: "/install", label: "Install guide", priority: 0.7 },
  { path: "/faq", label: "FAQ", priority: 0.7 },
  { path: "/contact", label: "Contact", priority: 0.6 },
  { path: "/shipping", label: "Shipping", priority: 0.4 },
  { path: "/warranty", label: "Warranty", priority: 0.4 },
  { path: "/returns", label: "Returns", priority: 0.4 },
  { path: "/privacy", label: "Privacy", priority: 0.3 },
  { path: "/terms", label: "Terms", priority: 0.3 },
  { path: "/accessibility", label: "Accessibility", priority: 0.3 },
];

/** A route by path. Throws at build time if a link points at a page that is not listed. */
export function route(path: string): Route {
  const r = routes.find((x) => x.path === path);
  if (!r) throw new Error(`content/routes.ts: no route for ${path}`);
  return r;
}

/** A link to a listed page, optionally with a hash or query and a different label. */
export const link = (path: string, opts: { hash?: string; query?: string; label?: string } = {}) => {
  const r = route(path);
  return { href: `${r.path}${opts.query ? `?${opts.query}` : ""}${opts.hash ? `#${opts.hash}` : ""}`, label: opts.label ?? r.label };
};

/** The homepage's inline "Find your plan" intake (components/plan/InlineIntake.tsx). */
export const INLINE_ANCHOR = "find-your-plan";

/** Footer utility columns, in order. */
export const footerNav = [
  { title: "Shop", links: [link("/vary-board"), link("/vary-board-xt"), link("/resistance-bands")] },
  { title: "Learn", links: [link("/", { hash: "how-it-works", label: "How it works" }), link("/plan"), link("/fit"), link("/faq")] },
  { title: "Professionals", links: [link("/professionals"), link("/plan", { query: "for=mil", label: "Military & VA" }), link("/", { hash: "team-pricing", label: "Team pricing" })] },
] as const;

/** Bottom legal row. */
export const legalNav = [link("/privacy"), link("/terms"), link("/accessibility")] as const;

/** The testimonials band's invitation cell: the contact form with "Share my story" preselected. */
export const shareStoryLink = link("/contact", { query: "topic=story", label: "Own a Vary Board? Share how you use it." });
