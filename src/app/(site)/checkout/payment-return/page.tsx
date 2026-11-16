import type { Metadata } from "next";
import PaymentReturn from "@/components/checkout/PaymentReturn";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Confirming your payment",
  path: "/checkout/payment-return",
  noIndex: true,
});

export default function PaymentReturnPage() {
  return <PaymentReturn />;
}
