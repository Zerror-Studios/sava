"use client";

import { RiLockLine, RiShoppingBag3Line } from "@remixicon/react";
import { useAddresses, useAdsTracking, useCheckout, useStoreCheckoutOptions } from "@zcom/storefront-kit/client";
import { getErrorMessage, orderStatusPath } from "@zcom/storefront-kit/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AddressFields, { readAddress } from "@/components/checkout/AddressFields";
import OrderSummary from "@/components/checkout/OrderSummary";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, TextField, formValues } from "@/components/ui/form";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { toAddress } from "@/lib/zcom/adapters";
import { toast } from "@/store/toast-store";
import type { Address } from "@/types";
import { cn } from "@/utils/cn";
import { errorMessage } from "@/utils/errors";
import { zcomConfig } from "@/zcom.config";

/** Text for a checkout failure reason (OUT_OF_STOCK, SHIPPING_UNAVAILABLE, STORE_ORDERS_PAUSED…) */
const reasonMessage = (reason: string | null | undefined) =>
  getErrorMessage({ graphQLErrors: [{ extensions: { reason: reason ?? "UNKNOWN" } }] }, zcomConfig.errorMessages);

/*
 * Checkout through the Zcom kit: the details reserve the stock and fix the amount (useCheckout().start,
 * or startGuest for a shopper who isn't signed in), then the store's payment app opens its own window
 * (pay). A paid order goes to its status page; an unconfirmed one to the thank-you page.
 */
