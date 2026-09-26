import Link from "next/link";
import { brand } from "@/content/facts";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex min-h-12 items-center gap-2 no-underline ${className}`} aria-label={`${brand.name} home`}>
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
        <rect x="9" y="1" width="10" height="26" rx="2" fill="var(--color-teal)" />
        <g fill="var(--color-ink)" opacity="0.85">
          <polygon points="14,5 16.6,6.5 16.6,9.5 14,11 11.4,9.5 11.4,6.5" />
          <polygon points="14,12.5 16.6,14 16.6,17 14,18.5 11.4,17 11.4,14" />
          <polygon points="14,20 16.6,21.5 16.6,24.5 14,26 11.4,24.5 11.4,21.5" />
        </g>
      </svg>
      <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight min-[400px]:text-lg">{brand.name}</span>
    </Link>
  );
}
