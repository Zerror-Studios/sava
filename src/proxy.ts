import { createZcomMiddleware, hasSessionCookie } from "@zcom/storefront-kit/edge";
import { NextResponse, type NextRequest } from "next/server";
import { hasPreviewAccess, PREVIEW_COOKIE } from "@/lib/preview-gate";

/*
 * Route guard (Next 16 "proxy", formerly middleware).
 *
 * 1. "/" is the coming-soon page: served as is, without the store.
 * 2. The Zcom kit's own endpoints stay open (they only expose the store's public API): the same-origin
 *    GraphQL proxy /v1/graphql, the go-live identity check /.well-known/zcom-store, and the payment
 *    return the payment provider posts back to (/api/payments/return).
 * 3. Under construction: without the preview cookie every other route goes back to "/". The admin
 *    unlocks the site with the preview password from the coming-soon page's Login button
 *    (src/lib/preview-gate.ts).
 * 4. Then the Zcom kit: suspended-store page, /account needs a session (to /login?next=…), private
 *    pages noindex + no-store. Signed-in shoppers skip /login and /signup.
 */
const zcom = createZcomMiddleware({
  loginGuard: { paths: ["/account"] },
  privatePaths: ["/signup"],
  next: (request) => {
    const { pathname } = request.nextUrl;
    // The session cookie is a hint; the account page still checks the real session
    if ((pathname === "/login" || pathname === "/signup") && hasSessionCookie(request.headers.get("cookie"))) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    return undefined;
  },
});

const OPEN_PATHS = ["/v1/graphql", "/.well-known/zcom-store", "/api/payments/return"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") return NextResponse.next();
  if (OPEN_PATHS.includes(pathname)) return zcom(request);

  const unlocked = await hasPreviewAccess(request.cookies.get(PREVIEW_COOKIE)?.value);
  if (!unlocked) return NextResponse.redirect(new URL("/", request.url));

  return zcom(request);
}

export const config = {
  // Every page and API route, except Next's build files, files with an extension (public/ assets,
  // robots.txt, sitemap.xml, icon.svg…) and the two APIs the coming-soon page itself calls; plus the
  // kit's two endpoints
  matcher: [
    "/((?!_next/static|_next/image|api/waitlist|api/preview-login|.*\\.[a-z0-9]+$).*)",
    "/.well-known/zcom-store",
    "/v1/graphql",
  ],
};
