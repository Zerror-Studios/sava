import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";
import AuthCard from "@/components/auth/AuthCard";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Forgot password", path: "/forgot-password", noIndex: true });

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Your account"
      title="Forgot password"
      description="Enter the email you shop with and we'll send you a link to choose a new password."
      footer={{ text: "Remembered it?", linkLabel: "Back to sign in", href: "/login" }}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
