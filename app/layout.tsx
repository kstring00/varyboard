import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontDisplay, fontSans } from "@/lib/fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StickyBuyBar } from "@/components/site/StickyBuyBar";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { brand } from "@/content/facts";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | Wall-mounted strength, mobility and balance training at home`,
    template: `%s | ${brand.name}`,
  },
  description:
    "The Vary Board is a patented wall-mounted training board designed by a physical therapist. Practice strength, mobility and balance exercises at home.",
  openGraph: { siteName: brand.name, type: "website", locale: "en_US", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${brand.name}: two boards mounted on a concrete wall` }] },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.legalName,
  alternateName: brand.name,
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  email: brand.email,
  telephone: brand.phone,
  contactPoint: [{ "@type": "ContactPoint", telephone: brand.phone, email: brand.email, contactType: "customer service", areaServed: "US" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays allowed on purpose (no maximumScale / userScalable=no).
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <MotionProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-teal-deep focus:px-5 focus:py-3 focus:text-white">
            Skip to content
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <StickyBuyBar />
        </MotionProvider>
      </body>
    </html>
  );
}
