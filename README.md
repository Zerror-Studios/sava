# SAVA

Storefront for **SAVA**: Next.js (App Router) + TypeScript + Tailwind CSS v4. All catalogue, cart, account, checkout and order data comes from the **Zcom** store `sava`, through [`@zcom/storefront-kit`](https://github.com/Zerror-Studios/zcom-storefront-kit) (private; installed from a GitHub tag).

## Getting started

```bash
# .env.local (never committed): the variables below
npm install   # your own git login reads the private kit
npm run dev   # http://localhost:3000
```

| Variable                    | What it is                                                                   |
| --------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TENANT_DOMAIN` | The store's domain (`savaclub.co`): selects the Zcom store                   |
| `API_GATEWAY_URL`           | Zcom gateway, server only (`https://api.zerrorstudios.com`, or a local one)  |
| `EDGE_SHARED_SECRET`        | Signs the server's calls to the gateway; server only, required in production |
| `ZCOM_STORE_SLUG`           | `sava`, for the go-live identity check `/.well-known/zcom-store`             |
| `NEXT_PUBLIC_SITE_URL`      | Public URL of this site (canonical URLs, OG tags)                            |

Payment keys, currency, shipping and products come from the store (the Zcom dashboard), never from env.

**Hosting (AWS Amplify):** set the variables above plus the team's shared read-only `GITHUB_TOKEN` in the Amplify app's environment variables. `amplify.yml` uses the token to install the private kit, and writes the store variables (not the token) to `.env.production` before the build, because Amplify doesn't pass environment variables to the Next server at run time.

**Products:** `scripts/zcom/` holds the catalogue the store was loaded from (`sava-catalogue.json`, built from the design's demo data by `build-catalogue.mjs`) and the importer that loads it (`import-sava-products.mjs`, the kit's importer with Size × Pack prices): `node scripts/zcom/import-sava-products.mjs --gateway <url> --store sava --file scripts/zcom/sava-catalogue.json --public-dir ./public --media-folder Products` lists what it would create; add `--yes` to import (it asks for the store login).

**Coming soon:** `/` is the coming-soon page and every other route needs the preview password from `src/lib/preview-gate.ts` (the store's home page is `/home`). See `CLAUDE.md`.

## Scripts

| Command                       | Does                                                 |
| ----------------------------- | ---------------------------------------------------- |
| `npm run dev`                 | Dev server                                           |
| `npm run build` / `npm start` | Production build / serve it                          |
| `npm run typecheck`           | TypeScript, no emit                                  |
| `npm run lint`                | ESLint (Next core-web-vitals + TypeScript rules)     |
| `npm run format`              | Prettier, with Tailwind class sorting                |
| `npm run check`               | typecheck + lint + format check — run before pushing |

## Structure

```
src/
├── app/
│   ├── (coming-soon)/        "/" — the coming-soon page and its own root layout
│   ├── (site)/               The store (its own root layout), home at /home
│   │   ├── home/  about/  contact/
│   │   ├── shop/             (listing)/ — /shop (?category=, ?q=, ?page=); [slug]/ — product pages
│   │   ├── login/  signup/  register/  forgot-password/  reset-password/
│   │   ├── account/          Tabs: overview · orders · addresses · profile (?tab=)
│   │   ├── checkout/         Checkout → the store's payment app → thank-you/ (or payment-failed/);
│   │   │                     start/ (Meta's checkout link), payment-return/, success/
│   │   ├── orders/status/[token]/  pay/[token]/  — order status and payment links from emails
│   │   ├── unsubscribe/  back-in-stock/confirm/  review/  — email token pages
│   │   └── privacy-policy/  terms-of-service/  shipping-returns/  licences/
│   ├── api/                  waitlist (coming soon), preview-login, payments/return (Zcom kit)
│   ├── og/route.tsx          Generated 1200×630 social card
│   └── sitemap.ts  robots.ts  manifest.ts  icon.svg
├── components/               layout/ providers/ ui/ product/ sections/ auth/ account/ checkout/ coming-soon/
├── config/                   site.ts (brand, contact, SEO routes) · navigation.ts · shop.ts
├── services/catalog.ts       Server-side catalogue reads (Zcom kit → SAVA's shapes)
├── hooks/                    useCart, useAuth, useWishlist, useQuickAdd (Zcom kit inside, the design's API outside)
├── lib/zcom/adapters.ts      Zcom data → the types in src/types/zcommerce.ts
├── store/                    Zustand: cart drawer open/closed, toasts
├── zcom.config.ts            Store facts for the kit (name, currency, locale)
└── proxy.ts                  Coming-soon gate + the Zcom kit's proxy (/v1/graphql, /account guard)
```

## How data flows

- **Catalogue (SEO pages)** — Server Components call `src/services/catalog.ts`, which reads the Zcom store through `@zcom/storefront-kit/server` (signed edge headers) and turns the data into SAVA's shapes (`src/lib/zcom/adapters.ts`). Home and product pages re-read at most once a minute.
- **Cart, account, checkout** — Client Components use the kit's hooks through `useCart()` / `useAuth()` / `useWishlist()`, which keep the design's own API. The browser talks to the store through this site's `/v1/graphql` proxy; the session lives in memory with an HttpOnly refresh cookie.
- **Guests** get a server-issued guest bag, merged into the account on sign-in, and can check out without an account (when the store allows it).
- **Payment** — checkout reserves the stock and fixes the amount, then the store's payment app (set up in the Zcom dashboard) opens its own window; paid orders go to `/orders/status/<token>`, others to `/checkout/thank-you?order=…`.

## Design system

All in `src/styles/globals.css` — change tokens there, not in components.

- **Colours** `ink paper muted line surface accent sale success` → `text-ink`, `bg-surface`, `border-line`…
- **Spacing** `section stack grid gutter header` → `py-section`, `gap-stack`, `gap-grid`, `px-gutter`, `h-header`. Values step up at the `md` breakpoint.
- **Layout** `container` (max width + gutters), `section` (vertical rhythm), `center`, `cover`.
- **Type** h1–h6 have a responsive scale (base layer, so utilities override). Text utilities: `text-eyebrow`, `text-body-lg`, `text-body`, `text-caption`, `text-cta`. Fonts: `font-primary` (headings) and `font-secondary` (body), set in `src/lib/fonts.ts`.

## Launch checklist

- [ ] `src/config/site.ts`: name, tagline, description, contact, address, socials, keywords
- [ ] Brand fonts in `src/lib/fonts.ts`, colours in `globals.css`
- [ ] `src/app/icon.svg`, `public/logo.svg`, social card (`src/app/og/route.tsx` or a designed image)
- [ ] `next.config.ts`: narrow `images.remotePatterns` to the z-commerce asset host
- [ ] Production env vars set on the host (Vercel → Settings → Environment Variables)
- [ ] Delete `src/data/mock-products.ts` usage once the store is live (optional)
