"use client";

import { useResetPasswordPage } from "@zcom/storefront-kit/client";
import { DEFAULT_ERROR_MESSAGES } from "@zcom/storefront-kit/core";
import { useState } from "react";
import FormNotice from "@/components/token/FormNotice";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormAlert, TextField, formValues } from "@/components/ui/form";
import { zcomConfig } from "@/zcom.config";

/** Error keys that mean the link itself is spent: offer a new one instead of the form */
const LINK_ERRORS = new Set(["INVALID_RESET_TOKEN", "TOKEN_EXPIRED", "INVALID_TOKEN"]);

const messageFor = (key: string | null) => {
  const messages: Record<string, string> = { ...DEFAULT_ERROR_MESSAGES, ...zcomConfig.errorMessages };
  return (key && key !== "UNKNOWN" && messages[key]) || "Couldn't update your password. Please try again.";
};

/**
 * /reset-password?token=…&email=…: the kit reads the token once and strips it from the address bar.
 * `linkHasToken` comes from the server's view of the URL, so a link without a token shows the
 * expired-link state straight away (the kit's own `hasToken` is only known after the first effect).
 */
export default function ResetPasswordForm({ linkHasToken }: { linkHasToken: boolean }) {
  const { email, state, error, submit } = useResetPasswordPage();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (state === "done") {
    return (
      <div className="flex flex-col gap-5">
        <FormNotice>Your password has been updated. Sign in with your new password.</FormNotice>
        <ButtonLink href="/login" size="lg" fullWidth>
          Sign in
        </ButtonLink>
      </div>
    );
  }

  if (!linkHasToken || (state === "error" && error && LINK_ERRORS.has(error))) {
    return (
      <div className="flex flex-col gap-5">
        <FormNotice tone="info">
          This reset link is invalid or has expired. Links work once and for a limited time — please request a new one.
        </FormNotice>
        <ButtonLink href="/forgot-password" size="lg" fullWidth>
          Request a new link
        </ButtonLink>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);

    const found: Record<string, string> = {};
    if (v.password.length < 8) found.password = "Use at least 8 characters.";
    else if (v.password.length > 128) found.password = "Use at most 128 characters.";
    if (v.password !== v.confirmPassword) found.confirmPassword = "Passwords don't match.";
    setErrors(found);
    if (Object.keys(found).length) return;

    void submit(v.password);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {email && (
        <p className="text-caption text-muted">
          Choosing a new password for <span className="font-medium text-ink">{email}</span>
        </p>
      )}
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        error={errors.password}
        hint="At least 8 characters"
      />
      <TextField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />
      {state === "error" && <FormAlert>{messageFor(error)}</FormAlert>}
      <Button type="submit" size="lg" fullWidth loading={state === "saving"} className="mt-2">
        Update password
      </Button>
    </form>
  );
}
