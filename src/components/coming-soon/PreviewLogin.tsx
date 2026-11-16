"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

/**
 * Top-right Login on the coming-soon page: the admin enters the preview password to see the site
 * while it's under construction (/api/preview-login sets the cookie, then /home opens). Already
 * unlocked admins get "Enter site" instead. The pop-up matches the Ask Sava card (AskSavaDemo):
 * the white card, the cream input row and the orange Send-style button.
 */

/** The orange button of the Ask Sava card (its Send / waitlist button) */
const ORANGE_BUTTON =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#FD7A35] px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD7A35] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-4";

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

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PreviewLogin({ unlocked }: { unlocked: boolean }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (unlocked) {
    return (
      // /home uses the store's own root layout, so this is a full page load
      <Link href="/home" prefetch={false} className={ORANGE_BUTTON}>
        Enter site
      </Link>
    );
  }

  function open() {
    setError("");
    setPassword("");
    dialogRef.current?.showModal();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/preview-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Wrong password. Try again." : "Couldn't log in. Try again.");
        setBusy(false);
        return;
      }
      router.push("/home");
    } catch {
      setError("Couldn't log in. Check your connection.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={open} className={ORANGE_BUTTON}>
        Login
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="preview-login-title"
        className="m-auto w-[calc(100%-2rem)] max-w-[480px] overflow-visible rounded-[20px] border border-[#e4e2dc] bg-white px-3 pt-3.5 pb-3 text-[#1a1a1a] shadow-[0_1px_2px_rgba(1,17,102,0.04)] backdrop:bg-black/40 backdrop:backdrop-blur-sm sm:rounded-[32px] sm:px-6 sm:pt-6 sm:pb-5"
        onClick={(event) => {
          // A click on the backdrop closes it
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <form onSubmit={onSubmit} className="flex w-full flex-col items-stretch gap-4 sm:gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 sm:gap-2.5">
              <span className="status-sparkle inline-flex shrink-0">
                <SparkleIcon />
              </span>
              <h2
                id="preview-login-title"
                className="text-[14px] leading-snug font-bold tracking-[-0.01em] text-[#1a1a1a] sm:text-[16px]"
              >
                Admin preview
              </h2>
            </div>
            {/* The Ask Sava card's toolbar icon button */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#4b5563] transition-colors hover:bg-[#faf9f6] sm:h-9 sm:w-9 sm:rounded-xl"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex w-full flex-col gap-3 sm:gap-3.5">
            <p className="text-[14px] leading-snug tracking-[-0.01em] text-[#1a1a1a] sm:text-[16px]">
              The site is under construction. Enter the password to view it.
            </p>

            <div className="flex w-full flex-col gap-2">
              {/* The waitlist's input row */}
              <div className="flex w-full items-center gap-2 rounded-2xl border border-[#e5e5e5] bg-[#faf9f6] p-1.5 focus-within:border-[#FD7A35]/60 sm:gap-2.5 sm:p-2">
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  disabled={busy}
                  placeholder="Enter password"
                  aria-label="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "preview-login-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[13px] text-[#1a1a1a] outline-none placeholder:text-[#9ca3af] disabled:opacity-60 sm:px-3 sm:text-[15px]"
                />
                <button type="submit" disabled={busy || !password} className={ORANGE_BUTTON}>
                  <SendIcon />
                  {busy ? "Checking…" : "Enter"}
                </button>
              </div>
              {error ? (
                <p id="preview-login-error" role="alert" className="px-1 text-[12px] text-red-600 sm:text-[13px]">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
}
