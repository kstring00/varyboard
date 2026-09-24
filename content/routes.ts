/**
 * Public routes for sitemap.xml. Add a route here when its page ships.
 */
export const routes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/plan", priority: 0.9 },
  { path: "/fit", priority: 0.8 },
  { path: "/vary-board", priority: 0.9 },
  { path: "/vary-board-xt", priority: 0.9 },
  { path: "/resistance-bands", priority: 0.8 },
  { path: "/professionals", priority: 0.8 },
  { path: "/our-story", priority: 0.7 },
  { path: "/install", priority: 0.7 },
  { path: "/faq", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
  { path: "/shipping", priority: 0.4 },
  { path: "/warranty", priority: 0.4 },
  { path: "/returns", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];
