"use client";

import { RiLoader4Line } from "@remixicon/react";
import { usePaymentReturn } from "@zcom/storefront-kit/client";
import { orderStatusPath } from "@zcom/storefront-kit/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StatusPanel from "@/components/checkout/StatusPanel";

/**
 * /checkout/payment-return: where the payment provider sends the shopper back (through
 * /api/payments/return). Checks the payment, then opens the order status page, the thank-you page,
 * the payment-failed page, or the payment link it came from.
 */
export default function PaymentReturn() {
  const router = useRouter();
  const result = usePaymentReturn();

  useEffect(() => {
    if (!result) return;
    if (result.kind === "payment-link") {
      router.replace(`/pay/${result.token}${result.status === "FAILED" ? "" : "?confirm=1"}`);
      return;
    }
    if (result.status === "failed") {
      router.replace("/checkout/payment-failed");
      return;
    }
    const statusPage = result.status === "paid" ? orderStatusPath(result.statusToken) : null;
    router.replace(statusPage ?? `/checkout/thank-you${result.orderId ? `?order=${result.orderId}` : ""}`);
  }, [result, router]);

  return (
    <StatusPanel
      icon={<RiLoader4Line className="size-8 animate-spin" />}
      kicker="One moment"
      title="Confirming your payment"
      body="Please don't close this page."
    />
  );
}
