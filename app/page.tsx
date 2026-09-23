import Image from "next/image";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="relative h-[100vh] max-h-[100vh] overflow-hidden bg-[#f0efe7]">
      <Image
        src="/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-center sm:object-left"
        aria-hidden="true"
      />
      <Hero />
    </div>
  );
}
