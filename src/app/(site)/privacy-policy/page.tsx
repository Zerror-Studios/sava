import type { Metadata } from "next";
import LegalDocument, { ContactEmail, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

const description = `How ${siteConfig.name} collects, uses and protects your personal information.`;

export const metadata: Metadata = createMetadata({ title: "Privacy Policy", description, path: "/privacy-policy" });

// PLACEHOLDER COPY — the client will replace this text with their reviewed privacy policy.
const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: [
      "When you create an account, place an order or contact us, we collect the details you give us — your name, email address, phone number and delivery address.",
      "When you browse the store we also collect basic technical information, such as your device, browser and the pages you visit, to keep the site working well.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    paragraphs: [
      "We use your details to process and deliver your orders, send order and delivery updates, answer your questions and improve our products and store.",
      "We only send marketing emails if you've opted in, and every one of them has a link to unsubscribe.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing with others",
    paragraphs: [
      `${siteConfig.name} never sells your personal information. We share it only with the partners who help us run the store — payment providers, delivery companies and the platform that hosts our shop — and only as much as they need to do their job.`,
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    paragraphs: [
      "We use cookies to keep you signed in, remember your bag and understand how the store is used. You can clear or block cookies in your browser settings, though some parts of the store may not work without them.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    paragraphs: [
      "You can ask to see, correct or delete the personal information we hold about you at any time. Most of it can be updated directly from your account.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: [
      <>
        Questions about this policy or your data? Write to us at <ContactEmail />.
      </>,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return <LegalDocument title="Privacy Policy" description={description} updated="November 2026" sections={sections} />;
}
