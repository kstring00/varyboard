import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, intro, align = "left", tone = "light" }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "left" | "center"; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow ${dark ? "!text-teal" : ""}`}>{eyebrow}</p>}
      <h2 className={`mt-3 text-[1.6rem] font-medium leading-[1.08] sm:text-[1.9rem] lg:text-[2.25rem] ${dark ? "text-paper" : ""}`}>{title}</h2>
      {intro && <p className={`mt-4 text-lg ${dark ? "text-paper/80" : "text-ink-2"}`}>{intro}</p>}
    </div>
  );
}