export default function CheckoutView() {
  const router = useRouter();
  const { cart, lines, loading, applyCoupon, removeCoupon } = useCart();
  const { user, isLoggedIn } = useAuth();
  const checkout = useCheckout();
  const { allowsGuest } = useStoreCheckoutOptions();
  const ads = useAdsTracking();
  const [sameBilling, setSameBilling] = useState(true);
  const [paying, setPaying] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const { addresses } = useAddresses();
  const saved = useMemo(() => addresses.map(toAddress), [addresses]);
  const chosen: Address | undefined = saved.find((a) => a._id === savedId) ?? saved.find((a) => a.primary) ?? saved[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cart) return;
    if (!isLoggedIn && !allowsGuest) {
      router.push("/login?next=/checkout");
      return;
    }
    const v = formValues(e.currentTarget);
    const shippingAddress = { ...readAddress(v, "shipping"), email: v.email };
    const billingAddress = sameBilling ? null : { ...readAddress(v, "billing"), email: v.email };
    const items = lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId ?? null,
      qty: line.qty,
    }));

    setPaying(true);
    try {
      ads.trackBeginCheckout(
        lines.map((line) => ({ id: line.variantId ?? line.productId, quantity: line.qty, price: line.price })),
        cart.discountedPrice || cart.totalprice,
      );
      // 1. Reserve the stock and fix the amount
      const session = isLoggedIn
        ? await checkout.start({ cartId: cart._id, lines: items, email: v.email, shippingAddress, billingAddress })
        : await checkout.startGuest({
            cartId: cart._id,
            lines: items,
            contact: {
              email: v.email,
              phone: shippingAddress.phone,
              firstName: shippingAddress.firstname,
              lastName: shippingAddress.lastname,
              acceptsMarketing: Boolean(v.newsletter),
            },
            shippingAddress,
            billingAddress,
          });
      if (!session) {
        toast.error(reasonMessage(checkout.error));
        setPaying(false);
        return;
      }
      // 2. Pay in the store's payment window
      const result = await checkout.pay();
      if (result.step === "paid" && result.statusToken) {
        router.replace(orderStatusPath(result.statusToken) ?? `/checkout/thank-you?order=${result.orderId}`);
      } else if (result.step === "paid" || result.step === "unconfirmed") {
        router.replace(`/checkout/thank-you?order=${result.orderId}`);
      } else if (result.step === "redirecting") {
        // The browser is leaving for the payment page
      } else if (result.step === "dismissed") {
        toast.info("Payment window closed. Your order is saved: press Pay now to try again.");
        setPaying(false);
      } else {
        toast.error(reasonMessage(result.reason));
        setPaying(false);
      }
    } catch (error) {
      toast.error(errorMessage(error, "Checkout failed. Please try again."));
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-stack lg:grid-cols-[1fr_28rem]" aria-busy="true" aria-label="Loading checkout">
        <Skeleton className="h-[32rem] rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  if (!cart || lines.length === 0) {
    return (
      <StatePanel
        icon={<RiShoppingBag3Line className="size-6" />}
        title="Your bag is empty"
        body="Add a stick or two and come back to check out."
      >
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
      </StatePanel>
    );
  }

  // Once reserved, the summary shows the amount charged (with shipping); until then the bag's estimate
  const pricing = checkout.pricing;
  const total = pricing?.total ?? (cart.discountedPrice || cart.totalprice);

  return (
    // A task flow, so just one rise each for the steps and the summary
    <form
      data-reveal="stagger"
      onSubmit={onSubmit}
      className="grid items-start gap-stack lg:grid-cols-[1fr_28rem] xl:gap-16"
    >
      <div className="flex flex-col gap-grid">
        <fieldset className={step}>
          <legend className="sr-only">Contact</legend>
          <StepTitle n={1} title="Contact">
            {!isLoggedIn && (
              <Link
                href="/login?next=/checkout"
                className="text-cta text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                Sign in
              </Link>
            )}
          </StepTitle>
          <TextField label="Email" name="email" type="email" autoComplete="email" defaultValue={user?.email} required />
          <Checkbox name="newsletter" label="Email me with news and offers" />
        </fieldset>

        <fieldset className={step}>
          <legend className="sr-only">Delivery address</legend>
          <StepTitle n={2} title="Delivery address" />
          {saved.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Saved addresses">
              {saved.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => setSavedId(a._id ?? null)}
                  aria-pressed={a._id === chosen?._id}
                  className="max-w-full truncate rounded-full border border-line px-4 py-2 text-caption transition-colors hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-paper"
                >
                  {a.addressType || a.city} — {a.addressline1}
                </button>
              ))}
            </div>
          )}
          <AddressFields
            prefix="shipping"
            defaults={
              chosen ?? { firstname: user?.firstName, lastname: user?.lastName, phone: user?.phoneNumber ?? "" }
            }
          />
        </fieldset>

        <fieldset className={step}>
          <legend className="sr-only">Billing address</legend>
          <StepTitle n={3} title="Billing address" />
          <Checkbox
            checked={sameBilling}
            onChange={(e) => setSameBilling(e.target.checked)}
            label="Same as delivery address"
          />
          {!sameBilling && <AddressFields prefix="billing" />}
        </fieldset>

        <PayButton paying={paying} className="hidden lg:flex" />
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
        <OrderSummary
          lines={lines}
          subtotal={pricing?.subtotal ?? cart.totalprice}
          discount={pricing?.discount ?? cart.totalDiscount}
          shipping={pricing?.shipping}
          tax={pricing?.tax ?? cart.totalTax}
          total={total}
          coupon={{ code: cart.coupon?.couponCode, onApply: applyCoupon, onRemove: removeCoupon }}
        />
        <PayButton paying={paying} className="flex lg:hidden" />
      </div>
    </form>
  );
}

const step = "flex min-w-0 flex-col gap-5 rounded-3xl border border-line p-5 md:p-8";

/** Numbered step heading inside a checkout fieldset (the legend itself stays visually hidden) */
function StepTitle({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p aria-hidden="true" className="flex items-center gap-3 text-h4">
        <span className="center size-8 shrink-0 rounded-full bg-accent text-micro text-paper tabular-nums">{n}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function PayButton({ paying, className }: { paying: boolean; className?: string }) {
  return (
    <div className={cn("flex-col gap-3", className)}>
      <Button type="submit" size="lg" fullWidth loading={paying}>
        <RiLockLine aria-hidden="true" className="size-4" />
        Pay now
      </Button>
      <p className="text-center text-caption text-muted">Payments are processed securely online.</p>
    </div>
  );
}

/** Centred card for the empty / not-connected states */
function StatePanel({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-reveal
      className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-3xl bg-surface px-6 py-14 text-center md:px-12"
    >
      <span aria-hidden="true" className="center size-14 rounded-full bg-paper text-accent">
        {icon}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-h3">{title}</h2>
        <p className="text-body text-muted">{body}</p>
      </div>
      {children}
    </div>
  );
}
