import type { Metadata } from "next";
import LegalDocument, { ContactEmail, type LegalSection } from "@/components/legal/LegalDocument";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

const description = `Delivery times, shipping charges and how to return an order from ${siteConfig.name}.`;

export const metadata: Metadata = createMetadata({
  title: "Shipping & Returns",
  description,
  path: "/shipping-returns",
});

// PLACEHOLDER COPY — the client will replace this text with their real shipping and returns policy.
const sections: LegalSection[] = [
  {
    id: "delivery",
    title: "Delivery",
    paragraphs: [
      "We ship across India. Orders are packed within 1–2 working days and usually arrive within 3–7 working days, depending on where you are.",
      "Once your order ships, we'll email you a tracking link so you can follow it to your door.",
    ],
  },
  {
    id: "shipping-charges",
    title: "Shipping charges",
    paragraphs: [
      "Shipping charges, if any, are shown in your bag before you pay. Any free-shipping offers running at the time are applied automatically at checkout.",
    ],
  },
  {
    id: "returns",
    title: "Returns",
    paragraphs: [
      "For hygiene reasons, opened or used products can't be returned. Unopened products in their original packaging can be returned within 7 days of delivery.",
    ],
  },
  {
    id: "damaged-items",
    title: "Damaged or wrong items",
    paragraphs: [
      "If something arrives damaged or isn't what you ordered, let us know within 48 hours of delivery with a photo of the item and its packaging, and we'll send a replacement or a full refund.",
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    paragraphs: [
      "Approved refunds go back to your original payment method within 5–7 working days of us receiving the return.",
    ],
  },
  {
    id: "contact",
    title: "Need help?",
    paragraphs: [
      <>
        For anything about a delivery or return, write to us at <ContactEmail /> with your order number.
      </>,
    ],
  },
];

export default function ShippingReturnsPage() {
  return (
    <LegalDocument title="Shipping & Returns" description={description} updated="November 2026" sections={sections} />
  );
}
