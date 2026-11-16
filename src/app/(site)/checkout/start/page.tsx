import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutStart from "@/components/checkout/CheckoutStart";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Checkout", path: "/checkout/start", noIndex: true });

export default function CheckoutStartPage() {
  return (
    <Suspense>
      <CheckoutStart />
    </Suspense>
  );
}
