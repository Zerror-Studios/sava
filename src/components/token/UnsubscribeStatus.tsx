"use client";

import { RiLoader4Line, RiMailCheckLine } from "@remixicon/react";
import { useUnsubscribePage } from "@zcom/storefront-kit/client";
import StatusPanel from "@/components/checkout/StatusPanel";

/**
 * /unsubscribe?email=…&token=… from a marketing email. The kit reads the link once and strips it from
 * the URL; the answer is always the same neutral copy, so it can't be used to look up addresses.
 */
export default function UnsubscribeStatus() {
  const state = useUnsubscribePage();

  // Keyed by state: the heading effect splits the h1 once, so a new state gets a fresh panel
  if (state === "working") {
    return (
      <StatusPanel
        key="working"
        icon={<RiLoader4Line className="size-8 animate-spin" />}
        kicker="One moment"
        title="Updating your preferences"
      />
    );
  }

  return (
    <StatusPanel
      key="done"
      icon={<RiMailCheckLine className="size-8" />}
      kicker="Email preferences"
      title="You're unsubscribed"
      body="You won't get marketing emails from SAVA any more. Order and delivery updates will still reach you."
      actions={[{ href: "/shop", label: "Continue shopping" }]}
    />
  );
}
