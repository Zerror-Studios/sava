import { defineZcomConfig, resolveConfig } from "@zcom/storefront-kit/core";
import { siteConfig as brand } from "@/config/site";

/*
 * Zcom store facts the backend has no public query for (kit README §2). The store itself is chosen
 * by NEXT_PUBLIC_TENANT_DOMAIN; prices, payment and shipping come from the backend.
 */
export const zcomConfig = defineZcomConfig({
  storeName: brand.name,
  logoUrl: "https://www.savaclub.co/favicon.png",
  defaultCurrency: brand.currency,
  locale: brand.language,
  itemIdFrom: "variantId",
  socialLinks: Object.values(brand.socials).filter(Boolean),
});

/** For server code (metadata, JSON-LD) */
export const siteConfig = resolveConfig(zcomConfig);
