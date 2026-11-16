import { notFound } from "next/navigation";
import { getProduct } from "@/services/catalog";

/*
 * Checks the product exists before the page (and its loading.tsx skeleton) streams, so an unknown slug
 * answers a real 404 rather than a 200 with the not-found UI. getProduct is cached per request, so the
 * page reuses this read.
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getProduct(slug))) notFound();
  return children;
}
