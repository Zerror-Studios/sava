"use client";

import { RiCheckLine, RiMailSendLine, RiTruckLine, RiUser3Line } from "@remixicon/react";
import { useOrder, useOrderConfirmation, useProductsByIds } from "@zcom/storefront-kit/client";
import Image from "next/image";
import { useMemo } from "react";
import OrderSummary from "@/components/checkout/OrderSummary";
import BlobButton from "@/components/ui/BlobButton";
import { ButtonLink } from "@/components/ui/Button";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Skeleton from "@/components/ui/Skeleton";
import Sparkle from "@/components/ui/Sparkle";
import { toAddress, toAsset } from "@/lib/zcom/adapters";
import type { Address, CartLine } from "@/types";

/** The band's kicker and line for each payment state (useOrderConfirmation) */
const statusCopy = {
  checking: { kicker: "Confirming your payment", line: "We're confirming your payment — this takes a moment." },
  paid: { kicker: "Payment successful", line: "Your order is confirmed — we've emailed your receipt and details." },
  unconfirmed: {
    kicker: "Payment being confirmed",
    line: "We haven't had the payment confirmation yet. It can take a few minutes — we'll email you as soon as it's in.",
  },
} as const;

const nextSteps = [
  { Icon: RiMailSendLine, title: "Confirmation on its way", body: "We've emailed your receipt and order details." },
  { Icon: RiTruckLine, title: "Packed with care", body: "We'll let you know as soon as it ships." },
  { Icon: RiUser3Line, title: "Track it anytime", body: "Follow the delivery from the Orders tab in your account." },
];

function AddressBlock({ title, address }: { title: string; address?: Address | null }) {
  if (!address) return null;
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line p-6 text-caption md:p-8">
      <h2 className="flex items-center gap-2 text-kicker text-accent">
        <Sparkle />
        {title}
      </h2>
      <p className="text-muted">
        <span className="font-medium text-ink">
          {address.firstname} {address.lastname}
        </span>
        <br />
        {[address.flat, address.addressline1, address.addressline2].filter(Boolean).join(", ")}
        <br />
        {address.city}, {address.states} {address.pincode}
        <br />
        {address.country} · {address.countryCode} {address.phone}
      </p>
    </div>
  );
}

/**
 * Thank-you page body (/checkout/thank-you?order=…). "Payment successful" only once the store says the
 * order is PAID (useOrderConfirmation, which also sends the ads purchase); a signed-in shopper also
 * sees the addresses and summary (useOrder).
 */
