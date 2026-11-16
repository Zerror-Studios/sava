import { RiTruckLine } from "@remixicon/react";
import { getShipmentStatusLabel } from "@zcom/storefront-kit/core";
import { getOrderStatus } from "@zcom/storefront-kit/server";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import Sparkle from "@/components/ui/Sparkle";
import { createMetadata } from "@/lib/seo";
import { formatDate, formatPrice, humanize } from "@/utils/format";
import { mediaUrl } from "@/utils/media";

export const metadata: Metadata = createMetadata({ title: "Your order", path: "/orders/status", noIndex: true });

// Read on every visit (the status changes); the token is the shopper's key to the order
export const dynamic = "force-dynamic";

/**
 * The order status page the order emails link to (and checkout opens once a payment is confirmed).
 * Anyone with the link sees it, signed in or not; an unknown or expired link is a 404.
 */
export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderStatus(token);
  if (!order) notFound();

  const shipment = order.shipment;
  const shipmentLabel = getShipmentStatusLabel(shipment?.trackingStatus);
  const status = order.isCancelled
    ? "Cancelled"
    : (shipmentLabel ?? humanize(order.fulfillmentStatus || order.paymentStatus || "Processing"));
  const trackingUrl = shipment?.trackingUrl?.startsWith("https://") ? shipment.trackingUrl : null;

  const totals = [
    { label: "Subtotal", value: order.subtotal },
    order.discount ? { label: "Discount", value: -order.discount } : null,
    { label: "Shipping", value: order.shipping ?? 0 },
    order.tax && !order.pricesIncludeTax ? { label: "Tax", value: order.tax } : null,
  ].filter((row): row is { label: string; value: number } => Boolean(row));

  return (
    <Frame className="py-section">
      <FrameRule />
      <PageHeader
        eyebrow={order.placedAt ? `Placed ${formatDate(order.placedAt)}` : "Your order"}
        title={`Order ${order.orderNo ?? ""}`.trim()}
        align="center"
        className="px-inset py-10"
      />
      <FrameRule />
      <div
        data-reveal="stagger"
        className="grid items-start gap-stack px-inset py-10 md:py-14 lg:grid-cols-[1fr_28rem]"
      >
        <div className="flex flex-col gap-grid">
          <section
            aria-labelledby="order-status"
            className="flex flex-col gap-4 rounded-3xl border border-line p-6 md:p-8"
          >
            <h2 id="order-status" className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              Status
            </h2>
            <p className="flex items-center gap-3 text-h4">
              <RiTruckLine aria-hidden="true" className="size-5 text-accent" />
              {status}
            </p>
            {shipment?.courierName && (
              <p className="text-caption text-muted">
                {shipment.courierName}
                {shipment.awbCode ? ` · AWB ${shipment.awbCode}` : ""}
              </p>
            )}
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start text-cta text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                Track your parcel
              </a>
            )}
          </section>

          {order.shippingAddress && (
            <section
              aria-labelledby="order-address"
              className="flex flex-col gap-3 rounded-3xl border border-line p-6 text-caption md:p-8"
            >
              <h2 id="order-address" className="flex items-center gap-2 text-kicker text-accent">
                <Sparkle />
                Delivering to
              </h2>
              <p className="text-muted">
                <span className="font-medium text-ink">{order.shippingAddress.name}</span>
                <br />
                {order.shippingAddress.line}
                <br />
                {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </section>
          )}

          {order.store && (
            <p className="text-caption text-muted">
              Questions about this order? Write to {order.store.name ?? "us"}
              {order.store.email ? ` at ${order.store.email}` : ""}
              {order.store.phone ? ` or call ${order.store.phone}` : ""}.
            </p>
          )}
        </div>

        <section aria-labelledby="order-items" className="flex flex-col gap-5 rounded-3xl bg-surface p-6 md:p-8">
          <h2 id="order-items" className="text-h4">
            Your items
          </h2>
          <ul className="flex flex-col gap-4">
            {(order.lines ?? []).flatMap((line, i) =>
              line ? (
                <li key={`${line.name}-${i}`} className="flex gap-4 text-caption">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                    <Image
                      src={mediaUrl(line.imagePath)}
                      alt={line.name ?? ""}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-baseline justify-between gap-4">
                    <div>
                      <p className="text-h6">{line.name}</p>
                      <p className="text-muted tabular-nums">Qty {line.quantity ?? 1}</p>
                    </div>
                    <span className="text-body font-medium tabular-nums">
                      {formatPrice((line.unitPrice ?? 0) * (line.quantity ?? 1))}
                    </span>
                  </div>
                </li>
              ) : (
                []
              ),
            )}
          </ul>
          <dl className="flex flex-col gap-2 border-t border-line pt-5 text-caption tabular-nums">
            {totals.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-muted">{row.label}</dt>
                <dd>{row.value < 0 ? `−${formatPrice(-row.value)}` : formatPrice(row.value)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-body font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </Frame>
  );
}
