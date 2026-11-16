"use client";

import { useWishlist as useZcomWishlist } from "@zcom/storefront-kit/client";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

/*
 * The signed-in shopper's Zcom wishlist. Wishlists belong to accounts, so guests are asked to sign
 * in first. Every card shares the one query (Apollo dedupes it).
 */
export function useWishlist() {
  const wishlist = useZcomWishlist();

  async function toggle(productId: string) {
    if (wishlist.requiresLogin) {
      toast.info("Sign in to save products to your wishlist.");
      return;
    }
    try {
      const added = await wishlist.toggle(productId);
      if (added) toast.success("Saved to your wishlist");
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your wishlist."));
    }
  }

  return {
    isSaved: (productId: string) => wishlist.has(productId),
    toggle,
    busy: wishlist.pending,
  };
}
