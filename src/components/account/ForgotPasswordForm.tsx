"use client";

import { useAuth } from "@zcom/storefront-kit/client";
import { getErrorKey } from "@zcom/storefront-kit/core";
import { useState } from "react";
import FormNotice from "@/components/token/FormNotice";
import { Button } from "@/components/ui/Button";
import { FormAlert, TextField, formValues } from "@/components/ui/form";
import { errorMessage } from "@/utils/errors";

/**
 * /forgot-password: asks the Zcom backend to email a reset link. The answer is the same whether or
 * not the address has an account (no account lookup through this form); only a dropped connection or
 * the rate limit is shown as an error, since trying again later can fix those.
 */
export default function ForgotPasswordForm() {
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email } = formValues(e.currentTarget);
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      const key = getErrorKey(err);
      if (key === "NETWORK" || key === "RATE_LIMITED") setError(errorMessage(err));
      else setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <FormNotice>If an account exists for that email, we&apos;ve sent a reset link.</FormNotice>
        <p className="text-caption text-muted">
          The link works for a limited time. Can&apos;t see it? Check your spam folder, or try again in a few minutes.
        </p>
        <Button type="button" variant="outline" size="lg" fullWidth onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      {error && <FormAlert>{error}</FormAlert>}
      <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
        Send reset link
      </Button>
    </form>
  );
}
