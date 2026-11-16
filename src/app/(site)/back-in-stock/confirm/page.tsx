import type { Metadata } from "next";
import BackInStockConfirmStatus from "@/components/token/BackInStockConfirmStatus";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Back-in-stock alert",
  path: "/back-in-stock/confirm",
  noIndex: true,
});

export default function BackInStockConfirmPage() {
  return <BackInStockConfirmStatus />;
}
