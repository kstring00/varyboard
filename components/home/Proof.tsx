import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { reviews, reviewSummary } from "@/content/reviews";

/**
 * PROOF. Real reviews only, verbatim from content/reviews.ts. Renders nothing while
 * that file is empty. Clinic and military reviews are featured first when present.
 */
export function Proof() {
  if (reviews.length === 0) return null;
  const summary = reviewSummary();
  const priority = (r: (typeof reviews)[number]) => {
    const c = (r.context ?? "").toLowerCase();
    if (/clinic|therap/.test(c)) return 0;
    if (/veteran|military|army|navy|marine|air force/.test(c)) return 1;
    return r.featured ? 2 : 3;
  };
  const shown = [...reviews].sort((a, b) => priority(a) - priority(b) || b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <section aria-labelledby="proof-title" className="bg-paper-2 py-20 md:py-28">
      <div className="container-site">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="What people say" title={<span id="proof-title">Real reviews, in their words.</span>} />
          <div className="flex items-center gap-3">
            <Stars value={summary.average} size={22} label={`${summary.average} out of 5 stars`} />
            <span className="text-lg">
              <strong>{summary.average}</strong> / 5 from {summary.count} review{summary.count === 1 ? "" : "s"}
            </span>
          </div>
        </Reveal>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((r, i) => (
            <Reveal as="li" key={r.id} delay={i * 70} className="flex flex-col rounded-2xl border border-line bg-white/80 p-7 shadow-soft">
              <Stars value={r.rating} />
              {r.title && <h3 className="mt-3 text-xl font-medium">{r.title}</h3>}
              <blockquote className="mt-3 flex-1 text-lg text-ink-2">“{r.body}”</blockquote>
              <footer className="mt-5 text-[1rem]">
                <span className="font-semibold">{r.author}</span>
                {r.context && <span className="text-ink-2"> · {r.context}</span>}
                {r.verified && <span className="ml-2 rounded-full bg-teal-soft px-2 py-0.5 text-sm font-semibold text-teal-deep">Verified</span>}
              </footer>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
