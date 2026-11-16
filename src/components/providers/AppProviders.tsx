"use client";

import { ZcomProvider, ZcomTags } from "@zcom/storefront-kit/client";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Toaster from "@/components/ui/Toaster";
import { GlobalAnimations } from "@/lib/global";
import { toast } from "@/store/toast-store";
import { zcomConfig } from "@/zcom.config";

/*
 * ZcomProvider (@zcom/storefront-kit) holds the store's Apollo client, the shopper's session and the
 * guest bag; every cart, account and checkout hook reads from it. ZcomTags loads GA4, Meta Pixel and
 * Google Ads from the store's settings once the shopper's consent allows them.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ZcomProvider config={zcomConfig} onStoreUnavailable={() => toast.error("This store isn't available right now.")}>
      <ZcomTags />
      <GlobalAnimations />
      <SmoothScroll>{children}</SmoothScroll>
      <Toaster />
    </ZcomProvider>
  );
}
