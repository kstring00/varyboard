import { brand } from "@/content/facts";

/** Tappable phone number. Present on every page (header + footer). */
export function PhoneLink({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <a href={brand.phoneHref} aria-label={`Call ${brand.phone}`} className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 whitespace-nowrap font-semibold ${className}`}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" />
      </svg>
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{brand.phone}</span>
    </a>
  );
}
