@AGENTS.md

# SAVA — working notes for Claude

Next.js App Router + TypeScript + Tailwind v4 storefront. All commerce data comes from the **Zcom** store `sava` through `@zcom/storefront-kit` (its README is in `node_modules/@zcom/storefront-kit/README.md`); this repo never stores products, carts or orders itself.

## Conventions

- **Pages stay thin.** `src/app/**/page.tsx` sets metadata (`createMetadata` / `createPageMetadata` from `src/lib/seo.ts`) and composes components. UI lives in `src/components/<area>/`.
- **Server first.** Catalogue data is fetched in Server Components through `src/services/catalog.ts` (kit server functions + `src/lib/zcom/adapters.ts`) — never call the API directly from a page. Client Components (`"use client"`) only where there's interaction: cart, auth, forms, checkout.
- **Zcom kit.** Use the kit's hooks (`@zcom/storefront-kit/client`) and documents (`@zcom/storefront-kit/graphql`), never copies. The design's hooks in `src/hooks/` (useCart, useAuth, useWishlist, useQuickAdd) wrap them and keep the shape the components use; add adapters in `src/lib/zcom/adapters.ts` rather than changing components. Variants are matched by their `selectedOptions` names (`findVariant`); the Zcom variant id travels as `variantDetailId` / `CartLine.variantId`. Errors: `errorMessage(error, fallback)` (`src/utils/errors.ts`, the kit's messages). Prices with `formatPrice` (store currency).
- **State.** Session, guest bag and cart are the kit's (`ZcomProvider` in `AppProviders`); check `useAuth().hydrated` (the kit's `isReady`) before trusting "signed out". Zustand only for UI: the cart drawer (`src/store/cart-store.ts`) and `toast.*` (`src/store/toast-store.ts`).
- **Styling.** Use tokens from `src/styles/globals.css` (`text-ink`, `bg-surface`, `py-section`, `px-gutter`, `gap-grid`, `container`…). Don't hard-code colours or add one-off spacing scales. One `h1` per page.
- **Type.** Fonts load in `src/lib/fonts.ts` (Inter Tight display, Inter text). Every piece of text takes a role from `globals.css` — `text-display`, `text-hero`, `text-h1`–`text-h6`, `text-lead`, `text-body-lg`, `text-body`, `text-caption`, `text-micro`, `text-kicker`, `text-eyebrow`, `text-cta`, `text-input`; h1–h6 elements get theirs by default. No raw sizes (`text-sm/lg/xl…`), no `font-bold`, no extra tracking/leading on a role — `font-medium` for emphasis, `tabular-nums` for prices and counts.
- **Real 404s.** A page that calls `notFound()` must not sit under a `loading.tsx` — the streamed loading state commits a 200 status before the page can 404. That's why the shop listing's skeleton lives in the `shop/(listing)/` route group rather than at `shop/loading.tsx`. `/shop/[slug]` checks the product in its `layout.tsx` (before `loading.tsx` streams); its pages render on the first visit and refresh every 60 s (`generateStaticParams` returns `[]`: prerendering every product at build hits the gateway's per-IP rate limit).
- **Product pages.** `/shop/[slug]` (link with `productHref`). The Size and Pack options get their own pickers (`productPickers` in `src/config/shop.ts`); `additionalInfo` becomes the accordion. Below the hero: `ProductStory`, `ProductInfoTabs`, `RelatedProducts` (`getRelatedProducts`). Listing cards sell `cardVariant` (every option's first choice) and swap to the `isHover` image on hover. Copy z-commerce doesn't carry — scent, tagline, rating, highlight rows — lives in `src/data/product-content.ts`, keyed by slug, and stays out of the JSON-LD.
- **Images** go through `next/image` with `mediaUrl()`; static files go in the matching `public/` folder (see `public/README.md`).
- **Animation.** Import from `@/lib/gsap` (plugins registered once) and use `useGSAP` with a scope. Wrap motion in `gsap.matchMedia()` with `prefers-reduced-motion: no-preference`. Scrollable overlays need `data-lenis-prevent`.

## Coming soon (under construction)

- Two root layouts: `src/app/(coming-soon)/` is `/` (its own fonts and `coming-soon.css`, components in `src/components/coming-soon/`, the waitlist form → `/api/waitlist`); `src/app/(site)/` is the store, whose home page is **`/home`**. Moving between them is a full page load. Store links to "Home" point at `/home`.
- `src/proxy.ts` sends every route except `/` back to `/` unless the preview cookie is set (the kit's `/v1/graphql`, `/.well-known/zcom-store` and `/api/payments/return` stay open), then runs the Zcom kit's proxy; robots.txt and sitemap.xml list only `/`.
- The coming-soon page's top-right **Login** asks for the preview password (`/api/preview-login`; the password is the constant in `src/lib/preview-gate.ts`), sets an httpOnly cookie (a hash of the password, 30 days) and opens `/home`.
- The waitlist's Google Sheets service account is written in `src/app/api/waitlist/route.ts` (owner's choice, no env vars).
- Unmatched URLs inside the store hit `(site)/[...missing]` → `(site)/not-found.tsx` (there's no top-level not-found with two root layouts).

## Before finishing a change

Run `npm run check` (typecheck + lint + Prettier) and fix what it reports.
