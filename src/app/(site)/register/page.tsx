import { permanentRedirect } from "next/navigation";

// Older links and the kit's defaults use /register; the store's sign-up page is /signup
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  permanentRedirect(typeof next === "string" && next ? `/signup?next=${encodeURIComponent(next)}` : "/signup");
}
