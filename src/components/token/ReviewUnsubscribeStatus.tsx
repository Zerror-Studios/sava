"use client";

import { RiLoader4Line, RiMailCheckLine } from "@remixicon/react";
import { useReviewUnsubscribePage } from "@zcom/storefront-kit/client";
import StatusPanel from "@/components/checkout/StatusPanel";

/**
 * /review/unsubscribe?email=…&token=… from a review-request email. Always the same neutral answer
 * (the kit reads the link once and strips it from the URL).
 */
export default function ReviewUnsubscribeStatus() {
  const state = useReviewUnsubscribePage();

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
      title="No more review requests"
      body="We won't email you asking to review your orders again. Order and delivery updates will still reach you."
      actions={[
        { href: "/shop", label: "Continue shopping" },
        { href: "/account", label: "Your account", variant: "outline" },
      ]}
    />
  );
}
