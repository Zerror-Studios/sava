"use client";

import { RiErrorWarningLine, RiLoader4Line, RiNotification3Line, RiTimeLine } from "@remixicon/react";
import { useBackInStockConfirmPage } from "@zcom/storefront-kit/client";
import StatusPanel from "@/components/checkout/StatusPanel";

const shop = { href: "/shop", label: "Continue shopping" };

/**
 * /back-in-stock/confirm?token=… — the link from the "confirm your alert" email. The kit reads the
 * token once and strips it from the URL, so "try again" means opening the email link again.
 */
export default function BackInStockConfirmStatus() {
  const state = useBackInStockConfirmPage();

  // Keyed by state: the heading effect splits the h1 once, so a new state gets a fresh panel
  switch (state) {
    case "working":
      return (
        <StatusPanel
          key={state}
          icon={<RiLoader4Line className="size-8 animate-spin" />}
          kicker="One moment"
          title="Confirming your alert"
        />
      );
    case "done":
      return (
        <StatusPanel
          key={state}
          icon={<RiNotification3Line className="size-8" />}
          kicker="Alert confirmed"
          title="You'll get an email when it's back"
          body="We'll write to you as soon as it's in stock again — one email, no spam."
          actions={[shop]}
        />
      );
    case "invalid":
      return (
        <StatusPanel
          key={state}
          tone="sale"
          icon={<RiErrorWarningLine className="size-8" />}
          kicker="Link expired"
          title="This link has expired"
          body="It may have been used already or replaced by a newer one. Ask for an alert again on the product page."
          actions={[shop]}
        />
      );
    default:
      // rate_limited / network_error: worth another go later
      return (
        <StatusPanel
          key={state}
          icon={<RiTimeLine className="size-8" />}
          kicker="Not confirmed yet"
          title="We couldn't confirm your alert"
          body="Something got in the way. Please open the link in your email again in a few minutes."
          actions={[shop]}
        />
      );
  }
}
