import type { Metadata } from "next";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Order confirmed",
  path: "/checkout/thank-you",
  noIndex: true,
});

// Checkout and the payment return send shoppers here: /checkout/thank-you?order=… (?orderId= still read)
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; orderId?: string }>;
}) {
  const { order, orderId } = await searchParams;
  return <OrderConfirmation orderId={order ?? orderId} />;
}
