import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { DemoForm, EmailPlanForm, TeamForm } from "@/components/plan/PlanForms";
import { ShareButton } from "@/components/plan/ShareButton";
import { militaryDiscount, vaPacket } from "@/content/config";
import { brand, discounts, formatPrice, products } from "@/content/facts";
import { buyLinks } from "@/lib/commerce";
import type { PlanContent } from "@/lib/intake";

/**
 * One primary CTA per lane, visually dominant, and one secondary.
 *   me:      buy (both models)            / email me my plan
 *   loved:   send this plan to them       / buy as a gift
 *   mil:     buy with the 10% discount    / VA provider packet
 *   clinic:  book a demo                  / (none)
 *   athlete: team pricing inquiry         / buy single
 */
function withCode(url: string) {
  return militaryDiscount.mechanism === "code" && militaryDiscount.code ? `${url}?discount=${encodeURIComponent(militaryDiscount.code)}` : url;
}

function Models({ primary, discounted = false }: { primary: boolean; discounted?: boolean }) {
  // One dominant button: the standard board. The XT is shown beside it in the quieter style.
  const cls = primary ? "btn-primary text-lg" : "btn-secondary text-lg";
  const board = discounted ? withCode(buyLinks.board) : buyLinks.board;
  const xt = discounted ? withCode(buyLinks.boardXT) : buyLinks.boardXT;
  return (
    <div className="ix-cta__models">
      <a href={board} className={cls} data-buy="board">
        {products.board.name} · {formatPrice(products.board.price)}
      </a>
      <a href={xt} className="btn-secondary text-lg" data-buy="boardXT">
        {products.boardXT.name} · {formatPrice(products.boardXT.price)}
        <span className="ix-cta__hint">for 6&apos;3&quot; and taller</span>
      </a>
    </div>
  );
}

export function LaneCta({ plan, path: pagePath, planText }: { plan: PlanContent; path: string; planText: string }) {
  const { lane } = plan;
  const title = `Vary Board plan: ${plan.choiceLabel}`;
  const pdfExists = existsSync(path.join(process.cwd(), "public", vaPacket.pdfPath));

  return (
    <section className="ix-cta no-print" aria-labelledby="ix-cta-title">
      {lane === "me" && (
        <>
          <h2 id="ix-cta-title" className="ix-cta__title">
            Get the board this plan is built on.
          </h2>
          <p className="ix-cta__lede">Both sizes ship flat-rate. Most people take the standard board.</p>
          <Models primary />
          <div className="ix-cta__secondary">
            <EmailPlanForm planText={planText} page={pagePath} secondary />
          </div>
        </>
      )}
      {lane === "loved" && (
        <>
          <h2 id="ix-cta-title" className="ix-cta__title">
            Send this plan to them.
          </h2>
          <p className="ix-cta__lede">The link opens this exact page. Nothing to sign up for.</p>
          <ShareButton title={title} path={pagePath} label="Send this plan to them" />
          <div className="ix-cta__secondary">
            <p className="ix-cta__sub">Buying it as a gift?</p>
            <Models primary={false} />
          </div>
        </>
      )}
      {lane === "mil" && (
        <>
          <h2 id="ix-cta-title" className="ix-cta__title">
            Buy with the {discounts.heroesPercent}% military discount.
          </h2>
          <p className="ix-cta__lede">
            {discounts.heroesLine}
            {militaryDiscount.mechanism === "code" && militaryDiscount.code && <> Code {militaryDiscount.code} is applied for you at checkout.</>}
            {militaryDiscount.mechanism === "verification" && <> Verify your service at checkout to apply it.</>}
            {militaryDiscount.mechanism === "unknown" && (
              <>
                {" "}
                Call{" "}
                <a href={brand.phoneHref} className="link">
                  {brand.phone}
                </a>{" "}
                and we will apply it to your order.
              </>
            )}
          </p>
          <Models primary discounted />
          <div className="ix-cta__secondary">
            {pdfExists ? (
              <a href={vaPacket.pdfPath} className="btn-secondary text-lg" download>
                Download the VA provider packet
              </a>
            ) : (
              <Link href={`/plan/provider-packet${pagePath.slice(pagePath.indexOf("?"))}`} className="btn-secondary text-lg" data-packet>
                VA provider packet (print or save as PDF)
              </Link>
            )}
          </div>
        </>
      )}
      {lane === "clinic" && (
        <>
          <h2 id="ix-cta-title" className="ix-cta__title">
            Book a demo.
          </h2>
          <p className="ix-cta__lede">A short call to walk through the board and your floor plan. Clinic pricing on the same call.</p>
          <DemoForm page={pagePath} planLabel={plan.choiceLabel} />
        </>
      )}
      {lane === "athlete" && (
        <>
          <h2 id="ix-cta-title" className="ix-cta__title">
            Team pricing.
          </h2>
          <p className="ix-cta__lede">Boards mount side by side at three-foot spacing. Tell us how many athletes.</p>
          <TeamForm page={pagePath} planLabel={plan.choiceLabel} />
          <div className="ix-cta__secondary">
            <p className="ix-cta__sub">Just for you?</p>
            <Models primary={false} />
          </div>
        </>
      )}
    </section>
  );
}
