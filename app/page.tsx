import Hero from "@/components/Hero";
import BackgroundRipple from "@/components/BackgroundRipple";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sava",
  url: "https://www.savaclub.co",
  logo: "https://www.savaclub.co/favicon.png",
  description:
    "Sava is a clinical formula built to reduce sweat first, with a clean scent designed to stay clean — not cover anything up.",
};

export default function Home() {
  return (
    <div className="relative h-[100svh] max-h-[100svh] overflow-hidden bg-[#f0efe7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BackgroundRipple />
      <Hero />
    </div>
  );
}
