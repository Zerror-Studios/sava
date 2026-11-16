import type { Metadata } from "next";
import LegalDocument, { ContactEmail, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

const description = `The terms that apply when you shop with ${siteConfig.name}.`;

export const metadata: Metadata = createMetadata({ title: "Terms of Service", description, path: "/terms-of-service" });

// PLACEHOLDER COPY — the client will replace this text with their reviewed terms of service.
const sections: LegalSection[] = [
  {
    id: "about-these-terms",
    title: "About these terms",
    paragraphs: [
      `These terms apply when you use the ${siteConfig.name} website and buy from our store. By placing an order you agree to them, so please read them carefully.`,
    ],
  },
  {
    id: "orders",
    title: "Orders and pricing",
    paragraphs: [
      "All prices are shown in Indian rupees and include applicable taxes unless stated otherwise. Your order is confirmed once payment has been received and we've sent you a confirmation email.",
      "We may cancel an order if a product is out of stock or a price was shown in error; if we do, you'll get a full refund.",
    ],
  },
  {
    id: "your-account",
    title: "Your account",
    paragraphs: [
      "You're responsible for keeping your password safe and for activity on your account. Let us know straight away if you think someone else has used it.",
    ],
  },
  {
    id: "product-use",
    title: "Using our products",
    paragraphs: [
      "Our products are for external use only. Please read the label before use, patch-test if you have sensitive skin, and stop using a product if irritation occurs.",
    ],
  },
  {
    id: "liability",
    title: "Our liability",
    paragraphs: [
      `Nothing in these terms limits your rights as a consumer under applicable law. Beyond those rights, ${siteConfig.name} is not liable for losses that weren't a foreseeable result of our breaking these terms.`,
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: [
      <>
        Questions about these terms? Write to us at <ContactEmail />.
      </>,
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalDocument title="Terms of Service" description={description} updated="November 2026" sections={sections} />
  );
}
