import type { Metadata } from "next";
import { Policy, PolicySection } from "@/components/ui/Policy";
import { brand } from "@/content/facts";

export const metadata: Metadata = {
  title: "Privacy policy | What we collect and why",
  description: "What information thevaryboard.com collects, how it is used, who processes it (Shopify for checkout, Vercel for hosting), and how to contact us about your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <Policy eyebrow="Privacy" title="Your information, kept simple." intro="We collect as little as we can, use it only to serve you, and never sell it." updated="September 20, 2026">
      <PolicySection title="What we collect">
        <p>When you send a message or request clinic pricing, we receive what you type into the form: your name, email address, phone number if you give it, your organization if you give it, and your message.</p>
        <p>When you buy, checkout happens on our Shopify store. Shopify collects your shipping address and payment details under its own privacy policy. We see your order details so we can ship it and help you afterwards. We never see your full card number.</p>
        <p>This website does not set advertising cookies. Our hosting provider (Vercel) keeps standard server logs, such as IP address and pages requested, to run and secure the site.</p>
      </PolicySection>
      <PolicySection title="How we use it">
        <p>To answer your message, fulfil and support your order, arrange clinic pricing or a demo when you ask for it, and apply discounts you are entitled to. We do not sell or rent your information, and we do not send marketing email unless you have asked for it.</p>
      </PolicySection>
      <PolicySection title="Who processes it">
        <p>Shopify (checkout and payments), Vercel (website hosting), our email and form delivery provider (to get your messages to us), and YouTube (the installation video, loaded only when you press play, using YouTube&apos;s privacy-enhanced embed).</p>
      </PolicySection>
      <PolicySection title="How long we keep it">
        <p>Order records for as long as tax and accounting rules require. Messages for as long as needed to help you, then deleted.</p>
      </PolicySection>
      <PolicySection title="Your choices">
        <p>
          You can ask what we hold about you, ask us to correct it, or ask us to delete it. Email{" "}
          <a href={`mailto:${brand.email}`} className="link">
            {brand.email}
          </a>{" "}
          or call{" "}
          <a href={brand.phoneHref} className="link">
            {brand.phone}
          </a>
          .
        </p>
      </PolicySection>
      <PolicySection title="Who we are">
        <p>
          {brand.legalName}, maker of {brand.name}. {brand.email} · {brand.phone}.
        </p>
      </PolicySection>
    </Policy>
  );
}
