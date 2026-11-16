import { permanentRedirect } from "next/navigation";

// The footer's "Terms & Condition" link (legalNav) points here
export default function TermsPage() {
  permanentRedirect("/terms-of-service");
}
