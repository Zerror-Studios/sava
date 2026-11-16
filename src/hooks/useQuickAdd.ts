"use client";

import { useApolloClient } from "@apollo/client/react";
import { GetProductDocument } from "@zcom/storefront-kit/graphql";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { toProduct } from "@/lib/zcom/adapters";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import { findVariant, isOutOfStock, toVariantDetail } from "@/utils/product";

interface QuickAddItem {
  slug: string;
  productId: string;
  categoryId?: string;
  /** The choices of the variant to add ([] for a product without options) */
  selectedOptions: string[];
}

/**
 * Adds a listed product's variant to the bag and opens it (listing card, empty-bag suggestions).
 * It reads the product first, so the stock and variant are current.
 */
export function useQuickAdd() {
  const client = useApolloClient();
  const { addItem, busy } = useCart();
  const openCart = useCartStore((s) => s.open);
  const [loading, setLoading] = useState(false);

  const add = async ({ slug, productId, categoryId, selectedOptions }: QuickAddItem) => {
    setLoading(true);
    try {
      const { data } = await client.query({ query: GetProductDocument, variables: { slug } });
      const product = data?.getClientSideProductById ? toProduct(data.getClientSideProductById) : null;
      const variants = product?.variants ?? [];
      const variant = selectedOptions.length ? findVariant(variants, selectedOptions) : variants[0];
      if (!variant) {
        toast.info("That one isn't available right now.");
        return;
      }
      if (isOutOfStock(variant)) {
        toast.info("That one's sold out right now.");
        return;
      }
      const added = await addItem({ productId, categoryId, variant: toVariantDetail(variant) });
      if (added) openCart();
    } catch {
      toast.error("Couldn't add this one. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { add, loading, busy };
}
