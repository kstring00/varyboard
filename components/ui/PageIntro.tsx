import type { ReactNode } from "react";

/** Standard top-of-page block for secondary pages: eyebrow, the page's single H1, a short intro. */
export function PageIntro({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="container-site pb-10 pt-12 md:pb-14 md:pt-20">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-3 max-w-3xl text-[2.4rem] font-medium leading-[1.05] sm:text-[3rem] lg:text-[3.6rem]">{title}</h1>
      {intro && <div className="mt-5 max-w-2xl text-xl text-ink-2">{intro}</div>}
      {children}
    </header>
  );
}
