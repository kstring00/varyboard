/**
 * Analytics events. No analytics library is installed yet (no @vercel/analytics), so nothing is
 * sent anywhere: each event is dispatched on window as "vb:track" (so a future library, a tag
 * manager or a test can listen) and logged in development. To send them: install
 * @vercel/analytics and call its track(name, props) here.
 * Events: faq_open { id, placement }, faq_more_click { id, placement }.
 */
export type TrackProps = Record<string, string | number | boolean>;

export function trackEvent(name: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vb:track", { detail: { name, props } }));
  if (process.env.NODE_ENV === "development") console.debug(`[track] ${name}`, props);
}
