"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import DynamicIsland from "./DynamicIsland";

gsap.registerPlugin(useGSAP);

const PLACEHOLDER = "Describe what you want to create...";
const EMPTY_PLACEHOLDER = "Write a message...";
const TYPED_MESSAGE =
  "I sweat a lot, and when I apply perfume, the smell somehow gets even worse.";
const AI_RESPONSE =
  "That’s because perfume mainly masks odor instead of addressing the problem. SAVA is designed to help you stay fresh and tackle sweat-related odor.";
const AI_QUESTION = "Want me to build a solution for you?";
const USER_CONFIRM = "Yes, build it for me.";

const BUILDING_LABEL = "Building savaclub.co";
const WAITLIST_LINE =
  "Coming soon. Join the waitlist and be the first to get Sava.";

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5v4.2M12 17.3v4.2M2.5 12h4.2M17.3 12h4.2M5.4 5.4l3 3M15.6 15.6l3 3M18.6 5.4l-3 3M8.4 15.6l-3 3"
        stroke="#E85A3C"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AskSavaDemo({
  onRequestReload,
}: {
  onRequestReload?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const buildingRef = useRef<HTMLDivElement>(null);
  const waitlistCtaRef = useRef<HTMLDivElement>(null);

  const user1Ref = useRef<HTMLDivElement>(null);
  const user1TextRef = useRef<HTMLSpanElement>(null);
  const ai1Ref = useRef<HTMLDivElement>(null);
  const ai1TextRef = useRef<HTMLSpanElement>(null);
  const ai1CursorRef = useRef<HTMLSpanElement>(null);
  const ai2Ref = useRef<HTMLDivElement>(null);
  const ai2TextRef = useRef<HTMLSpanElement>(null);
  const ai2CursorRef = useRef<HTMLSpanElement>(null);
  const user2Ref = useRef<HTMLDivElement>(null);
  const user2TextRef = useRef<HTMLSpanElement>(null);

  const [joined, setJoined] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");
  const [showSkip, setShowSkip] = useState(true);
  const skipHandlerRef = useRef<() => void>(() => {});
  const atWaitlistRef = useRef(false);

  const onWaitlistSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email !== "string" || !email.trim()) return;

    setWaitlistError("");
    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setWaitlistError(data.error || "Something went wrong. Try again.");
        return;
      }
      setJoined(true);
    } catch {
      setWaitlistError("Something went wrong. Try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = rootRef.current;
      const card = cardRef.current;
      const thread = threadRef.current;
      const composer = composerRef.current;
      const textEl = textRef.current;
      const cursor = cursorRef.current;
      const message = messageRef.current;
      const toolbar = toolbarRef.current;
      const sendBtn = sendRef.current;
      const hand = handRef.current;
      const waitlist = waitlistRef.current;
      const building = buildingRef.current;
      const waitlistCta = waitlistCtaRef.current;
      const user1 = user1Ref.current;
      const user1Text = user1TextRef.current;
      const ai1 = ai1Ref.current;
      const ai1Text = ai1TextRef.current;
      const ai1Cursor = ai1CursorRef.current;
      const ai2 = ai2Ref.current;
      const ai2Text = ai2TextRef.current;
      const ai2Cursor = ai2CursorRef.current;
      const user2 = user2Ref.current;
      const user2Text = user2TextRef.current;

      if (
        !root ||
        !card ||
        !thread ||
        !composer ||
        !textEl ||
        !cursor ||
        !message ||
        !toolbar ||
        !sendBtn ||
        !hand ||
        !waitlist ||
        !building ||
        !waitlistCta ||
        !user1 ||
        !user1Text ||
        !ai1 ||
        !ai1Text ||
        !ai1Cursor ||
        !ai2 ||
        !ai2Text ||
        !ai2Cursor ||
        !user2 ||
        !user2Text
      )
        return;

      const setSendActive = (active: boolean) => {
        if (active) {
          sendBtn.classList.add("is-active");
          gsap.to(sendBtn, { opacity: 1, duration: 0.28, ease: "power2.out" });
        } else {
          sendBtn.classList.remove("is-active");
          gsap.to(sendBtn, { opacity: 0.45, duration: 0.28, ease: "power2.out" });
        }
      };

      const setComposerPlaceholder = (text = EMPTY_PLACEHOLDER) => {
        textEl.textContent = text;
        textEl.style.color = "#6b7280";
        gsap.set(message, { opacity: 1 });
        gsap.set(cursor, { opacity: 0 });
      };

      const showWaitlistState = () => {
        gsap.set(hand, { opacity: 0 });
        gsap.set([user1, ai1, ai2, user2], { display: "none", opacity: 0 });
        gsap.set(thread, { display: "none", opacity: 0 });
        gsap.set(composer, { display: "none", opacity: 0 });
        gsap.set(waitlist, { display: "flex", opacity: 1 });
        gsap.set([building, waitlistCta], { opacity: 1, y: 0 });
        gsap.set(card, {
          height: "auto",
          overflow: "visible",
          clearProps: "width,minWidth,minHeight,padding,borderRadius",
        });
        card.removeAttribute("aria-hidden");
        atWaitlistRef.current = true;
        setShowSkip(false);
      };

      if (reduced) {
        showWaitlistState();
        skipHandlerRef.current = () => {};
        return;
      }

      atWaitlistRef.current = false;
      setShowSkip(true);

      textEl.textContent = "";
      textEl.style.color = "#6b7280";
      gsap.set(textEl, { opacity: 1 });
      gsap.set(cursor, { opacity: 0 });
      gsap.set(hand, { opacity: 0, scale: 1 });
      gsap.set(waitlist, { display: "none", opacity: 0 });
      gsap.set(building, { opacity: 0, y: 10 });
      gsap.set(waitlistCta, { opacity: 0, y: 10 });
      gsap.set(thread, { opacity: 1, display: "flex", marginBottom: 0 });
      gsap.set(composer, { opacity: 1, display: "block" });
      gsap.set([user1, ai1, ai2, user2], { display: "none", opacity: 0 });
      composer.classList.remove("has-thread");
      card.setAttribute("aria-hidden", "true");
      gsap.set(sendBtn, { opacity: 0.45, filter: "none", clearProps: "filter" });
      sendBtn.classList.remove("is-active");

      const clearComposerForTyping = () => {
        textEl.textContent = "";
        textEl.style.color = "#000000";
      };

      const tl = gsap.timeline();
      const placeholderState = { i: 0 };
      const typeState = { i: 0 };
      const aiState = { i: 0 };
      const questionState = { i: 0 };
      const confirmState = { i: 0 };
      let cursorBlink: gsap.core.Tween | null = null;
      let bubbleCursorBlink: gsap.core.Tween | null = null;

      const jumpToWaitlist = () => {
        if (atWaitlistRef.current) return;
        cursorBlink?.kill();
        bubbleCursorBlink?.kill();
        tl.kill();
        gsap.killTweensOf([
          card,
          thread,
          composer,
          hand,
          building,
          waitlistCta,
          waitlist,
          user1,
          ai1,
          ai2,
          user2,
        ]);
        showWaitlistState();
      };
      skipHandlerRef.current = jumpToWaitlist;

      const startComposerCursorBlink = () => {
        cursorBlink?.kill();
        gsap.set(cursor, { opacity: 1 });
        cursorBlink = gsap.to(cursor, {
          opacity: 0,
          duration: 0.45,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };

      const stopComposerCursorBlink = () => {
        cursorBlink?.kill();
        cursorBlink = null;
        gsap.to(cursor, { opacity: 0, duration: 0.15 });
      };

      const startBubbleCursorBlink = (el: HTMLElement) => {
        bubbleCursorBlink?.kill();
        gsap.set(el, { opacity: 1 });
        bubbleCursorBlink = gsap.to(el, {
          opacity: 0,
          duration: 0.45,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };

      const stopBubbleCursorBlink = (el?: HTMLElement | null) => {
        bubbleCursorBlink?.kill();
        bubbleCursorBlink = null;
        if (el) gsap.set(el, { opacity: 0 });
      };

      const growCard = (duration = 0.45) => {
        const fromH = card.offsetHeight;
        gsap.set(card, { height: "auto" });
        const toH = card.offsetHeight;
        gsap.set(card, { height: fromH });
        if (Math.abs(toH - fromH) < 1) {
          gsap.set(card, { height: "auto" });
          thread.scrollTop = thread.scrollHeight;
          return;
        }
        gsap.to(card, {
          height: toH,
          duration,
          ease: "power2.inOut",
          overwrite: "auto",
          onUpdate: () => {
            thread.scrollTop = thread.scrollHeight;
          },
          onComplete: () => {
            gsap.set(card, { height: "auto" });
            thread.scrollTop = thread.scrollHeight;
          },
        });
      };

      const moveHandToSend = () => {
        const btnRect = sendBtn.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        gsap.set(hand, {
          left: btnRect.left - cardRect.left + btnRect.width * 0.55,
          top: btnRect.top - cardRect.top + btnRect.height * 0.45,
          xPercent: -25,
          yPercent: -15,
          x: 0,
          y: 52,
          opacity: 0,
          rotate: -14,
          scale: 1,
        });
      };

      const appendSendClick = () => {
        tl.to(hand, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
        })
          .to(hand, {
            scale: 0.88,
            y: 4,
            duration: 0.14,
            ease: "power2.in",
          })
          .to(
            sendBtn,
            {
              scale: 0.94,
              duration: 0.14,
              ease: "power2.in",
            },
            "<",
          )
          .to(hand, {
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "power2.out",
          })
          .to(
            sendBtn,
            {
              scale: 1,
              duration: 0.2,
              ease: "power2.out",
            },
            "<",
          )
          .to(hand, {
            opacity: 0,
            y: 14,
            duration: 0.35,
            ease: "power1.in",
            delay: 0.25,
          });
      };

      // --- Conversation timeline ---
      tl.fromTo(
        card,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
      )
        .add(() => {
          startComposerCursorBlink();
        })
        .to(placeholderState, {
          i: PLACEHOLDER.length,
          duration: PLACEHOLDER.length * 0.028,
          ease: "none",
          onUpdate: () => {
            textEl.textContent = PLACEHOLDER.slice(0, Math.round(placeholderState.i));
          },
        })
        .to({}, { duration: 0.55 })
        .add(() => {
          clearComposerForTyping();
          setSendActive(true);
        })
        .to(typeState, {
          i: TYPED_MESSAGE.length,
          duration: TYPED_MESSAGE.length * 0.028,
          ease: "none",
          onUpdate: () => {
            textEl.textContent = TYPED_MESSAGE.slice(0, Math.round(typeState.i));
            growCard();
          },
        })
        .add(() => {
          stopComposerCursorBlink();
        })
        .to(sendBtn, {
          scale: 1.03,
          duration: 0.35,
          ease: "power2.out",
        })
        .to(sendBtn, { scale: 1, duration: 0.2, ease: "power2.inOut" })
        .add(moveHandToSend);

      appendSendClick();

      // Commit user message → clear input + bubble appears together (chat-like)
      tl.add(() => {
        setSendActive(false);
        setComposerPlaceholder();
        user1Text.textContent = TYPED_MESSAGE;
        gsap.set(user1, { display: "flex", opacity: 0, y: 10 });
        gsap.set(thread, {
          marginBottom: window.matchMedia("(max-width: 639px)").matches ? 8 : 12,
        });
        composer.classList.add("has-thread");
        growCard(0.45);
      })
        .to(user1, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" })
        // Sava reply → left bubble
        .add(() => {
          ai1Text.textContent = "";
          gsap.set(ai1, { display: "flex", opacity: 0, y: 8 });
          gsap.set(ai1Cursor, { opacity: 0 });
          growCard(0.4);
        })
        .to(ai1, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" })
        .add(() => {
          startBubbleCursorBlink(ai1Cursor);
        })
        .to(aiState, {
          i: AI_RESPONSE.length,
          duration: AI_RESPONSE.length * 0.022,
          ease: "none",
          onUpdate: () => {
            ai1Text.textContent = AI_RESPONSE.slice(0, Math.round(aiState.i));
            growCard();
          },
        })
        .add(() => {
          stopBubbleCursorBlink(ai1Cursor);
          growCard();
        })
        .to({}, { duration: 0.55 })
        // Sava question → left bubble
        .add(() => {
          ai2Text.textContent = "";
          gsap.set(ai2, { display: "flex", opacity: 0, y: 8 });
          gsap.set(ai2Cursor, { opacity: 0 });
          growCard();
        })
        .to(ai2, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" })
        .add(() => {
          startBubbleCursorBlink(ai2Cursor);
        })
        .to(questionState, {
          i: AI_QUESTION.length,
          duration: AI_QUESTION.length * 0.035,
          ease: "none",
          onUpdate: () => {
            ai2Text.textContent = AI_QUESTION.slice(0, Math.round(questionState.i));
            growCard();
          },
        })
        .add(() => {
          stopBubbleCursorBlink(ai2Cursor);
          growCard();
        })
        .to({}, { duration: 0.55 })
        // User confirm typing in composer
        .add(() => {
          clearComposerForTyping();
          setSendActive(true);
          startComposerCursorBlink();
        })
        .to(confirmState, {
          i: USER_CONFIRM.length,
          duration: USER_CONFIRM.length * 0.035,
          ease: "none",
          onUpdate: () => {
            textEl.textContent = USER_CONFIRM.slice(0, Math.round(confirmState.i));
            growCard();
          },
        })
        .add(() => {
          stopComposerCursorBlink();
        })
        .to({}, { duration: 0.35 })
        .add(moveHandToSend);

      appendSendClick();

      // Commit confirm → fade chat out, smoothly shrink into waitlist
      tl.add(() => {
        setSendActive(false);
        setComposerPlaceholder();
        user2Text.textContent = USER_CONFIRM;
        gsap.set(user2, { display: "flex", opacity: 0, y: 8 });
        growCard(0.4);
      })
        .to(user2, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
        .to({}, { duration: 0.55 })
        .add(() => {
          gsap.set(card, { height: card.offsetHeight, overflow: "hidden" });
        })
        .to([thread, composer], {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        })
        .add(() => {
          gsap.set(thread, { display: "none" });
          gsap.set(composer, { display: "none" });
          gsap.set(waitlist, { display: "flex", opacity: 1 });
          gsap.set(building, { opacity: 0, y: 10 });
          gsap.set(waitlistCta, { opacity: 0, y: 10 });
          card.removeAttribute("aria-hidden");

          const fromH = card.offsetHeight;
          gsap.set(card, { height: "auto" });
          card.dataset.settleH = String(card.offsetHeight);
          gsap.set(card, { height: fromH });
        })
        .to(card, {
          height: () => Number(card.dataset.settleH),
          duration: 0.7,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(card, { height: "auto", overflow: "visible" });
            delete card.dataset.settleH;
          },
        })
        .to(
          building,
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.35",
        )
        .add(() => {
          atWaitlistRef.current = true;
          setShowSkip(false);
        })
        .to({}, { duration: 0.2 })
        .to(waitlistCta, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });

      return () => {
        cursorBlink?.kill();
        bubbleCursorBlink?.kill();
        tl.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative flex w-full min-w-0 max-w-full items-center justify-center"
    >
      <div
        ref={cardRef}
        className="ask-sava-card relative mx-auto flex w-full min-w-0 max-w-full flex-col overflow-visible rounded-[20px] border border-[#e4e2dc] bg-white px-3 pb-3 pt-3.5 shadow-[0_1px_2px_rgba(1,17,102,0.04)] sm:rounded-[32px] sm:px-6 sm:pb-5 sm:pt-6"
        aria-hidden="true"
      >
        <div ref={threadRef} className="chat-thread flex w-full min-w-0 flex-col gap-2 sm:gap-3">
          <div ref={user1Ref} className="w-full min-w-0 justify-end" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-br-md bg-[#FD7A35] px-2.5 py-1.5 text-[13px] leading-relaxed text-white sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={user1TextRef} />
            </div>
          </div>

          <div ref={ai1Ref} className="w-full min-w-0 justify-start" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-bl-md bg-[#f3f1eb] px-2.5 py-1.5 text-[13px] leading-relaxed text-[#1a1a1a] sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={ai1TextRef} />
              <span
                ref={ai1CursorRef}
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#1a1a1a] align-baseline opacity-0"
              />
            </div>
          </div>

          <div ref={ai2Ref} className="w-full min-w-0 justify-start" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-bl-md bg-[#f3f1eb] px-2.5 py-1.5 text-[13px] leading-relaxed text-[#1a1a1a] sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={ai2TextRef} />
              <span
                ref={ai2CursorRef}
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#1a1a1a] align-baseline opacity-0"
              />
            </div>
          </div>

          <div ref={user2Ref} className="w-full min-w-0 justify-end" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-br-md bg-[#FD7A35] px-2.5 py-1.5 text-[13px] leading-relaxed text-white sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={user2TextRef} />
            </div>
          </div>
        </div>

        <div ref={composerRef} className="composer w-full min-w-0 shrink-0">
          <p
            ref={messageRef}
            className="mb-2.5 min-h-[1.4em] break-words text-[13px] leading-relaxed sm:mb-3 sm:text-[16px]"
          >
            <span ref={textRef} className="text-[#6b7280]" />
            <span
              ref={cursorRef}
              className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-black align-baseline opacity-0"
            />
          </p>

          <div ref={toolbarRef} className="flex w-full min-w-0 items-center justify-between gap-1.5 sm:gap-3">
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#4b5563] sm:h-9 sm:w-9 sm:rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.998 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#4b5563] sm:h-9 sm:w-9 sm:rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white text-[#4b5563] sm:flex">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="hidden h-9 items-center justify-center rounded-xl border border-[#e5e5e5] bg-white px-3.5 text-[13px] font-medium text-[#4b5563] sm:flex">
                Import
              </span>
            </div>

            <button
              ref={sendRef}
              type="button"
              tabIndex={-1}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#FD7A35] px-2.5 text-[12px] font-medium text-white sm:h-9 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-[13px]"
              style={{ backgroundColor: "#FD7A35", opacity: 0.45 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="send-label">Send</span>
            </button>
          </div>
        </div>

        {/* Waitlist replaces chat inside the same card */}
        <div
          ref={waitlistRef}
          className="flex w-full flex-col items-stretch gap-4 sm:gap-5"
          style={{ display: "none" }}
        >
          <div
            ref={buildingRef}
            className="inline-flex items-center gap-2 self-start sm:gap-2.5"
          >
            <span className="status-sparkle inline-flex shrink-0">
              <SparkleIcon />
            </span>
            <span className="text-[13px] leading-snug tracking-[-0.01em] text-[#1a1a1a] sm:text-[15px]">
              {BUILDING_LABEL}
            </span>
          </div>

          <div ref={waitlistCtaRef} className="flex w-full flex-col gap-3 sm:gap-3.5">
            <p className="text-[14px] leading-snug tracking-[-0.01em] text-[#1a1a1a] sm:text-[16px]">
              {WAITLIST_LINE}
            </p>

            {joined ? (
              <p className="text-[14px] text-[#4b5563] sm:text-[15px]">
                You’re on the list — we’ll be in touch.
              </p>
            ) : (
              <form
                onSubmit={onWaitlistSubmit}
                className="flex w-full flex-col gap-2"
              >
                <div className="flex w-full items-center gap-2 rounded-2xl border border-[#e5e5e5] bg-[#faf9f6] p-1.5 sm:gap-2.5 sm:p-2">
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    disabled={waitlistLoading}
                    placeholder="Enter your email"
                    className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[13px] text-[#1a1a1a] outline-none placeholder:text-[#9ca3af] disabled:opacity-60 sm:px-3 sm:text-[15px]"
                  />
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[#FD7A35] px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:h-10 sm:px-4"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {waitlistLoading ? "Sending…" : "Send"}
                  </button>
                </div>
                {waitlistError ? (
                  <p className="px-1 text-[12px] text-red-600 sm:text-[13px]">{waitlistError}</p>
                ) : null}
              </form>
            )}
          </div>
        </div>

        <div
          ref={handRef}
          className="pointer-events-none absolute z-20 isolate scale-75 sm:scale-100"
          style={{ opacity: 0 }}
        >
          <Image
            src="/pointinghand.webp"
            alt=""
            width={44}
            height={48}
            className="h-10 w-auto drop-shadow-md sm:h-11"
            aria-hidden="true"
            unoptimized
          />
        </div>
      </div>

      <DynamicIsland
        showSkip={showSkip}
        onSkip={() => skipHandlerRef.current()}
        onReload={() => onRequestReload?.()}
      />
    </div>
  );
}
