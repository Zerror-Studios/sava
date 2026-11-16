import { buildSecurityHeaders } from "@zcom/storefront-kit/core";
import type { NextConfig } from "next";

// CSP and security headers from the Zcom kit: the platform media CDN, the payment apps, GA4/GTM and the
// Meta/Google ad tags are built in. 'unsafe-eval' and no HSTS in development.
const securityHeaders = buildSecurityHeaders({
  development: process.env.NODE_ENV !== "production",
  reportOnly: process.env.CSP_REPORT_ONLY === "true",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Product media comes from the Zcom media CDN (S3 behind it)
    remotePatterns: [
      { protocol: "https", hostname: "media.zerrorstudios.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
