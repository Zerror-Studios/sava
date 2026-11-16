import { getPaymentRequest } from "@zcom/storefront-kit/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PaymentLink from "@/components/checkout/PaymentLink";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { createMetadata } from "@/lib/seo";
import { formatDate, formatPrice } from "@/utils/format";

export const metadata: Metadata = createMetadata({ title: "Pay for your order", path: "/pay", noIndex: true });

// Never cached: the link's status changes when it's paid
export const dynamic = "force-dynamic";

/** A payment link the store sent: what it's for, the amount, and Pay */
export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const request = await getPaymentRequest(token);
  if (!request) notFound();

  const paid = request.status === "PAID";
  // EXPIRED, CANCELLED or SUPERSEDED (a newer link was sent)
  const closed = !paid && request.status !== "ACTIVE";

  return (
    <Frame className="py-section">
      <FrameRule />
      <PageHeader
        eyebrow={request.storeName ?? "Payment"}
        title={request.orderNo ? `Pay for order ${request.orderNo}` : "Pay for your order"}
        description={request.customerNote ?? undefined}
        align="center"
        className="px-inset py-10"
      />
      <FrameRule />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-inset py-10 md:py-14">
        <ul className="flex flex-col gap-3 rounded-3xl bg-surface p-6 text-caption md:p-8">
          {(request.lines ?? []).flatMap((line, i) =>
            line ? (
              <li key={`${line.name}-${i}`} className="flex items-baseline justify-between gap-4">
                <span>
                  <span className="text-h6">{line.name}</span>
                  <span className="block text-muted tabular-nums">
                    {[line.variant, `Qty ${line.quantity ?? 1}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="font-medium tabular-nums">{formatPrice(line.lineTotal)}</span>
              </li>
            ) : (
              []
            ),
          )}
          {request.moreLines ? <li className="text-muted">and {request.moreLines} more</li> : null}
          <li className="flex justify-between gap-4 border-t border-line pt-3 text-body font-medium tabular-nums">
            <span>Total</span>
            <span>{formatPrice(request.amount)}</span>
          </li>
        </ul>
        {closed ? (
          <p className="text-center text-body text-muted">
            This payment link is no longer active. Please contact the store.
          </p>
        ) : (
          <Suspense>
            <PaymentLink token={token} paid={paid} />
          </Suspense>
        )}
        {request.expiresAt && !paid && !closed && (
          <p className="text-center text-caption text-muted">Link valid until {formatDate(request.expiresAt)}</p>
        )}
      </div>
    </Frame>
  );
}
