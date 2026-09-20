import type { ReactNode } from "react";
import { PageIntro } from "./PageIntro";

/** Layout for policy pages: one H1, readable measure, dated. */
export function Policy({ eyebrow, title, intro, updated, children }: { eyebrow: string; title: string; intro?: ReactNode; updated: string; children: ReactNode }) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} intro={intro}>
        <p className="mt-4 text-[0.95rem] text-muted">Last updated {updated}</p>
      </PageIntro>
      <section className="container-site pb-20">
        <div className="policy max-w-3xl space-y-8 text-lg text-ink-2">{children}</div>
      </section>
    </>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-medium text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
