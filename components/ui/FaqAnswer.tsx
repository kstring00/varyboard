import Link from "next/link";
import type { FaqItem } from "@/content/faq";

/** An FAQ answer plus its optional follow-on link. The JSON-LD keeps the plain answer text. */
export function FaqAnswer({ item }: { item: FaqItem }) {
  return (
    <p>
      {item.a}
      {item.link && (
        <>
          {" "}
          <Link href={item.link.href} className="link">
            {item.link.label}
          </Link>
        </>
      )}
    </p>
  );
}
