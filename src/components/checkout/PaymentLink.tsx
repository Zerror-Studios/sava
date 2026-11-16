"use client";

import { RiCheckLine, RiLockLine } from "@remixicon/react";
import { usePaymentLink } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/form";
import { zcomConfig } from "@/zcom.config";

/**
 * The Pay button of a payment link (/pay/[token]). Back from the payment window with ?confirm=1, it
 * checks the payment once. No analytics on this page.
 */
export default function PaymentLink({ token, paid }: { token: string; paid: boolean }) {
  const { state, error, pay, confirm } = usePaymentLink(token);
  const confirmAsked = useSearchParams().get("confirm") === "1";
  const confirmed = useRef(false);

  useEffect(() => {
    if (!confirmAsked || confirmed.current || paid) return;
    confirmed.current = true;
    void confirm();
  }, [confirmAsked, confirm, paid]);

  if (paid || state === "paid") {
    return (
      <p role="status" className="flex items-center justify-center gap-2 text-h5 text-success">
        <RiCheckLine aria-hidden="true" className="size-5" />
        Paid — thank you. We&apos;ve emailed your receipt.
      </p>
    );
  }

  const busy = state === "paying" || state === "verifying" || state === "redirecting";
  return (
    <div className="flex flex-col gap-3">
      {state === "failed" && error && (
        <FormAlert>
          {getErrorMessage({ graphQLErrors: [{ extensions: { reason: error } }] }, zcomConfig.errorMessages)}
        </FormAlert>
      )}
      <Button size="lg" fullWidth loading={busy} onClick={() => void pay()}>
        <RiLockLine aria-hidden="true" className="size-4" />
        {state === "verifying" ? "Confirming payment…" : "Pay now"}
      </Button>
      <p className="text-center text-caption text-muted">Payments are processed securely online.</p>
    </div>
  );
}
