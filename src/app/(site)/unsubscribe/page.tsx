import type { Metadata } from "next";
import UnsubscribeStatus from "@/components/token/UnsubscribeStatus";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Unsubscribe", path: "/unsubscribe", noIndex: true });

export default function UnsubscribePage() {
  return <UnsubscribeStatus />;
}
