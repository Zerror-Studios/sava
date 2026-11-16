import { NextResponse, type NextRequest } from "next/server";
import { hasPreviewAccess, PREVIEW_COOKIE } from "@/lib/preview-gate";
import { SESSION_COOKIE } from "@/utils/session-cookie";

/*
 * Route guard (Next 16 "proxy", formerly middleware).
 *
 * 1. Under construction: without the preview cookie every route except "/" (the coming-soon page)
 *    goes back to "/". The admin unlocks the site with the preview password from the coming-soon
 *    page's Login button (src/lib/preview-gate.ts).
 * 2. Signed-out visitors are sent from /account to /login and back afterwards; signed-in ones skip
 *    the auth pages. The session cookie is only a hint — the account page still checks the real session.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname !== "/") {
    const unlocked = await hasPreviewAccess(request.cookies.get(PREVIEW_COOKIE)?.value);
    if (!unlocked) return NextResponse.redirect(new URL("/", request.url));
  }

  const signedIn = request.cookies.has(SESSION_COOKIE);

  if (pathname.startsWith("/account") && !signedIn) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/signup") && signedIn) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Every page and API route, except Next's build files, files with an extension (public/ assets,
  // robots.txt, sitemap.xml, icon.svg…) and the two APIs the coming-soon page itself calls
  matcher: ["/((?!_next/static|_next/image|api/waitlist|api/preview-login|.*\\..*).*)"],
};
