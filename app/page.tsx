import Image from "next/image";
import Hero from "@/components/Hero";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sava",
  url: "https://sava.com",
  logo: "https://sava.com/favicon.png",
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
      <Image
        src="/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center lg:object-left"
        aria-hidden="true"
      />
      <Hero />
    </div>
  );
}
