"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, SplitText);

const PLACEHOLDER = "Describe what you want to create...";
const EMPTY_PLACEHOLDER = "Write a message...";
const TYPED_MESSAGE =
  "I sweat a lot, and when I apply perfume, the smell somehow gets even worse.";
const AI_RESPONSE =
  "That’s because perfume mainly masks odor instead of addressing the problem. SAVA is designed to help you stay fresh and tackle sweat-related odor.";
const AI_QUESTION = "Want me to build a solution for you?";
const USER_CONFIRM = "Yes, build it for me.";

const STATUS_PHRASES = ["Building sava.com"];
const FINALE_COMING_SOON = "coming soon...";
const FINALE_SAVA = "sava.com";
const STATUS_HOLD = 1.65;

function HandCursorIcon() {
  return (
    <svg width="36" height="40" viewBox="0 0 36 40" fill="none" aria-hidden="true">
      <path
        d="M12.5 18.5V8.75a2.25 2.25 0 0 1 4.5 0V16.5m0 0V6.75a2.25 2.25 0 0 1 4.5 0V16.5m0 0V8.25a2.25 2.25 0 0 1 4.5 0V19m0 0v-6.25a2.25 2.25 0 1 1 4.5 0v9.5c0 5.247-4.253 9.5-9.5 9.5h-1.382a9.5 9.5 0 0 1-6.715-2.785l-5.95-5.95a2.652 2.652 0 0 1 3.75-3.75l2.347 2.347"
        fill="#fff"
        stroke="#111"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

const STATUS_PAD_DESKTOP = { top: 16, bottom: 18, left: 24, right: 28 };
const STATUS_PAD_MOBILE = { top: 12, bottom: 14, left: 16, right: 18 };
const STATUS_RADIUS = 24;

function getStatusPad() {
  if (typeof window === "undefined") return STATUS_PAD_DESKTOP;
  return window.matchMedia("(max-width: 639px)").matches
    ? STATUS_PAD_MOBILE
    : STATUS_PAD_DESKTOP;
}

export default function AskSavaDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLParagraphElement>(null);
  const finaleTextRef = useRef<HTMLSpanElement>(null);
  const finaleCursorRef = useRef<HTMLSpanElement>(null);

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
      const status = statusRef.current;
      const statusText = statusTextRef.current;
      const sendBtn = sendRef.current;
      const hand = handRef.current;
      const finale = finaleRef.current;
      const finaleText = finaleTextRef.current;
      const finaleCursor = finaleCursorRef.current;
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
        !status ||
        !statusText ||
        !sendBtn ||
        !hand ||
        !finale ||
        !finaleText ||
        !finaleCursor ||
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

      const showFinaleState = () => {
        gsap.set(card, { display: "none", opacity: 0 });
        gsap.set(hand, { opacity: 0 });
        finaleText.textContent = FINALE_SAVA;
        gsap.set(finale, { display: "flex", opacity: 1 });
        gsap.set(finaleCursor, { opacity: 0 });
      };

      if (reduced) {
        showFinaleState();
        return;
      }

      textEl.textContent = PLACEHOLDER;
      gsap.set(textEl, { opacity: 1 });
      gsap.set(cursor, { opacity: 0 });
      gsap.set(hand, { opacity: 0, scale: 1 });
      gsap.set(status, { display: "none", opacity: 0 });
      gsap.set([user1, ai1, ai2, user2], { display: "none", opacity: 0 });
      gsap.set(thread, { marginBottom: 0 });
      composer.classList.remove("has-thread");
      finaleText.textContent = "";
      gsap.set(finale, { display: "flex", opacity: 1 });
      gsap.set(finaleCursor, { opacity: 0 });
      gsap.set(sendBtn, { opacity: 0.45, filter: "none", clearProps: "filter" });
      sendBtn.classList.remove("is-active");

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

      const clearComposerForTyping = () => {
        textEl.textContent = "";
        textEl.style.color = "#000000";
      };

      const split = SplitText.create(textEl, {
        type: "chars",
        charsClass: "placeholder-char",
      });

      gsap.set(split.chars, { opacity: 0, y: 0 });

      const tl = gsap.timeline();
      const typeState = { i: 0 };
      const aiState = { i: 0 };
      const questionState = { i: 0 };
      const confirmState = { i: 0 };
      let cursorBlink: gsap.core.Tween | null = null;
      let bubbleCursorBlink: gsap.core.Tween | null = null;
      let finaleCursorBlink: gsap.core.Tween | null = null;

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

      const startFinaleCursorBlink = () => {
        finaleCursorBlink?.kill();
        gsap.set(finaleCursor, { opacity: 1 });
        finaleCursorBlink = gsap.to(finaleCursor, {
          opacity: 0,
          duration: 0.45,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
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

      const appendStatusPhrases = () => {
        statusText.textContent = STATUS_PHRASES[0];
        gsap.set(statusText, { opacity: 1 });

        for (let i = 1; i < STATUS_PHRASES.length; i++) {
          const phrase = STATUS_PHRASES[i];
          tl.to({}, { duration: STATUS_HOLD })
            .to(statusText, { opacity: 0, duration: 0.22, ease: "power1.in" })
            .add(() => {
              statusText.textContent = phrase;
            })
            .to(statusText, { opacity: 1, duration: 0.28, ease: "power1.out" });
        }

        tl.to({}, { duration: STATUS_HOLD + 0.35 })
          .to(card, {
            opacity: 0,
            y: 12,
            scale: 0.97,
            duration: 0.55,
            ease: "power2.inOut",
          })
          .add(() => {
            gsap.set(card, { display: "none" });
            finaleText.textContent = "";
            startFinaleCursorBlink();
          });

        const comingSoonState = { i: 0 };
        const deleteState = { i: FINALE_COMING_SOON.length };
        const savaState = { i: 0 };

        tl.to(comingSoonState, {
          i: FINALE_COMING_SOON.length,
          duration: FINALE_COMING_SOON.length * 0.07,
          ease: "none",
          onUpdate: () => {
            finaleText.textContent = FINALE_COMING_SOON.slice(
              0,
              Math.round(comingSoonState.i),
            );
          },
        })
          .to({}, { duration: 0.55 })
          .to(deleteState, {
            i: 0,
            duration: FINALE_COMING_SOON.length * 0.045,
            ease: "none",
            onUpdate: () => {
              finaleText.textContent = FINALE_COMING_SOON.slice(
                0,
                Math.round(deleteState.i),
              );
            },
          })
          .to({}, { duration: 0.25 })
          .to(savaState, {
            i: FINALE_SAVA.length,
            duration: FINALE_SAVA.length * 0.08,
            ease: "none",
            onUpdate: () => {
              finaleText.textContent = FINALE_SAVA.slice(0, Math.round(savaState.i));
            },
          })
          .add(() => {
            startFinaleCursorBlink();
          });
      };

      // --- Conversation timeline ---
      tl.fromTo(
        card,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
      )
        .to(split.chars, {
          opacity: 1,
          duration: 0.35,
          stagger: 0.028,
          ease: "power1.out",
        })
        .to(split.chars, {
          keyframes: [
            { y: -10, duration: 0.35, ease: "sine.out" },
            { y: 0, duration: 0.35, ease: "sine.in" },
          ],
          stagger: 0.045,
        })
        .to(split.chars, {
          opacity: 0,
          duration: 0.25,
          stagger: 0.012,
          ease: "power1.in",
        })
        .add(() => {
          split.revert();
          clearComposerForTyping();
          setSendActive(true);
          startComposerCursorBlink();
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

      // Commit user message → right bubble (smooth height handoff, no crop)
      tl.add(() => {
        setSendActive(false);
        user1Text.textContent = TYPED_MESSAGE;
        gsap.set(user1, { display: "flex", opacity: 0, y: 10 });
        gsap.set(thread, {
          marginBottom: window.matchMedia("(max-width: 639px)").matches ? 8 : 12,
        });
        composer.classList.add("has-thread");
        // Grow to fit bubble + current input first so nothing clips
        growCard(0.4);
      })
        .to({}, { duration: 0.35 })
        .to(message, { opacity: 0, duration: 0.3, ease: "power1.in" })
        .to(
          user1,
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "<0.08",
        )
        .add(() => {
          // Lock height (visible overflow), swap to short placeholder, measure target
          const locked = card.offsetHeight;
          gsap.set(card, { height: locked });
          setComposerPlaceholder();
          gsap.set(card, { height: "auto" });
          card.dataset.settleH = String(card.offsetHeight);
          gsap.set(card, { height: locked });
        })
        .to(card, {
          height: () => Number(card.dataset.settleH),
          duration: 0.55,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(card, { height: "auto" });
            delete card.dataset.settleH;
          },
        })
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

      // Commit confirm → right bubble, then morph
      tl.add(() => {
        setSendActive(false);
        user2Text.textContent = USER_CONFIRM;
        gsap.set(user2, { display: "flex", opacity: 0, y: 8 });
        growCard();
      })
        .to(message, { opacity: 0, duration: 0.25, ease: "power1.in" })
        .to(
          user2,
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          "<0.05",
        )
        .add(() => {
          setComposerPlaceholder();
          growCard();
        })
        .to({}, { duration: 0.4 })
        // 1) Lock current size, then fade messages + buttons out
        .add(() => {
          const from = card.getBoundingClientRect();
          gsap.set(card, {
            width: from.width,
            height: from.height,
            minHeight: from.height,
            overflow: "hidden",
          });
          card.dataset.fromW = String(from.width);
          card.dataset.fromH = String(from.height);
          card.dataset.fromPadT = String(parseFloat(getComputedStyle(card).paddingTop));
          card.dataset.fromPadB = String(parseFloat(getComputedStyle(card).paddingBottom));
          card.dataset.fromPadL = String(parseFloat(getComputedStyle(card).paddingLeft));
          card.dataset.fromPadR = String(parseFloat(getComputedStyle(card).paddingRight));
          card.dataset.fromRadius = String(parseFloat(getComputedStyle(card).borderRadius));
        })
        .to(thread, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        })
        .to(
          composer,
          {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
          },
          "<",
        )
        .add(() => {
          // Hide content while size stays locked — no sudden jump
          gsap.set(thread, { display: "none" });
          gsap.set(composer, { display: "none" });
          gsap.set(message, { display: "none" });
          gsap.set(toolbar, { display: "none" });

          const pad = getStatusPad();
          statusText.textContent = STATUS_PHRASES[0];
          gsap.set(status, { display: "flex", opacity: 0, visibility: "hidden" });
          card.classList.add("is-status");

          // Measure target pill size off-screen of layout
          gsap.set(card, {
            width: "fit-content",
            height: "auto",
            minWidth: 0,
            minHeight: 0,
            paddingTop: pad.top,
            paddingBottom: pad.bottom,
            paddingLeft: pad.left,
            paddingRight: pad.right,
            borderRadius: STATUS_RADIUS,
          });
          const to = card.getBoundingClientRect();

          // Restore locked full size for smooth shrink
          gsap.set(card, {
            width: Number(card.dataset.fromW),
            height: Number(card.dataset.fromH),
            minHeight: Number(card.dataset.fromH),
            paddingTop: Number(card.dataset.fromPadT),
            paddingBottom: Number(card.dataset.fromPadB),
            paddingLeft: Number(card.dataset.fromPadL),
            paddingRight: Number(card.dataset.fromPadR),
            borderRadius: Number(card.dataset.fromRadius),
          });
          gsap.set(status, { visibility: "visible", opacity: 0 });

          card.dataset.toW = String(Math.ceil(to.width));
          card.dataset.toH = String(Math.ceil(to.height));
          card.dataset.padT = String(pad.top);
          card.dataset.padB = String(pad.bottom);
          card.dataset.padL = String(pad.left);
          card.dataset.padR = String(pad.right);
        })
        .to({}, { duration: 0.2 })
        // 2) Smoothly shrink empty input into status pill
        .to(card, {
          width: () => Number(card.dataset.toW),
          height: () => Number(card.dataset.toH),
          minHeight: () => Number(card.dataset.toH),
          paddingTop: () => Number(card.dataset.padT),
          paddingBottom: () => Number(card.dataset.padB),
          paddingLeft: () => Number(card.dataset.padL),
          paddingRight: () => Number(card.dataset.padR),
          borderRadius: STATUS_RADIUS,
          duration: 1.05,
          ease: "power3.inOut",
        })
        .to(
          status,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .add(() => {
          const lockedW = Number(card.dataset.toW);
          gsap.set(card, {
            width: "fit-content",
            height: "auto",
            minWidth: lockedW,
            minHeight: 0,
            overflow: "visible",
          });
          delete card.dataset.toW;
          delete card.dataset.toH;
          delete card.dataset.fromW;
          delete card.dataset.fromH;
          delete card.dataset.fromPadT;
          delete card.dataset.fromPadB;
          delete card.dataset.fromPadL;
          delete card.dataset.fromPadR;
          delete card.dataset.fromRadius;
          delete card.dataset.padT;
          delete card.dataset.padB;
          delete card.dataset.padL;
          delete card.dataset.padR;
        });

      appendStatusPhrases();

      return () => {
        cursorBlink?.kill();
        bubbleCursorBlink?.kill();
        finaleCursorBlink?.kill();
        tl.kill();
        split.revert();
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
        {/* Chat thread — grows with messages, scrolls on small screens */}
        <div ref={threadRef} className="chat-thread flex w-full min-w-0 flex-col gap-2 sm:gap-3">
          {/* User message 1 — right */}
          <div ref={user1Ref} className="w-full min-w-0 justify-end" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-br-md bg-[#FD7A35] px-2.5 py-1.5 text-[13px] leading-relaxed text-white sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={user1TextRef} />
            </div>
          </div>

          {/* Sava message 1 — left */}
          <div ref={ai1Ref} className="w-full min-w-0 justify-start" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-bl-md bg-[#f3f1eb] px-2.5 py-1.5 text-[13px] leading-relaxed text-[#1a1a1a] sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={ai1TextRef} />
              <span
                ref={ai1CursorRef}
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#1a1a1a] align-baseline opacity-0"
              />
            </div>
          </div>

          {/* Sava question — left */}
          <div ref={ai2Ref} className="w-full min-w-0 justify-start" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-bl-md bg-[#f3f1eb] px-2.5 py-1.5 text-[13px] leading-relaxed text-[#1a1a1a] sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={ai2TextRef} />
              <span
                ref={ai2CursorRef}
                className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[#1a1a1a] align-baseline opacity-0"
              />
            </div>
          </div>

          {/* User confirm — right */}
          <div ref={user2Ref} className="w-full min-w-0 justify-end" style={{ display: "none" }}>
            <div className="chat-bubble max-w-[92%] rounded-2xl rounded-br-md bg-[#FD7A35] px-2.5 py-1.5 text-[13px] leading-relaxed text-white sm:max-w-[88%] sm:px-3.5 sm:py-2 sm:text-[15px]">
              <span ref={user2TextRef} />
            </div>
          </div>
        </div>

        {/* Status pill (after morph) */}
        <div
          ref={statusRef}
          className="max-w-full min-w-0 items-center gap-2 sm:gap-3"
          style={{ display: "none" }}
        >
          <span className="status-sparkle inline-flex shrink-0">
            <SparkleIcon />
          </span>
          <span
            ref={statusTextRef}
            className="min-w-0 text-[13px] leading-snug tracking-[-0.01em] text-[#1a1a1a] sm:text-[16px]"
          />
        </div>

        {/* Composer */}
        <div ref={composerRef} className="composer w-full min-w-0 shrink-0">
          <p
            ref={messageRef}
            className="mb-2.5 min-h-[1.4em] break-words text-[13px] leading-relaxed sm:mb-3 sm:text-[16px] [&_.placeholder-char]:inline-block"
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

        <div
          ref={handRef}
          className="pointer-events-none absolute z-20 scale-75 drop-shadow-md sm:scale-100"
          style={{ opacity: 0 }}
        >
          <HandCursorIcon />
        </div>
      </div>

      <p
        ref={finaleRef}
        className="pointer-events-none absolute inset-x-0 hidden items-center justify-center px-3 font-finale text-[clamp(1.5rem,10vw,4.5rem)] uppercase leading-none tracking-[0.04em] text-white sm:px-2"
        aria-hidden="true"
      >
        <span ref={finaleTextRef} />
        <span
          ref={finaleCursorRef}
          className="ml-[0.08em] inline-block h-[0.82em] w-[0.07em] translate-y-[0.04em] bg-white"
          style={{ opacity: 0 }}
        />
      </p>
    </div>
  );
}
