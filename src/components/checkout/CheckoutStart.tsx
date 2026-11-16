"use client";

import { RiErrorWarningLine, RiShoppingBag3Line } from "@remixicon/react";
import { useCheckoutStart } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import StatusPanel from "@/components/checkout/StatusPanel";
import { zcomConfig } from "@/zcom.config";

/**
 * /checkout/start?products=<variantId>:<qty>,… (Meta's checkout URL): adds the link's products to the
 * bag, then opens checkout. Sold-out or archived ones are skipped.
 */
export default function CheckoutStart() {
  const router = useRouter();
  const state = useCheckoutStart(useSearchParams().get("products"));

  useEffect(() => {
    if (state.status === "ready") router.replace("/checkout");
  }, [state, router]);

  if (state.status === "error") {
    return (
      <StatusPanel
        icon={<RiErrorWarningLine className="size-8" />}
        tone="sale"
        kicker="Couldn't open checkout"
        title="That link didn't work"
        body={getErrorMessage(state.error, zcomConfig.errorMessages)}
        actions={[{ href: "/shop", label: "Go to the shop" }]}
      />
    );
  }

  return (
    <StatusPanel
      icon={<RiShoppingBag3Line className="size-8" />}
      kicker="One moment"
      title="Getting your bag ready"
      body="We're adding your products and opening checkout."
    />
  );
}
