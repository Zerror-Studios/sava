import type { Metadata } from "next";
import ReviewUnsubscribeStatus from "@/components/token/ReviewUnsubscribeStatus";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Review emails",
  path: "/review/unsubscribe",
  noIndex: true,
});

export default function ReviewUnsubscribePage() {
  return <ReviewUnsubscribeStatus />;
}
