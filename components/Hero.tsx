"use client";

import Image from "next/image";
import AskSavaDemo from "./AskSavaDemo";

export default function Hero() {
  return (
    <main className="relative z-10 mx-auto flex h-full w-full flex-col px-5 py-5 sm:px-8 sm:py-6">
      <header className="mb-5 flex shrink-0 items-center justify-center sm:mb-6">
        <Image
          src="/Sava_Logo_transparent.png"
          alt="Sava"
          width={635}
          height={149}
          priority
          className="h-8 w-auto brightness-0 invert sm:h-10"
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <div className="hero-card w-full min-w-0 max-w-[560px]">
          <AskSavaDemo />
        </div>
      </div>
    </main>
  );
}
