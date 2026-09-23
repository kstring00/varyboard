import Link from "next/link";
import { Portrait } from "@/components/home/People";
import { founders } from "@/content/facts";

/** Who wrote the movements: Eric's real photo (slot until supplied) and credentials spelled out. */
export function EricCard() {
  const e = founders.eric;
  return (
    <aside className="ix-eric" aria-label="About the physical therapist behind this plan">
      <div className="ix-eric__photo">
        <Portrait person={e} size="md" />
      </div>
      <div>
        <p className="ix-eric__name">
          {e.name}, {e.credentials}
        </p>
        <p className="ix-eric__cred">{e.credentialsSpelledOut}</p>
        <p className="ix-eric__role">{e.role}</p>
        <p className="ix-eric__line">{e.lines[1]}</p>
        <Link href="/our-story" className="link">
          Our story
        </Link>
      </div>
    </aside>
  );
}
