"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

type DynamicIslandProps = {
  showSkip: boolean;
  onSkip: () => void;
  onReload: () => void;
};

export default function DynamicIsland({
  showSkip,
  onSkip,
  onReload,
}: DynamicIslandProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const playedIntroRef = useRef(false);
  const hoverTweenRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const shell = shellRef.current;
      const content = contentRef.current;
      if (!shell || !content) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(content, { visibility: "visible", opacity: 0, y: 0 });
      const toW = Math.ceil(content.scrollWidth + 7);
      const toH = Math.ceil(Math.max(content.scrollHeight + 3, 26));

      if (reduced) {
        gsap.set(shell, {
          width: toW,
          height: toH,
          opacity: 1,
          clearProps: "scale,y,scaleX,scaleY,rotate",
        });
        gsap.set(content, { opacity: 1 });
        playedIntroRef.current = true;
        return;
      }

      if (playedIntroRef.current) {
        gsap.set(content, { opacity: 1 });
        gsap.to(shell, {
          width: toW,
          height: toH,
          duration: 0.45,
          ease: "power3.inOut",
        });
        return;
      }

      gsap.set(shell, {
        width: 40,
        height: 12,
        opacity: 0,
        y: 12,
        scale: 0.9,
      });
      gsap.set(content, { opacity: 0, y: 6 });

      const tl = gsap.timeline({
        onComplete: () => {
          playedIntroRef.current = true;
        },
      });

      tl.to(shell, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.32,
        ease: "power2.out",
      })
        .to(shell, {
          width: toW,
          height: toH,
          duration: 0.58,
          ease: "power3.inOut",
        })
        .to(
          content,
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            ease: "power2.out",
          },
          "-=0.1",
        );

      return () => {
        tl.kill();
        hoverTweenRef.current?.kill();
      };
    },
    { dependencies: [showSkip] },
  );

  const playHoverIn = () => {
    const shell = shellRef.current;
    if (!shell || !playedIntroRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    hoverTweenRef.current?.kill();
    hoverTweenRef.current = gsap
      .timeline()
      .to(shell, {
        scaleX: 1.12,
        scaleY: 0.88,
        rotate: -2,
        duration: 0.16,
        ease: "power2.out",
      })
      .to(shell, {
        scaleX: 0.94,
        scaleY: 1.1,
        rotate: 2,
        duration: 0.18,
        ease: "power2.inOut",
      })
      .to(shell, {
        scaleX: 1.06,
        scaleY: 1.06,
        rotate: 0,
        duration: 0.45,
        ease: "elastic.out(1, 0.45)",
      });
  };

  const playHoverOut = () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    hoverTweenRef.current?.kill();
    hoverTweenRef.current = gsap
      .timeline()
      .to(shell, {
        scaleX: 1.08,
        scaleY: 0.92,
        duration: 0.12,
        ease: "power2.in",
      })
      .to(shell, {
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
  };

  const playPress = () => {
    const shell = shellRef.current;
    if (!shell || !playedIntroRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    hoverTweenRef.current?.kill();
    gsap.to(shell, {
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 0.12,
      ease: "power2.in",
    });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4 sm:bottom-5">
      <div
        ref={shellRef}
        onMouseEnter={playHoverIn}
        onMouseLeave={playHoverOut}
        onMouseDown={playPress}
        onMouseUp={playHoverIn}
        className="dynamic-island pointer-events-auto cursor-pointer overflow-hidden rounded-full border border-white/10 bg-[#141414]/92 shadow-[0_6px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl"
        role="toolbar"
        aria-label="Demo controls"
      >
        <div
          ref={contentRef}
          className="flex h-full w-max items-center gap-0.5 whitespace-nowrap p-0.5"
        >
          {showSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="dynamic-island-btn group inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:px-3"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path
                  d="M5 4l10 8-10 8V4ZM19 5v14"
                  stroke="currentColor"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Skip
            </button>
          ) : null}

          {showSkip ? (
            <span className="h-3 w-px shrink-0 bg-white/15" aria-hidden="true" />
          ) : null}

          <button
            type="button"
            onClick={onReload}
            className="dynamic-island-btn group inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:px-3"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:rotate-[-40deg]"
            >
              <path
                d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9L21 9"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3 15"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 21v-6h6"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
