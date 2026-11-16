/*
 * Catalogue reads for Server Components, from the Zcom store through @zcom/storefront-kit/server.
 * Pages call these, never the API directly; the kit's data is turned into SAVA's own shapes by
 * src/lib/zcom/adapters.ts. React's cache() dedupes calls made by generateMetadata and the page in
 * one request.
 */
import {
  getCategories as kitGetCategories,
  getCategory as kitGetCategory,
  getProduct as kitGetProduct,
  getProducts as kitGetProducts,
  getProductsByIds as kitGetProductsByIds,
} from "@zcom/storefront-kit/server";
import { cache } from "react";
import { productContent } from "@/data/product-content";
import { toCategory, toProduct, toProductSummary } from "@/lib/zcom/adapters";
import type { Category, Product, ProductSummary } from "@/types";
import { isSoldOut } from "@/utils/product";

export const PAGE_SIZE = 12;

export interface ProductPage {
  products: ProductSummary[];
  totalCount: number;
}

const empty: ProductPage = { products: [], totalCount: 0 };

function logError(scope: string, error: unknown) {
  console.error(`[catalog] ${scope} failed:`, error instanceof Error ? error.message : error);
}

export const getProducts = cache(
  async ({ page = 1, limit = PAGE_SIZE }: { page?: number; limit?: number } = {}): Promise<ProductPage> => {
    try {
      const { products, totalCount } = await kitGetProducts({ limit, offset: (page - 1) * limit });
      return { products: products.map(toProductSummary), totalCount };
    } catch (error) {
      logError("getProducts", error);
      return empty;
    }
  },
);

/**
 * One published product by slug, or null (the page renders its 404). A gateway error is thrown, not
 * turned into null, so a blip shows the error page instead of a cached "not found".
 */
export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const product = await kitGetProduct(slug);
  return product ? toProduct(product) : null;
});

/** Products by slug, in the order given (missing ones skipped), topped up with the newest to `limit` */
export const getProductsBySlugs = cache(async (slugs: string[], limit = slugs.length): Promise<ProductSummary[]> => {
  try {
    const picked = (await kitGetProductsByIds({ slugs })).map(toProductSummary);
    if (picked.length >= limit) return picked.slice(0, limit);
    const { products } = await getProducts({ limit: limit * 2 });
    const rest = products.filter((p) => !picked.some((q) => q._id === p._id));
    return [...picked, ...rest].slice(0, limit);
  } catch (error) {
    logError("getProductsBySlugs", error);
    return (await getProducts({ limit })).products;
  }
});

/** A product for a page section (home hero, reviews): null on any error, so a gateway blip only hides that section */
export const findProduct = cache(async (slug: string): Promise<Product | null> => {
  try {
    return await getProduct(slug);
  } catch (error) {
    logError(`findProduct(${slug})`, error);
    return null;
  }
});

/** Products sharing the first category, for the product page's related carousel */
export const getRelatedProducts = cache(async (product: Product, limit = 8): Promise<ProductSummary[]> => {
  const slug = product.categories?.[0]?.slug;
  const pool = slug ? (await getCategoryProducts(slug))?.products : (await getProducts()).products;
  return (pool ?? []).filter((p) => p._id !== product._id).slice(0, limit);
});

/** A few products to suggest in an empty bag: in stock, in catalogue order */
export const getCartSuggestions = cache(async (limit = 3): Promise<ProductSummary[]> => {
  const { products } = await getProducts({ limit: limit * 3 });
  return products.filter((p) => !isSoldOut(p)).slice(0, limit);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const { categories } = await kitGetCategories({ limit: 50 });
    return categories.map(toCategory);
  } catch (error) {
    logError("getCategories", error);
    return [];
  }
});

/** How many products a search looks through — the whole catalogue, at its current size */
const SEARCH_POOL = 100;

/**
 * The shop's search (/shop?q=): products whose name, scent or tagline (src/data/product-content.ts)
 * contains every word of the term, case-insensitive, a page at a time. The scent and tagline live
 * only in this project, so the catalogue is fetched and matched here — move this to the API's
 * `search` filter if the range outgrows SEARCH_POOL.
 */
export const searchProducts = cache(async (term: string, page = 1): Promise<ProductPage> => {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const { products } = await getProducts({ limit: SEARCH_POOL });
  const matches = products.filter((p) => {
    const content = productContent[p.slug];
    const text = [p.name, content?.scent, content?.tagline].filter(Boolean).join(" ").toLowerCase();
    return words.every((word) => text.includes(word));
  });
  const offset = (page - 1) * PAGE_SIZE;
  return { products: matches.slice(offset, offset + PAGE_SIZE), totalCount: matches.length };
});

export const getCategoryProducts = cache(
  async (slug: string, page = 1): Promise<(ProductPage & { category: Category }) | null> => {
    try {
      const category = await kitGetCategory(slug);
      if (!category) return null;
      const { products, totalCount } = await kitGetProducts({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        filters: { categoryIds: [category._id] },
      });
      return { category: toCategory(category), products: products.map(toProductSummary), totalCount };
    } catch (error) {
      logError(`getCategoryProducts(${slug})`, error);
      return null;
    }
  },
);
