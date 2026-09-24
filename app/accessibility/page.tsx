import type { Metadata } from "next";
import { Policy, PolicySection } from "@/components/ui/Policy";
import { brand } from "@/content/facts";

export const metadata: Metadata = {
  title: "Accessibility | How this site is built to be used by everyone",
  description: "What thevaryboard.com does to stay usable with a keyboard, a screen reader, larger text and reduced motion, and how to tell us when something is in the way.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <Policy eyebrow="Accessibility" title="Built to be used by everyone." intro="The Vary Board is for people of every age and ability. So is this website." updated="September 24, 2026">
      <PolicySection title="What we do">
        <p>Every page works with a keyboard alone, and the focused element is always visible. Buttons and links are at least 44 pixels tall so they are easy to tap. Text meets WCAG 2.2 AA contrast on every background, and the layout keeps working when text is enlarged to 200 percent.</p>
        <p>Images that carry meaning have written descriptions. Decorative graphics, including the hexagon patterns, are hidden from screen readers. Videos load only when you press play.</p>
        <p>If your device asks for reduced motion, the site turns off its animations and shows everything in place.</p>
        <p>The 3D room planner has keyboard controls (left and right arrows, N for the next wall) and reports every result in plain text. Browsers without WebGL get the same results in writing.</p>
      </PolicySection>
      <PolicySection title="Standards">
        <p>We aim for WCAG 2.2 level AA and test each release with automated checks and with a keyboard and screen reader.</p>
      </PolicySection>
      <PolicySection title="Tell us what is in the way">
        <p>
          If any part of this site is hard to use, or you would like information in another format, call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${brand.email}`} className="link">
            {brand.email}
          </a>
          . A person answers, and we fix what we can quickly.
        </p>
      </PolicySection>
    </Policy>
  );
}
