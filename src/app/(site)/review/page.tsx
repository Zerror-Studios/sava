import type { Metadata } from "next";
import ReviewLinkForm from "@/components/token/ReviewLinkForm";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Write a review", path: "/review", noIndex: true });

// The link from the review-request email: /review?token=… (the form strips the token from the URL)
export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return (
    <Frame className="py-section">
      <FrameRule />
      <PageHeader
        eyebrow="Your order"
        title="How did we do?"
        description="Rate what you bought — it takes a minute and helps others choose their scent."
        align="center"
        className="px-inset py-10"
      />
      <FrameRule />
      <div className="px-inset py-10 md:py-14">
        <div className="mx-auto w-full max-w-2xl">
          <ReviewLinkForm token={typeof token === "string" && token ? token : null} />
        </div>
      </div>
    </Frame>
  );
}
