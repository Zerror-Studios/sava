/*
 * Preview password for the site while it's under construction. "/" is the coming-soon page; the
 * admin enters this password from its Login button (/api/preview-login), which sets an httpOnly
 * cookie holding a hash of the password; src/proxy.ts lets requests with that cookie through.
 * Changing the password signs everyone out.
 *
 * Server only: never import this from a client component.
 */
export const PREVIEW_COOKIE = "sava_preview";

/** 30 days */
export const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const PREVIEW_PASSWORD = "Sava-WNtU-ve4R-MJAV";

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The cookie value for a password: a hash, so the password itself is never stored in the browser */
export function previewToken(password: string = PREVIEW_PASSWORD): Promise<string> {
  return sha256Hex(`sava-preview:${password}`);
}

/** Compares two equal-format strings without stopping at the first difference */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isPreviewPassword(password: string): Promise<boolean> {
  const [given, expected] = await Promise.all([previewToken(password), previewToken()]);
  return safeEqual(given, expected);
}

export async function hasPreviewAccess(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  return safeEqual(cookieValue, await previewToken());
}
