import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { brand } from "@/content/facts";

export const metadata: Metadata = {
  title: "Contact | Call or message The Vary Board",
  description: `Questions about the Vary Board, an order, or the veteran and first responder discount? Call ${brand.phone}, email ${brand.email}, or send a message.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Contact" title="Talk to a person." intro="Questions before you order, help with an order, or the veteran and first responder discount. We are happy to help." />
      <section className="container-site grid gap-10 pb-20 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a href={brand.phoneHref} className="block rounded-2xl border border-line bg-white/60 p-6 no-underline transition-colors hover:border-teal-deep">
            <span className="eyebrow">Call</span>
            <span className="mt-1 block text-xl font-semibold text-teal-deep">{brand.phone}</span>
          </a>
          <a href={`mailto:${brand.email}`} className="block rounded-2xl border border-line bg-white/60 p-6 no-underline transition-colors hover:border-teal-deep">
            <span className="eyebrow">Email</span>
            <span className="mt-1 block break-all text-xl font-semibold text-teal-deep">{brand.email}</span>
          </a>
          <div className="rounded-2xl border border-line bg-white/60 p-6">
            <span className="eyebrow">Clinics</span>
            <p className="mt-1 text-lg text-ink-2">
              For clinic pricing or a demo, use the{" "}
              <Link href="/professionals#request" className="link">
                professionals form
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-soft md:p-6">
          <InquiryForm kind="contact" page="/contact" />
        </div>
      </section>
    </>
  );
}
