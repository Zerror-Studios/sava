import type { Metadata } from "next";
import ResetPasswordForm from "@/components/account/ResetPasswordForm";
import AuthCard from "@/components/auth/AuthCard";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Reset password", path: "/reset-password", noIndex: true });

// The link from the reset email: /reset-password?token=…&email=… (the form strips both from the URL)
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthCard
      eyebrow="Your account"
      title="Choose a new password"
      description="Pick something you haven't used here before — at least 8 characters."
      footer={{ text: "Remembered it?", linkLabel: "Back to sign in", href: "/login" }}
    >
      <ResetPasswordForm linkHasToken={typeof token === "string" && token.length > 0} />
    </AuthCard>
  );
}
