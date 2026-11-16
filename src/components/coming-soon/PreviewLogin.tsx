"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

/**
 * Top-right Login on the coming-soon page: the admin enters the preview password to see the site
 * while it's under construction (/api/preview-login sets the cookie, then /home opens). Already
 * unlocked admins get "Enter site" instead.
 */
export default function PreviewLogin({ unlocked }: { unlocked: boolean }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const buttonClass =
    "cursor-pointer rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:py-2";

  if (unlocked) {
    return (
      // /home uses the store's own root layout, so this is a full page load
      <Link href="/home" prefetch={false} className={buttonClass}>
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
      <button type="button" onClick={open} className={buttonClass}>
        Login
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="preview-login-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-[#f0efe7] p-6 text-[#011166] shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          // A click on the backdrop closes it
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <h2 id="preview-login-title" className="text-lg font-semibold">
              Admin preview
            </h2>
            <p className="text-sm opacity-70">The site is under construction. Enter the password to view it.</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "preview-login-error" : undefined}
              className="rounded-lg border border-[#011166]/25 bg-white px-3 py-2 text-base font-normal outline-none focus:border-[#011166] focus:ring-2 focus:ring-[#011166]/20"
            />
          </label>

          {error ? (
            <p id="preview-login-error" role="alert" className="text-sm text-[#b42318]">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !password}
              className="cursor-pointer rounded-full bg-[#011166] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#011166]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Checking…" : "View site"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
