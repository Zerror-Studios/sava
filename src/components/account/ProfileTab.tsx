"use client";

import { useAuth, useProfile } from "@zcom/storefront-kit/client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, formValues } from "@/components/ui/form";
import { toast } from "@/store/toast-store";
import type { User } from "@/types";
import { errorMessage } from "@/utils/errors";

export default function ProfileTab({ user }: { user: User }) {
  const { update, updating: savingProfile } = useProfile();
  const { requestPasswordReset } = useAuth();
  const [savingPassword, setSavingPassword] = useState(false);

  async function onProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    try {
      // The profile query refreshes from the answer, so the page shows the new details
      await update({
        firstName: v.firstName,
        lastName: v.lastName,
        countryCode: v.countryCode,
        phoneNumber: v.phoneNumber,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your profile."));
    }
  }

  /*
   * Zcom has no "change password" for shoppers yet (only a reset by email), so this sends the
   * account's email a link to set the new password. Switch to a change-password call once the API has one.
   */
  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const v = formValues(form);
    if (v.newPassword.length < 8) return toast.error("Use at least 8 characters for the new password.");
    if (v.newPassword !== v.confirmPassword) return toast.error("New passwords don't match.");
    setSavingPassword(true);
    try {
      await requestPasswordReset(user.email);
      form.reset();
      toast.success(`For your security, we've emailed ${user.email} a link to confirm your new password.`);
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't change your password."));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid items-start gap-grid lg:grid-cols-2">
      <form
        onSubmit={onProfile}
        aria-labelledby="profile-details"
        className="flex flex-col gap-5 rounded-3xl border border-line p-5 md:p-8"
      >
        <h2 id="profile-details" className="text-h3">
          Your details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            name="firstName"
            defaultValue={user.firstName}
            autoComplete="given-name"
            required
          />
          <TextField
            label="Last name"
            name="lastName"
            defaultValue={user.lastName}
            autoComplete="family-name"
            required
          />
        </div>
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled
          hint="Contact us to change your email."
        />
        <div className="grid grid-cols-[5.5rem_1fr] gap-3">
          <TextField label="Code" name="countryCode" defaultValue={user.countryCode ?? "+91"} />
          <TextField
            label="Phone"
            name="phoneNumber"
            type="tel"
            defaultValue={user.phoneNumber ?? ""}
            autoComplete="tel-national"
          />
        </div>
        <Button type="submit" loading={savingProfile} className="mt-2 self-start">
          Save details
        </Button>
      </form>

      <form
        onSubmit={onPassword}
        aria-labelledby="profile-password"
        className="flex flex-col gap-5 rounded-3xl border border-line p-5 md:p-8"
      >
        <h2 id="profile-password" className="text-h3">
          Password
        </h2>
        <TextField
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <TextField
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters"
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <Button type="submit" variant="ink" loading={savingPassword} className="mt-2 self-start">
          Change password
        </Button>
      </form>
    </div>
  );
}
