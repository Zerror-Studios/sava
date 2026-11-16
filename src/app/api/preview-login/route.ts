import { NextResponse } from "next/server";
import { isPreviewPassword, PREVIEW_COOKIE, PREVIEW_COOKIE_MAX_AGE, previewToken } from "@/lib/preview-gate";

/** The coming-soon page's Login: checks the preview password and sets the preview cookie */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";

  if (!password || !(await isPreviewPassword(password))) {
    // Slows down guessing
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirect: "/home" });
  response.cookies.set(PREVIEW_COOKIE, await previewToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE,
  });
  return response;
}
