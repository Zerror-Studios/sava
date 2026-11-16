/*
 * Zcom (kit) data → SAVA's own shapes (src/types/zcommerce.ts), so the design's components keep
 * reading the fields they were built on. Pure functions: safe on the server and in the browser.
 */
import type {
  AssetFieldsFragment,
  CategoryFieldsFragment,
  ProductCardFieldsFragment,
  ProductDetailFieldsFragment,
  VariantFieldsFragment,
} from "@zcom/storefront-kit/graphql";
import type { Address, Asset, Category, Product, ProductSummary, SeoMeta, Variant } from "@/types";

type Maybe<T> = T | null | undefined;
type KitAsset = Pick<AssetFieldsFragment, "path"> & Partial<AssetFieldsFragment>;

export function toAsset(asset: KitAsset): Asset {
  return {
    _id: asset._id ?? undefined,
    path: asset.path ?? "",
    // The design filters on "image…" / "video…"; Zcom sends IMAGE / VIDEO
    type: asset.type ? asset.type.toLowerCase() : "image",
    altText: asset.altText ?? null,
    isFeatured: asset.isFeatured ?? null,
    isHover: asset.isHover ?? null,
    isSizeGuide: asset.isSizeGuide ?? null,
  };
}

const toAssets = (assets: Maybe<Maybe<KitAsset>[]>) =>
  (assets ?? []).filter((a): a is KitAsset => Boolean(a?.path)).map(toAsset);

export function toVariant(variant: VariantFieldsFragment): Variant {
  const availability = variant.availability ?? null;
  return {
    _id: variant._id ?? undefined,
    selectedOptions: (variant.optionValues ?? []).filter((v): v is string => Boolean(v)),
    variantPrice: variant.price ?? 0,
    sku: variant.sku ?? undefined,
    // availableQuantity is only sent when stock is low; the design reads it as a quantity cap
    stockQuantity: variant.availableQuantity ?? null,
    trackInventory: variant.availableQuantity != null,
    stockStatus: availability === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "IN_STOCK",
    status: variant.status ?? null,
    visibility: true,
  };
}

const toVariants = (variants: Maybe<Maybe<VariantFieldsFragment>[]>) =>
  (variants ?? []).filter((v): v is VariantFieldsFragment => Boolean(v?._id)).map(toVariant);

function toOptions(options: ProductCardFieldsFragment["productOptions"]) {
  return (options ?? [])
    .filter((o): o is NonNullable<typeof o> => Boolean(o?.optionName))
    .map((o) => ({
      optionName: o.optionName ?? "",
      showInProductPageAs: o.showInProductPageAs ?? null,
      choices: (o.choices ?? [])
        .filter((c): c is NonNullable<typeof c> => Boolean(c?.name))
        .map((c) => ({ name: c.name ?? "", assetsId: (c.assetsId ?? []).filter((id): id is string => Boolean(id)) })),
    }));
}

const toCategoryRefs = (categories: ProductCardFieldsFragment["categories"]) =>
  (categories ?? [])
    .filter((c): c is NonNullable<typeof c> => Boolean(c?._id))
    .map((c) => ({ _id: c._id, name: c.name ?? "", slug: c.slug ?? "" }));

/** Lowest price among the variants (the card price) */
const fromPrice = (variants: Variant[]) => {
  const prices = variants.map((v) => v.variantPrice).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : null;
};

export function toProductSummary(product: ProductCardFieldsFragment): ProductSummary {
  const variants = toVariants(product.variants);
  return {
    _id: product._id,
    name: product.name ?? "",
    slug: product.slug ?? product._id,
    price: fromPrice(variants),
    discountedPrice: null,
    assets: toAssets(product.assets),
    // Zcom badges carry ids only (no public names), so no ribbon is shown
    ribbon: null,
    productOptions: toOptions(product.productOptions),
    variants,
    categoryIds: (product.categoryIds ?? []).filter((id): id is string => Boolean(id)),
  };
}

function toSeo(seo: ProductDetailFieldsFragment["seo"] | CategoryFieldsFragment["seo"]): SeoMeta | null {
  if (!seo) return null;
  return {
    title: seo.title ?? null,
    description: seo.description ?? null,
    keywords: (seo.keywords ?? []).filter((k): k is string => Boolean(k)),
    robots: seo.robots ?? null,
    og: seo.og
      ? { title: seo.og.title ?? null, description: seo.og.description ?? null, image: seo.og.image ?? null }
      : null,
  };
}

export function toProduct(product: ProductDetailFieldsFragment): Product {
  const summary = toProductSummary(product);
  return {
    ...summary,
    description: product.description ?? null,
    additionalInfo: (product.additionalInfo ?? [])
      .filter((i): i is NonNullable<typeof i> => Boolean(i?.title))
      .map((i) => ({ title: i.title ?? "", description: i.description ?? "" })),
    categories: toCategoryRefs(product.categories),
    status: (product.status as Product["status"]) ?? null,
    meta: toSeo(product.seo),
  };
}

/** A saved address (useAddresses) in the design's shape */
export function toAddress(address: {
  _id: string;
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  addressType?: string | null;
  flat?: string | null;
  addressline1?: string | null;
  addressline2?: string | null;
  landmark?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  city?: string | null;
  country?: string | null;
  states?: string | null;
  pincode?: string | null;
  primary?: boolean | null;
}): Address {
  return {
    _id: address._id,
    firstname: address.firstname ?? "",
    lastname: address.lastname ?? "",
    email: address.email ?? undefined,
    addressType: address.addressType ?? null,
    flat: address.flat ?? null,
    addressline1: address.addressline1 ?? "",
    addressline2: address.addressline2 ?? null,
    landmark: address.landmark ?? null,
    countryCode: address.countryCode ?? "+91",
    phone: address.phone ?? "",
    city: address.city ?? "",
    states: address.states ?? "",
    country: address.country ?? "",
    pincode: address.pincode ?? "",
    primary: address.primary ?? null,
  };
}

export function toCategory(category: CategoryFieldsFragment): Category {
  return {
    _id: category._id,
    name: category.name ?? "",
    slug: category.slug ?? category._id,
    imgsrc: category.imgsrc ?? null,
    description: category.description ?? null,
    meta: toSeo(category.seo),
  };
}
