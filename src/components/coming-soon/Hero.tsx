"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AskSavaDemo from "./AskSavaDemo";
import PreviewLogin from "./PreviewLogin";

export default function Hero({ unlocked }: { unlocked: boolean }) {
  const [demoKey, setDemoKey] = useState(0);

  return (
    <main className="relative z-10 mx-auto flex h-full w-full flex-col px-4 py-4 sm:px-8 sm:py-6">
      <header className="relative mb-4 flex shrink-0 items-center justify-center sm:mb-6">
        {/* Admin preview of the site under construction */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2">
          <PreviewLogin unlocked={unlocked} />
        </div>
        <Link href="/" aria-label="Sava home" className="cursor-pointer">
          <Image
            src="/Sava_Logo_transparent.png"
            alt="Sava"
            width={635}
            height={149}
            priority
            className="h-7 w-auto brightness-0 invert sm:h-10"
          />
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-x-hidden overflow-y-auto pb-16">
        <div className="hero-card w-full max-w-[560px] min-w-0 py-2">
          <AskSavaDemo key={demoKey} onRequestReload={() => setDemoKey((k) => k + 1)} />
        </div>
      </div>
    </main>
  );
}
