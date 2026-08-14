import { Metadata } from "next";
import { SiteHeader } from "@/features/landing/components/SiteHeader";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { TrustedBy } from "@/features/landing/components/TrustedBy";
import { AdvancedFeatures } from "@/features/landing/components/AdvancedFeatures";
import { ProductShowcase } from "@/features/landing/components/ProductShowcase";
import { Timeline } from "@/features/landing/components/Timeline";
import { EnterpriseFeatures } from "@/features/landing/components/EnterpriseFeatures";
import { Testimonials } from "@/features/landing/components/Testimonials";
import { Pricing } from "@/features/landing/components/Pricing";
import { FAQ } from "@/features/landing/components/FAQ";
import { CTA } from "@/features/landing/components/CTA";
import { SiteFooter } from "@/features/landing/components/SiteFooter";

export const metadata: Metadata = {
  title: "Identify | Enterprise Event Management",
  description: "A premium SaaS platform for managing events, registrations, QR codes, guests, check-ins, scanners, and analytics.",
  openGraph: {
    title: "Identify | Enterprise Event Management",
    description: "A premium SaaS platform for managing events, registrations, QR codes, guests, check-ins, scanners, and analytics.",
    url: "https://identify.com",
    siteName: "Identify",
    images: [
      {
        url: "https://identify.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Identify Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Identify | Enterprise Event Management",
    description: "Premium enterprise event management platform.",
    images: ["https://identify.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://identify.com",
  },
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Identify",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Premium enterprise event management platform.",
    "url": "https://identify.com",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex min-h-screen flex-col overflow-hidden bg-zinc-50 relative selection:bg-black selection:text-white">
        <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
        
        <div className="relative z-10">
          <HeroSection />
          <TrustedBy />
          <AdvancedFeatures />
          <ProductShowcase />
          <Timeline />
          <EnterpriseFeatures />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
