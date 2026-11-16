import { cookies } from "next/headers";
import Hero from "@/components/coming-soon/Hero";
import BackgroundRipple from "@/components/coming-soon/BackgroundRipple";
import { hasPreviewAccess, PREVIEW_COOKIE } from "@/lib/preview-gate";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sava",
  url: "https://www.savaclub.co",
  logo: "https://www.savaclub.co/favicon.png",
  description:
    "Sava is a clinical formula built to reduce sweat first, with a clean scent designed to stay clean — not cover anything up.",
};

export default async function Home() {
  // An admin who already entered the preview password gets "Enter site" instead of "Login"
  const unlocked = await hasPreviewAccess((await cookies()).get(PREVIEW_COOKIE)?.value);

  return (
    <div className="relative h-[100svh] max-h-[100svh] overflow-hidden bg-[#f0efe7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BackgroundRipple />
      <Hero unlocked={unlocked} />
    </div>
  );
}
