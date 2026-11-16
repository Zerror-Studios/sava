"use client";

import {
  useAdsTracking,
  useCart as useZcomCart,
  useProductsByIds,
  type CartLine as ZcomCartLine,
} from "@zcom/storefront-kit/client";
import { useMemo } from "react";
import { toAsset } from "@/lib/zcom/adapters";
import { toast } from "@/store/toast-store";
import type { Cart, CartLine, VariantDetail } from "@/types";
import { errorMessage } from "@/utils/errors";

type ListedProduct = ReturnType<typeof useProductsByIds>["products"][number];

/** A Zcom cart line in the design's shape, with the product's slug and the variant's choices */
function toCartLine(line: ZcomCartLine, product: ListedProduct | undefined): CartLine {
  const variant = product?.variants?.find((v) => v?._id === line.variantId);
  const options = (variant?.optionValues ?? []).filter((v): v is string => Boolean(v));
  return {
    productId: line.productId ?? "",
    variantId: line.variantId ?? null,
    // The product's own name: the line's name also carries the choices ("… - 100ml / Pack of 02"), which
    // the design shows on their own line
    name: product?.name ?? line.name ?? "",
    qty: line.qty ?? 1,
    price: line.price ?? 0,
    finalPrice: line.finalPrice ?? line.price ?? 0,
    asset: line.asset?.path ? toAsset(line.asset) : null,
    variantDetail: line.variantId
      ? {
          variantDetailId: line.variantId,
          selectedOptions: options,
          variantPrice: line.price ?? 0,
          sku: line.sku ?? variant?.sku ?? null,
          // Only low stock is reported; it caps the quantity stepper
          trackInventory: variant?.availableQuantity != null,
          stockQuantity: variant?.availableQuantity ?? null,
        }
      : null,
    product: product ? { _id: product._id, name: product.name ?? "", slug: product.slug ?? product._id } : null,
  };
}

/*
 * The shopper's bag, through the Zcom kit: a guest bag (server-issued guest id) until sign-in, then
 * the account's, with the guest bag merged in. Keeps the shape the design's components were built on.
 */
export function useCart() {
  const zcom = useZcomCart();
  const ads = useAdsTracking();

  const productIds = useMemo(
    () => zcom.lines.map((line) => line.productId).filter((id): id is string => Boolean(id)),
    [zcom.lines],
  );
  const { products } = useProductsByIds(productIds);

  const lines = useMemo(() => {
    const byId = new Map(products.map((p) => [p._id, p]));
    return zcom.lines.map((line) => toCartLine(line, byId.get(line.productId ?? "")));
  }, [zcom.lines, products]);

  const cart = useMemo<Cart | null>(() => {
    if (!zcom.cart) return null;
    const { promotion } = zcom.cart;
    return {
      _id: zcom.cart._id,
      userId: zcom.cart.userId ?? null,
      guestId: zcom.cart.guestId ?? null,
      itemcount: zcom.cart.itemcount ?? 0,
      totalprice: zcom.cart.totalprice ?? 0,
      discountedPrice: zcom.cart.discountedPrice ?? null,
      totalDiscount: zcom.cart.totalDiscount ?? null,
      totalTax: zcom.cart.totalTax ?? null,
      isFreeShippingEnabled: zcom.cart.isFreeShippingEnabled ?? null,
      cart: lines,
      coupon: promotion
        ? { couponId: promotion.promotionId ?? null, couponCode: promotion.promotionCode ?? null }
        : null,
    };
  }, [zcom.cart, lines]);

  const ref = (line: CartLine) => ({ productId: line.productId, variantId: line.variantId ?? null });

  async function addItem(item: { productId: string; categoryId?: string; variant: VariantDetail }) {
    try {
      await zcom.addItem({ productId: item.productId, variantId: item.variant.variantDetailId ?? null, qty: 1 });
      // Meta / Google Ads add-to-cart (sent only with the shopper's ads consent); ids are variant ids
      ads.trackAddToCart({
        id: item.variant.variantDetailId ?? item.productId,
        quantity: 1,
        price: item.variant.variantPrice,
      });
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't add this to your bag."));
      return false;
    }
  }

  async function removeItem(line: CartLine, completely = true) {
    try {
      if (completely || line.qty <= 1) await zcom.removeLine(ref(line));
      else await zcom.setQuantity({ ...ref(line), qty: line.qty }, line.qty - 1);
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your bag."));
    }
  }

  async function increment(line: CartLine) {
    try {
      await zcom.setQuantity({ ...ref(line), qty: line.qty }, line.qty + 1);
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your bag."));
      return false;
    }
  }

  const decrement = (line: CartLine) => removeItem(line, line.qty <= 1);

  async function applyCoupon(couponCode: string) {
    try {
      await zcom.applyPromotion(couponCode);
      toast.success("Coupon applied");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "That coupon can't be used."));
      return false;
    }
  }

  async function removeCoupon() {
    try {
      await zcom.removePromotion();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return {
    cart,
    lines,
    count: zcom.itemCount,
    subtotal: cart?.totalprice ?? 0,
    loading: zcom.loading,
    busy: zcom.pending,
    addItem,
    removeItem,
    increment,
    decrement,
    applyCoupon,
    removeCoupon,
  };
}
