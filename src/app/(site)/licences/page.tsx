import type { Metadata } from "next";
import LegalDocument, { ContactEmail, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

const description = `Trademarks, content and third-party licences used on the ${siteConfig.name} website.`;

export const metadata: Metadata = createMetadata({ title: "Licences", description, path: "/licences" });

// PLACEHOLDER COPY — the client will replace this text with their real licences and credits.
const sections: LegalSection[] = [
  {
    id: "trademarks",
    title: "Trademarks",
    paragraphs: [
      `${siteConfig.name}, the ${siteConfig.name} logo and our product names are trademarks of ${siteConfig.legalName}. Please don't use them without our written permission.`,
    ],
  },
  {
    id: "content",
    title: "Photography and content",
    paragraphs: [
      `All photography, video and copy on this website belong to ${siteConfig.legalName} or are used under licence, and may not be reproduced without permission.`,
    ],
  },
  {
    id: "third-party",
    title: "Third-party software",
    paragraphs: [
      "This website is built with open-source software, including Next.js, React and Remix Icon, each used under its own licence.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: [
      <>
        For licensing or permission requests, write to us at <ContactEmail />.
      </>,
    ],
  },
];

export default function LicencesPage() {
  return <LegalDocument title="Licences" description={description} updated="November 2026" sections={sections} />;
}
