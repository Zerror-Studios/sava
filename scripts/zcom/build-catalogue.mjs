// Builds scripts/zcom/sava-catalogue.json (the Zcom import file) from SAVA's demo catalogue
// (src/data/mock-products.ts): 4 sticks, Size × Pack variants with their own prices, the site's images.
// Run: node scripts/zcom/build-catalogue.mjs
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SIZES = ["100ml", "50ml"];
const PACKS = ["Pack of 01", "Pack of 02", "Pack of 04"];
/** ₹ for each pack, in PACKS order */
const PRICES = { "100ml": [335, 550, 850], "50ml": [225, 399, 699] };

const VIEWS = [
  ["front", "front"],
  ["angle", "three-quarter view"],
  ["back", "back, with the directions for use"],
  ["base", "lying down, showing the twist-up dial"],
];

const SHARED = [
  {
    path: "/images/products/shared/sava-lifestyle-holding.png",
    alt: "A smiling woman holding a SAVA stick, captioned “SAVA underarm care”",
    hover: true,
  },
  {
    path: "/images/products/shared/sava-very-local.png",
    alt: "A woman with her arm raised after a workout, captioned “Your antiperspirant is actually very local”",
  },
  {
    path: "/images/products/shared/sava-sweat-ducts.png",
    alt: "Cross-section of skin: SAVA works inside the sweat ducts where you apply it",
  },
  {
    path: "/images/products/shared/sava-less-sweat.png",
    alt: "Close-up of an underarm, captioned “Less sweat reaches the skin”",
  },
];

const KEY_INGREDIENTS =
  "A sweat-control complex with skin-conditioning botanical oils and time-release fragrance micro-capsules. Free from paraben preservatives, denatured alcohols and artificial dyes.";

const RANGES = [
  [
    "kinetic",
    {
      scent: "Silver Lining",
      benefits: "Advanced sweat control with a crisp, energising scent, made for days that don't slow down.",
      aroma: "bright citrus peel and cool mineral notes over a clean musk.",
    },
  ],
  [
    "balanced",
    {
      scent: "Citrus Tide",
      benefits:
        "SAVA combines effective sweat control and refined fragrance for lasting freshness, comfort and everyday confidence.",
      aroma: "sparkling bergamot and grapefruit over a soft sea-salt accord.",
    },
  ],
  [
    "renewed",
    {
      scent: "Forest Air",
      benefits: "Dual-action sweat and odour defence with a fresh, green scent that keeps you feeling reset all day.",
      aroma: "green fig leaf, crushed pine needles and vetiver.",
    },
  ],
  [
    "grounded",
    {
      scent: "Amber Wood",
      benefits: "Long-lasting sweat control wrapped in a warm, woody fragrance that stays close and steady.",
      aroma: "warm amber, cedarwood and a hint of spice on a smooth woody base.",
    },
  ],
];

const products = RANGES.map(([range, copy]) => {
  const name = `Sava ${range[0].toUpperCase()}${range.slice(1)}`;
  const [front, ...angles] = VIEWS.map(([view, shot], i) => ({
    path: `/images/products/${range}/sava-${range}-${view}.jpg`,
    alt: `${name} antiperspirant stick, ${shot}`,
    featured: i === 0,
    hover: false,
  }));
  return {
    slug: `sava-${range}`,
    name,
    category: "sticks",
    skuPrefix: `SAVA-${range.toUpperCase()}`,
    description: `${name} is built on one promise: to keep up with you. Its dual-action formula controls sweat and neutralises odour where they start, while ${copy.scent} — ${copy.aroma.replace(/\.$/, "")} — unfolds slowly through the day. It glides on clear and stays comfortable from the first commute to the last rep.`,
    options: [
      { name: "Size", values: SIZES },
      { name: "Pack", values: PACKS },
    ],
    variants: SIZES.flatMap((size) => PACKS.map((pack, i) => ({ values: [size, pack], price: PRICES[size][i] }))),
    additionalInfo: [
      { title: "Benefits", description: copy.benefits },
      { title: "Key Ingredients", description: KEY_INGREDIENTS },
      { title: "Aroma", description: `${copy.scent}: ${copy.aroma}` },
    ],
    // Gallery order as on the site: the front (featured), the shared images (the first is the hover image), the other angles
    images: [front, ...SHARED.map((image) => ({ featured: false, hover: false, ...image })), ...angles],
  };
});

const catalogue = {
  categories: [
    {
      slug: "sticks",
      name: "Antiperspirant Sticks",
      description: "SAVA antiperspirant sticks: clinical sweat control with refined, long-lasting fragrance.",
    },
  ],
  products,
};

const paths = new Set(products.flatMap((p) => p.images.map((image) => image.path)));
const missing = [...paths].filter((path) => !existsSync(join(root, "public", path)));
if (missing.length) {
  console.error("Missing images:", missing);
  process.exit(1);
}

writeFileSync(join(root, "scripts", "zcom", "sava-catalogue.json"), `${JSON.stringify(catalogue, null, 2)}\n`);
console.log(
  `sava-catalogue.json: ${products.length} products, ${products.reduce((n, p) => n + p.variants.length, 0)} variants, ${paths.size} unique images`,
);
