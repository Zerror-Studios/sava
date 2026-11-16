import { redirect } from "next/navigation";

// The kit's standard success address: SAVA's thank-you page is /checkout/thank-you
export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  redirect(order ? `/checkout/thank-you?order=${encodeURIComponent(order)}` : "/checkout/thank-you");
}