export default function OrderConfirmation({ orderId }: { orderId?: string }) {
  const { status } = useOrderConfirmation(orderId ?? null);
  const { order: zcomOrder, loading } = useOrder(orderId);
  const copy = statusCopy[status];

  const productIds = useMemo(
    () => (zcomOrder?.cart ?? []).map((line) => line?.productId).filter((id): id is string => Boolean(id)),
    [zcomOrder],
  );
  const { products } = useProductsByIds(productIds);

  const order = useMemo(() => {
    if (!zcomOrder) return null;
    const lines: CartLine[] = (zcomOrder.cart ?? []).flatMap((line) => {
      if (!line) return [];
      const product = products.find((p) => p._id === line.productId);
      const variant = product?.variants?.find((v) => v?._id === line.variantId);
      return [
        {
          productId: line.productId ?? "",
          variantId: line.variantId ?? null,
          // The product's name: the line's carries the choices too, which the summary shows on their own
          name: product?.name ?? line.name ?? "",
          qty: line.qty ?? 1,
          price: line.price ?? 0,
          finalPrice: line.finalPrice ?? line.price ?? 0,
          asset: line.asset?.path ? toAsset(line.asset) : null,
          variantDetail: {
            variantDetailId: line.variantId ?? undefined,
            selectedOptions: (variant?.optionValues ?? []).filter((v): v is string => Boolean(v)),
            variantPrice: line.price ?? 0,
          },
        },
      ];
    });
    const address = (a: typeof zcomOrder.shippingAddress) => (a ? toAddress({ _id: "", ...a }) : null);
    return {
      orderNo: zcomOrder.orderNo,
      shippingAddress: address(zcomOrder.shippingAddress),
      billingAddress: address(zcomOrder.billingAddress),
      cart: lines,
      totalprice: zcomOrder.totalprice ?? 0,
      totalDiscount: zcomOrder.totalDiscount,
      shippingAmount: zcomOrder.shippingAmount,
      // Tax is inside the line prices (incl. of all taxes); the order carries no separate tax figure
      taxAmount: null,
      orderPrice: zcomOrder.orderPrice,
      discountedPrice: zcomOrder.discountedPrice,
    };
  }, [zcomOrder, products]);

  return (
    <>
      {/* Celebration band on the brand gradient */}
      <section aria-labelledby="order-confirmed" className="relative isolate overflow-hidden bg-navy text-paper">
        <Image src="/images/home/hero-bg.png" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20" />
        <Frame tone="dark" className="py-section">
          <FrameRule tone="dark" />
          <div className="flex flex-col items-center gap-6 px-inset py-14 text-center md:py-20">
            <span aria-hidden="true" className="center size-16 rounded-full bg-mint text-navy">
              <RiCheckLine className="size-8" />
            </span>
            <p className="flex items-center gap-2 text-kicker text-mint">
              <Sparkle />
              {copy.kicker}
            </p>
            <h1 data-heading-effect id="order-confirmed" className="max-w-3xl">
              Thank you for your order
            </h1>
            <p data-reveal className="max-w-xl text-body-lg text-paper/80">
              {status === "paid" && order?.orderNo
                ? `Order ${order.orderNo} is confirmed — we've emailed your receipt.`
                : copy.line}
            </p>
            <div data-reveal className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <BlobButton href="/shop" tone="light">
                Continue shopping
              </BlobButton>
              <ButtonLink href="/account?tab=orders" variant="outline-light" size="lg">
                View orders
              </ButtonLink>
            </div>
          </div>
          <FrameRule tone="dark" />
        </Frame>
      </section>

      <Frame className="py-section">
        {(loading || order) && (
          // Revealed once the order is in (the attribute arrives with it), so the rise is the
          // addresses and summary, not the skeletons
          <div
            data-reveal={loading ? undefined : "stagger"}
            className="grid items-start gap-stack px-inset pb-section lg:grid-cols-[1fr_28rem]"
          >
            {loading ? (
              <>
                <Skeleton className="h-56 rounded-3xl" />
                <Skeleton className="h-96 rounded-3xl" />
              </>
            ) : (
              order && (
                <>
                  <div className="grid gap-grid md:grid-cols-2">
                    <AddressBlock title="Delivering to" address={order.shippingAddress} />
                    <AddressBlock title="Billing" address={order.billingAddress} />
                  </div>
                  <OrderSummary
                    lines={order.cart}
                    subtotal={order.totalprice}
                    discount={order.totalDiscount}
                    shipping={order.shippingAmount ?? 0}
                    tax={order.taxAmount}
                    total={order.orderPrice ?? order.discountedPrice ?? order.totalprice}
                  />
                </>
              )
            )}
          </div>
        )}

        <FrameRule />
        <h2 className="flex items-center justify-center gap-2 px-inset py-10 text-kicker text-accent">
          <Sparkle />
          What happens next
        </h2>
        <FrameRule />
        <ol data-reveal="stagger" className="grid gap-grid px-inset pt-10 md:grid-cols-3">
          {nextSteps.map(({ Icon, title, body }, i) => (
            <li key={title} className="flex flex-col gap-4 rounded-3xl bg-surface p-6 md:p-8">
              <span className="flex items-center justify-between">
                <span aria-hidden="true" className="center size-12 rounded-full bg-gradient-badge text-paper">
                  <Icon className="size-5" />
                </span>
                <span aria-hidden="true" className="text-caption font-medium text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-h4">{title}</span>
                <span className="text-caption text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Frame>
    </>
  );
}
