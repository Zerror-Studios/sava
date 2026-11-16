import { CONSENT_DEFAULT_SCRIPT } from "@zcom/storefront-kit/core";
import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "@/styles/globals.css";
import SiteLayout from "@/components/layout/SiteLayout";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/lib/fonts";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { createRootMetadata } from "@/lib/seo";

export const metadata: Metadata = createRootMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the consent script below stamps data-zcom-consent on <html> before React loads
    <html lang={siteConfig.language} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Zcom consent defaults (a returning shopper's stored choice) before any tag loads; a plain
            <script>, since next/script's beforeInteractive runs after the first paint */}
        <script id="zcom-consent" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly…) stamp attributes on <body> before React loads;
          this ignores attribute mismatches on <body> itself only, not on anything inside it */}
      <body suppressHydrationWarning>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}
