import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/facts";
import { SEE_A_PROVIDER } from "@/content/intake";

/**
 * The safety exit. No exercises, no product, no cart. Reachable from every Step 2 and every plan.
 */
export const metadata: Metadata = {
  title: SEE_A_PROVIDER.title,
  description: "If you have fallen recently or have new or sudden pain, see a doctor or physical therapist before starting any exercise plan.",
  robots: { index: false },
};

export default function SeeAProviderPage() {
  return (
    <div className="ix">
      <header className="ix-band ix-band--quiet">
        <div className="container-site">
          <p className="eyebrow">Before any plan</p>
          <h1 className="ix-title">{SEE_A_PROVIDER.title}</h1>
        </div>
      </header>
      <div className="container-site ix-body ix-body--narrow">
        <p className="ix-emergency" role="note">
          {SEE_A_PROVIDER.emergency}
        </p>
        {SEE_A_PROVIDER.lines.map((l) => (
          <p key={l} className="ix-prose">
            {l.replace(/\{you\}/g, "you").replace(/\{your\}/g, "your")}
          </p>
        ))}
        <p className="ix-prose">
          Questions about the board itself can wait. If you want to talk, call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>
          .
        </p>
        <p className="mt-8">
          <Link href="/" className="link">
            Back to the home page
          </Link>
        </p>
      </div>
    </div>
  );
}
