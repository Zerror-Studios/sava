import { notFound } from "next/navigation";

/*
 * The app has two root layouts ((coming-soon) and (site)), so there's no top-level not-found for
 * unmatched URLs. This catch-all sends them to (site)/not-found.tsx, inside the store's layout.
 */
export default function MissingPage() {
  notFound();
}
