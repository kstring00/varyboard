import { JsonLd } from "@/components/ui/JsonLd";
import { FAQ, FAQ_GROUPS, faqJsonLd, isVisible, toView } from "@/content/faq";
import { FaqDeepLink } from "./FaqDeepLink";
import { FaqDetails } from "./FaqDetails";

/**
 * FAQ (#faq), directly above the Buy block: the `featured` questions from content/faq.ts, grouped
 * under headings (Buying · Fit & install · Veterans & VA · Clinics · Athletes) as native <details>,
 * so nothing shifts while the page loads and it all works without JavaScript. Every question has
 * id="faq-<id>": inline "More in FAQ" links open it (FaqDeepLink). Empty groups are left out.
 */
export function FaqSection() {
  const featured = FAQ.filter((e) => e.featured && isVisible(e));
  const groups = FAQ_GROUPS.map((g) => ({ ...g, items: featured.filter((e) => g.groups.includes(e.group)) })).filter((g) => g.items.length);
  const ld = faqJsonLd();
  if (groups.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="faq-title" className="faqs">
      {ld && <JsonLd data={ld} />}
      <FaqDeepLink />
      <div className="faqs__inner">
        <p className="cl__eyebrow">Questions</p>
        <h2 id="faq-title" className="cl__title">
          Before you ask.
        </h2>
        <div className="faqs__groups">
          {groups.map((g) => (
            <div key={g.label} className="faqs__group">
              <h3 className="faqs__h">{g.label}</h3>
              {g.items.map((e) => (
                <FaqDetails key={e.id} id={`faq-${e.id}`} item={toView(e)} placement="faq" variant="row" />
              ))}
            </div>
          ))}
        </div>
        <a className="faqs__all" href="/faq">
          All questions
        </a>
      </div>
    </section>
  );
}
