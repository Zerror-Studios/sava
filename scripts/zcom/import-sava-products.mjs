#!/usr/bin/env node
/**
 * SAVA copy of the kit's zcom-import-products (@zcom/storefront-kit v1.3.0, scripts/import-products.mjs),
 * extended for SAVA's sticks: a product may give its own `options` ([{ "name", "values" }], e.g.
 * Size × Pack) and `variants` ([{ "values", "price", "compareAtPrice"? }], one price per combination)
 * instead of `sizes` / `colours` with one `price`, plus `additionalInfo` ([{ "title", "description" }]).
 * Everything else is the kit's importer unchanged. Data: scripts/zcom/sava-catalogue.json
 * (built by scripts/zcom/build-catalogue.mjs).
 *
 * zcom-import-products — loads a design's catalogue (JSON) into a Zcom store:
 * categories, products with Size/Colour options, one variant per combination,
 * images, and stock on the default warehouse. Products are created PUBLISHED.
 *
 * Run it in your own terminal (it asks for the login, input hidden):
 *   npx zcom-import-products --gateway http://127.0.0.1:4000 --store birelle --file products.json
 *
 * Sign-in (asked interactively, never passed as arguments):
 *   owner    — the store admin's email + password (default)
 *   platform — a Zerror super admin (+ authenticator code); opens the store as
 *              its owner through the console's "log in to store" grant.
 *              --code-from http://127.0.0.1:4000 makes a local dev backend on the same
 *              database print the current code in its terminal (no authenticator app needed)
 *
 * Without --yes it is a dry run (lists what it would create, signs in to nothing).
 * A production gateway also needs --confirm-store <slug>, and refuses
 * --setup-demo (it writes a demo warehouse address and shipping rate).
 *
 * Options: --yes  --stock <n> (per variant, default 25)  --skip-existing (default on)
 *          --public-dir <dir>  upload site-relative images ("/images/...") from this folder
 *                              (the design's `public/`) into the store's media library (S3)
 *          --media-folder <name> media library folder for those uploads (default "Imported")
 *          --image-base <url>  instead of uploading, prefix "/images/..." paths with this URL
 *          --update-images     re-save the images of products that already exist
 *          --setup-demo        demo shipping zone (India, flat rate) + demo warehouse address
 *
 * JSON: { "categories": [{ "slug", "name", "description"? }],
 *         "products": [{ "slug", "name", "category", "price", "compareAtPrice"?,
 *            "description"?, "sizes"?: [], "colours"?: [], "images": [{ "path", "alt"?, "featured"?, "hover"? }],
 *            "skuPrefix"? }],
 *         "lookbooks": [{ "slug", "title", "subtitle"?, "intro"?, "tags"?: [], "sortOrder"?,
 *            "cover": { "path", "alt" }, "coverMobile"?: { "path", "alt" },
 *            "looks": [{ "layout"?: "FULL_BLEED"|"SPLIT"|"GRID"|"TEXT", "heading"?, "body"?,
 *                        "media": [{ "path", "alt", "width"?, "height"? }] }] }] }   (max 4 media per look)
 * Every key is optional, so a file may hold only lookbooks. Lookbooks are created PUBLISHED;
 * one whose slug already exists is skipped. Image paths may be full URLs or site-relative paths.
 */

import { readFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import readline from "node:readline";

// ─── Args ───────────────────────────────────────────────────────────────────

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const key = argv[i];
  if (!key.startsWith("--")) continue;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) args[key.slice(2)] = true;
  else {
    args[key.slice(2)] = next;
    i += 1;
  }
}

const fail = (message) => {
  console.error(`\n✖ ${message}`);
  process.exit(1);
};

const gateway = String(args.gateway ?? process.env.API_GATEWAY_URL ?? "").replace(/\/+$/, "");
const store = String(args.store ?? "");
const file = String(args.file ?? "");
const STOCK = Number(args.stock ?? 25);
const isProductionGateway = /^https:\/\/api\.zerrorstudios\.com$/i.test(gateway);
if (!gateway) fail("--gateway is required");
if (!Number.isInteger(STOCK) || STOCK < 0) fail("--stock must be a whole number ≥ 0");
if (!store || store === "true") fail("--store <slug> is required");
if (!file || file === "true") fail("--file <products.json> is required");

const catalog = JSON.parse(readFileSync(resolve(file), "utf8"));
catalog.products ??= [];
catalog.lookbooks ??= [];
const publicDir = typeof args["public-dir"] === "string" ? resolve(args["public-dir"]) : "";
const mediaFolder = typeof args["media-folder"] === "string" ? args["media-folder"] : "Imported";
// --image-base: turn site-relative image paths into full URLs (the dashboard can't resolve "/images/...")
const imageBase = typeof args["image-base"] === "string" ? args["image-base"].replace(/\/+$/, "") : "";

// ─── Prompts ────────────────────────────────────────────────────────────────

const ask = (question, { hidden = false } = {}) =>
  new Promise((done) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else rl.output.write("*");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      done(answer.trim());
    });
  });

// ─── GraphQL ────────────────────────────────────────────────────────────────

let token = null;
let csrf = null;

const MAX_RATE_LIMIT_RETRIES = 5;
const MAX_RETRY_AFTER_S = 60;
const EXPIRED_CODES = new Set(["TOKEN_EXPIRED", "UNAUTHENTICATED"]);
let signedIn = false;

/** `Retry-After` in seconds (a number or an HTTP date), 5 when unreadable, at most 60. */
const retryAfterSeconds = (header) => {
  if (!header) return 5;
  const seconds = Number(header);
  const value = Number.isFinite(seconds) ? seconds : (Date.parse(header) - Date.now()) / 1000;
  return Number.isFinite(value) && value > 0 ? Math.min(Math.ceil(value), MAX_RETRY_AFTER_S) : 5;
};

const gql = async (query, variables = {}, { asStore = true, attempt = 0, renewed = false } = {}) => {
  const headers = { "content-type": "application/json" };
  if (asStore) headers["x-zcom-store"] = store;
  if (token) headers.authorization = `Bearer ${token}`;
  if (csrf && !asStore) headers["x-zcom-csrf"] = csrf;
  const response = await fetch(`${gateway}/v1/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 429) {
    if (attempt >= MAX_RATE_LIMIT_RETRIES) throw new Error("RATE_LIMITED: still rate limited after 5 retries");
    const wait = retryAfterSeconds(response.headers.get("retry-after"));
    process.stdout.write(`  (rate limited, waiting ${wait}s)\n`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return gql(query, variables, { asStore, attempt: attempt + 1, renewed });
  }
  const json = await response.json().catch(() => ({}));
  if (json.errors?.length) {
    const e = json.errors[0];
    const ext = e.extensions ?? {};
    // A service restarting or briefly down: wait and try again (3 times)
    if (ext.code === "SERVICE_UNAVAILABLE" && attempt < 3) {
      process.stdout.write(`  (${e.message}; retrying in 3s)\n`);
      await new Promise((r) => setTimeout(r, 3000));
      return gql(query, variables, { asStore, attempt: attempt + 1, renewed });
    }
    // Admin tokens last 15 minutes (impersonation 1 hour, no refresh): sign in again once
    if (asStore && signedIn && !renewed && EXPIRED_CODES.has(ext.code)) {
      process.stdout.write("  (session expired, signing in again)\n");
      await signIn();
      return gql(query, variables, { asStore, renewed: true });
    }
    const error = new Error(`${ext.reason ?? ext.code ?? "ERROR"}${ext.field ? ` (${ext.field})` : ""}: ${e.message}`);
    error.code = ext.reason ?? ext.code;
    throw error;
  }
  if (!response.ok) throw new Error(`HTTP_${response.status}: the gateway answered ${response.status}`);
  return json.data;
};

// ─── Sign in ────────────────────────────────────────────────────────────────

// Kept in memory only, so a re-sign-in after the token expires asks for no password
const remembered = {};

const signIn = async () => {
  // Non-interactive (automation): ZCOM_IMPORT_AS=platform with ZCOM_PLATFORM_EMAIL / _PASSWORD / _TOTP,
  // or ZCOM_IMPORT_AS=owner with ZCOM_ADMIN_EMAIL / ZCOM_ADMIN_PASSWORD
  const env = process.env;
  token = null;
  csrf = null;
  remembered.mode ??=
    env.ZCOM_IMPORT_AS || (await ask("Sign in as [owner/platform] (owner): ")).toLowerCase() || "owner";
  const mode = remembered.mode;
  if (mode.startsWith("p")) {
    remembered.email ??= env.ZCOM_PLATFORM_EMAIL || (await ask("Super admin email: "));
    remembered.password ??= env.ZCOM_PLATFORM_PASSWORD || (await ask("Password: ", { hidden: true }));
    const { email, password } = remembered;
    const LOGIN = `mutation($e: String!, $p: String!, $t: String) { platformLogin(email: $e, password: $p, totp: $t) { accessToken csrfToken mfaRequired } }`;
    // A second sign-in always needs a fresh code (a TOTP is single use)
    let totp = signedIn ? "" : (env.ZCOM_PLATFORM_TOTP ?? "");
    if (!totp) {
      // A login without a code makes a dev backend print a fresh one in its terminal
      try {
        await gql(LOGIN, { e: email, p: password }, { asStore: false });
      } catch (error) {
        if (error.code !== "MFA_REQUIRED" && !/one-time code/i.test(error.message)) throw error;
      }
      // --code-from <local gateway>: a dev backend on the SAME database prints this account's current code
      const codeFrom = typeof args["code-from"] === "string" ? args["code-from"].replace(/\/+$/, "") : "";
      const local = /\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(gateway);
      if (codeFrom) {
        await fetch(`${codeFrom}/v1/graphql`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: LOGIN, variables: { e: email, p: password } }),
        }).catch(() => fail(`Could not reach ${codeFrom} for the code`));
        console.log(`\nThe code was printed in the BACKEND terminal of ${codeFrom}:`);
        console.log('  "[DEV ONLY] Two-step code for <email>: 123456"');
      } else if (local) {
        console.log("\nA fresh code was just requested. This local (dev) backend prints it in the BACKEND terminal:");
        console.log('  "[DEV ONLY] Two-step code for <email>: 123456"  (or use your authenticator app)');
      } else {
        console.log("\nThis backend never prints codes: use the 6-digit code from your authenticator app.");
      }
      totp = await ask("Code (within 30 s): ");
    }
    const login = await gql(LOGIN, { e: email, p: password, t: totp || undefined }, { asStore: false });
    token = login.platformLogin.accessToken;
    csrf = login.platformLogin.csrfToken;
    const found = await gql(
      `query($s: String) { platformTenants(filter: { search: $s }, limit: 20) { items { id slug name } } }`,
      { s: store },
      { asStore: false },
    );
    const tenant = found.platformTenants.items.find((t) => t.slug === store);
    if (!tenant) fail(`No store with slug "${store}"`);
    const grant = await gql(
      `mutation($id: ID!) { impersonateTenant(tenantId: $id, reason: "Catalogue import (zcom-import-products)") { accessToken } }`,
      { id: tenant.id },
      { asStore: false },
    );
    token = null;
    csrf = null;
    const accepted = await gql(`mutation($g: String!) { adminAcceptImpersonation(grant: $g) { accessToken } }`, {
      g: grant.impersonateTenant.accessToken,
    });
    token = accepted.adminAcceptImpersonation.accessToken;
    signedIn = true;
    console.log(`✔ Opened ${tenant.name} as its owner`);
    return;
  }
  remembered.email ??= env.ZCOM_ADMIN_EMAIL || (await ask("Store admin email: "));
  remembered.password ??= env.ZCOM_ADMIN_PASSWORD || (await ask("Password: ", { hidden: true }));
  const { email, password } = remembered;
  const login = await gql(
    `mutation($e: String!, $p: String!) { adminLogin(email: $e, password: $p) { accessToken } }`,
    {
      e: email,
      p: password,
    },
  );
  token = login.adminLogin.accessToken;
  signedIn = true;
  console.log("✔ Signed in");
};

// ─── Import ─────────────────────────────────────────────────────────────────

// Set once by run(), read by importProduct()
let warehouse = null;
let assetsOf = async () => [];
let categoryIds = {};

// Descriptions are plain text: escape them before wrapping in <p>
const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Every Size × Colour combination (or one variant when the product has neither). */
const combinations = (sizes, colours) => {
  const options = [];
  if (sizes.length) options.push({ name: "Size", values: sizes });
  if (colours.length) options.push({ name: "Colour", values: colours });
  if (!options.length) return { options, combos: [[]] };
  const combos = options.reduce((acc, o) => acc.flatMap((c) => o.values.map((v) => [...c, v])), [[]]);
  return { options, combos };
};

// SAVA: 10 characters, so "Pack of 01" / "Pack of 02" stay apart (PACKOF01, PACKOF02; 6 made them both PACKOF)
const skuPart = (s) =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);

/**
 * SAVA: a product's options and variants. With `options` + `variants` in the file each variant keeps
 * its own price; otherwise the kit's Size × Colour combinations at the product's one price.
 */
const variantPlan = (p) => {
  if (Array.isArray(p.options) && Array.isArray(p.variants)) {
    const options = p.options.map((o) => ({ name: o.name, values: o.values }));
    const variants = p.variants.map((v) => ({ values: v.values, price: v.price, compareAtPrice: v.compareAtPrice }));
    for (const v of variants) {
      if (v.values.length !== options.length)
        fail(`${p.slug}: variant ${v.values.join(" / ")} doesn't name one value per option`);
      if (!(Number(v.price) > 0)) fail(`${p.slug}: variant ${v.values.join(" / ")} has no price`);
    }
    return { options, variants };
  }
  const { options, combos } = combinations(p.sizes ?? [], p.colours ?? []);
  return { options, variants: combos.map((values) => ({ values, price: p.price, compareAtPrice: p.compareAtPrice })) };
};

// ─── Media upload ───────────────────────────────────────────────────────────

const MIME_TYPES = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

/** Width and height of a WebP, PNG or JPEG file (no dependencies), or {} when unknown. */
const imageSize = (bytes) => {
  const ascii = (start, end) => bytes.subarray(start, end).toString("latin1");
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    const chunk = ascii(12, 16);
    if (chunk === "VP8X") return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const [b0, b1, b2, b3] = [bytes[21], bytes[22], bytes[23], bytes[24]];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
      };
    }
  }
  if (ascii(1, 4) === "PNG") return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return {};
      const marker = bytes[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: bytes.readUInt16BE(i + 7), height: bytes.readUInt16BE(i + 5) };
      }
      i += 2 + bytes.readUInt16BE(i + 2);
    }
  }
  return {};
};

const uploads = new Map();
let folderId; // undefined = not looked up yet

/** The media library folder the uploads go into (created once, reused on later runs). */
const getFolderId = async () => {
  if (folderId !== undefined) return folderId;
  const found = await gql(
    `query($s: String) { getMedia(filters: { search: $s, isDeleted: false }, limit: 50) { _id title kind } }`,
    {
      s: mediaFolder,
    },
  );
  const existing = (found.getMedia ?? []).find(
    (m) => m.title === mediaFolder && String(m.kind).toUpperCase() === "FOLDER",
  );
  if (existing) folderId = existing._id;
  else {
    const created = await gql(`mutation($t: String!) { createFolder(title: $t) { _id } }`, { t: mediaFolder });
    folderId = created.createFolder._id;
    console.log(`  + media folder "${mediaFolder}"`);
  }
  return folderId;
};

let folderFiles; // Map title → { url, width, height }, read once per run

/** SAVA: the files already in the upload folder, by title (what earlier runs uploaded) */
const getFolderFiles = async (parentId) => {
  if (folderFiles) return folderFiles;
  folderFiles = new Map();
  for (let offset = 0; ; offset += 100) {
    const page = await gql(
      `query($p: ID, $o: Int) { getMedia(filters: { parentId: $p, isDeleted: false }, limit: 100, offset: $o) { title kind file { url width height } } }`,
      { p: parentId, o: offset },
    );
    const items = page.getMedia ?? [];
    for (const m of items) {
      if (m?.title && m.file?.url && String(m.kind).toUpperCase() !== "FOLDER") {
        folderFiles.set(m.title, {
          url: m.file.url,
          width: m.file.width ?? undefined,
          height: m.file.height ?? undefined,
        });
      }
    }
    if (items.length < 100) break;
  }
  if (folderFiles.size) console.log(`  = ${folderFiles.size} images already in "${mediaFolder}" (reused)`);
  return folderFiles;
};

/**
 * A site-relative image ("/images/x.webp") from --public-dir, uploaded to the store's media
 * library the way the dashboard does it (signed POST to S3, then registerUpload).
 * Resolves { url, width, height }. Each file is uploaded once per run.
 */
const uploadImage = async (sitePath) => {
  if (uploads.has(sitePath)) return uploads.get(sitePath);
  const absolute = join(publicDir, sitePath.replace(/^\/+/, ""));
  const bytes = readFileSync(absolute);
  const extension = extname(absolute).toLowerCase();
  const mimeType = MIME_TYPES[extension];
  if (!mimeType) throw new Error(`UNSUPPORTED_IMAGE: ${sitePath}`);
  // "lookbook/full/1.webp" → "full-1.webp", so same-named files stay apart in the library
  const fileName = `${basename(dirname(absolute))}-${basename(absolute)}`;
  const parentId = await getFolderId();
  // SAVA: a file a previous run already uploaded into this folder is reused, not uploaded again
  const existing = (await getFolderFiles(parentId)).get(fileName);
  if (existing) {
    uploads.set(sitePath, existing);
    return existing;
  }
  const signed = (
    await gql(
      `mutation($f: [FilesDataInput!]!, $folder: String) { getSignedUrlToPutObject(filesData: $f, folderId: $folder) { cdnUrl fileKey maxSize presignedPost { url fields { name value } } } }`,
      {
        f: [
          {
            fileName,
            fileKey: `${Date.now()}-${fileName}`,
            fileType: mimeType,
            contentType: mimeType,
            fileSize: bytes.length,
            extension: extension.slice(1),
          },
        ],
        folder: parentId,
      },
    )
  ).getSignedUrlToPutObject?.[0];
  if (!signed?.presignedPost?.url) fail("The media service returned no upload URL (is S3 set up for this store?)");
  if (signed.maxSize && bytes.length > signed.maxSize) throw new Error(`FILE_TOO_LARGE: ${sitePath}`);
  const form = new FormData();
  for (const field of signed.presignedPost.fields) form.append(field.name, field.value);
  form.append("file", new Blob([bytes], { type: mimeType }), fileName);
  const response = await fetch(signed.presignedPost.url, { method: "POST", body: form });
  if (!response.ok) throw new Error(`UPLOAD_REFUSED: storage answered ${response.status} for ${sitePath}`);
  await gql(
    `mutation($t: String!, $k: String!, $m: String!, $s: Float!, $u: String, $p: ID) { registerUpload(title: $t, fileKey: $k, mimeType: $m, size: $s, url: $u, parentId: $p) { _id } }`,
    { t: fileName, k: signed.fileKey, m: mimeType, s: bytes.length, u: signed.cdnUrl, p: parentId },
  );
  const media = { url: signed.cdnUrl, ...imageSize(bytes) };
  uploads.set(sitePath, media);
  return media;
};

/** An image path as stored in Zcom: uploaded (--public-dir), prefixed (--image-base) or as given. */
const resolveImage = async (path, size = {}) => {
  if (path.startsWith("/") && publicDir) return uploadImage(path);
  return { url: imageBase && path.startsWith("/") ? `${imageBase}${path}` : path, ...size };
};

/** A LookbookMediaInput for one image. */
const lookbookMedia = async (image) => {
  const { url, width, height } = await resolveImage(image.path, { width: image.width, height: image.height });
  return { type: "IMAGE", url, alt: image.alt, width: width ?? image.width, height: height ?? image.height };
};

const run = async () => {
  console.log(
    `\nImporting ${catalog.products.length} products, ${catalog.categories?.length ?? 0} categories and ${catalog.lookbooks.length} lookbooks into "${store}" via ${gateway}`,
  );
  if (args.yes !== true || args["dry-run"]) {
    for (const p of catalog.products) {
      const { options, variants } = variantPlan(p);
      const prices = variants.map((v) => v.price);
      const range =
        Math.min(...prices) === Math.max(...prices) ? `${prices[0]}` : `${Math.min(...prices)}–${Math.max(...prices)}`;
      console.log(
        `  - ${p.name} (${p.category}) ${range} · ${variants.length} variants (${options.map((o) => o.name).join(" × ") || "none"}) · ${p.images?.length ?? 0} images`,
      );
      for (const v of variants) console.log(`      ${v.values.join(" / ") || p.name}: ${v.price}`);
    }
    for (const l of catalog.lookbooks) {
      const media = (l.looks ?? []).reduce((n, look) => n + (look.media?.length ?? 0), 0);
      console.log(`  - lookbook ${l.title} · ${l.looks?.length ?? 0} looks · ${media} photos`);
    }
    if (publicDir) {
      const paths = new Set();
      for (const p of catalog.products) for (const img of p.images ?? []) paths.add(img.path);
      for (const l of catalog.lookbooks) {
        for (const img of [l.cover, l.coverMobile, ...(l.looks ?? []).flatMap((k) => k.media ?? [])])
          if (img) paths.add(img.path);
      }
      const local = [...paths].filter((p) => p.startsWith("/"));
      let bytes = 0;
      for (const p of local) bytes += readFileSync(join(publicDir, p.replace(/^\/+/, ""))).length;
      console.log(
        `  ${local.length} local images to upload (${(bytes / 1024 / 1024).toFixed(1)} MB) into media folder "${mediaFolder}"`,
      );
    }
    console.log("\nDry run: nothing created. Add --yes to import.");
    return;
  }
  if (isProductionGateway && args["confirm-store"] !== store) {
    fail(`Production gateway: add --confirm-store ${store} to confirm`);
  }
  if (isProductionGateway && args["setup-demo"]) {
    fail("--setup-demo writes a demo address and shipping rate: never on a production store");
  }

  await signIn();
  const productsOk = catalog.products.length ? await importProducts() : true;
  const lookbooksOk = catalog.lookbooks.length ? await importLookbooks() : true;
  if (!productsOk || !lookbooksOk) {
    process.exitCode = 1;
    return;
  }
  console.log(
    `✔ Import finished. Check the ${catalog.lookbooks.length ? "products and lookbooks" : "products"} in the dashboard.`,
  );
};

/** Categories, the default warehouse, optional demo setup, then every product. Resolves false on failures. */
const importProducts = async () => {
  // Categories (reused when the slug already exists)
  const existing = await gql(`{ getClientSideCategories(limit: 100) { categories { _id slug } } }`);
  categoryIds = Object.fromEntries(existing.getClientSideCategories.categories.map((c) => [c.slug, c._id]));
  for (const c of catalog.categories ?? []) {
    if (categoryIds[c.slug]) {
      console.log(`  = category ${c.name} (exists)`);
      continue;
    }
    const created = await gql(`mutation($i: CreateCategoryInput!) { createCategory(input: $i) { _id slug } }`, {
      i: { name: c.name, slug: c.slug, description: c.description },
    });
    categoryIds[c.slug] = created.createCategory._id;
    console.log(`  + category ${c.name}`);
  }

  // Default warehouse for stock
  const { getWarehouses } = await gql(`{ getWarehouses { _id name isDefault } }`);
  warehouse = getWarehouses.find((w) => w.isDefault) ?? getWarehouses[0];
  if (!warehouse) {
    const created = await gql(
      `mutation($i: CreateWarehouseInput!) { createWarehouse(input: $i) { _id name isDefault } }`,
      {
        i: {
          name: "Main warehouse",
          code: "MAIN",
          isDefault: true,
          address: {
            line1: "TBD",
            city: "TBD",
            state: "TBD",
            country: "India",
            pincode: "000000",
            phone: "0000000000",
          },
        },
      },
    );
    warehouse = created.createWarehouse;
    console.log(`  + warehouse ${warehouse.name} (update its address in the dashboard)`);
  }

  // --setup-demo: a default shipping zone and a demo warehouse address, so checkout works for testing
  if (args["setup-demo"]) {
    const { getWarehouses: houses } = await gql(`{ getWarehouses { _id address { line1 } } }`);
    for (const h of houses.filter((w) => !w.address?.line1 || w.address.line1 === "TBD")) {
      await gql(`mutation($id: ID!, $i: UpdateWarehouseInput!) { updateWarehouse(id: $id, input: $i) { _id } }`, {
        id: h._id,
        i: {
          address: {
            line1: "Demo warehouse, 1 Fashion Street",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            pincode: "400001",
            phone: "9000000000",
          },
        },
      });
      console.log("  ~ warehouse address set to a demo Mumbai address (edit it in the dashboard)");
    }
    const { getDefaultShippingProfile: profile } = await gql(`{ getDefaultShippingProfile { _id zones { name } } }`);
    if (!profile || profile.zones.length === 0) {
      await gql(`mutation($i: CreateProfileInput!) { createShippingProfile(input: $i) { _id } }`, {
        i: {
          name: "General Shipping Rates",
          type: "GENERAL",
          isDefault: true,
          zones: [
            {
              name: "Domestic",
              countries: ["IN"],
              rates: [{ name: "Standard Shipping", type: "FLAT", price: 100, transitDays: { min: 3, max: 7 } }],
            },
          ],
        },
      });
      console.log("  + shipping: Domestic (India) · Standard Shipping ₹100 flat, 3–7 days");
    } else {
      console.log(`  = shipping profile exists (${profile.zones.map((z) => z.name).join(", ")})`);
    }
  }

  // Site-relative image paths are uploaded (--public-dir) or prefixed (--image-base)
  assetsOf = async (p) => {
    const assets = [];
    for (const [i, img] of (p.images ?? []).entries()) {
      assets.push({
        path: (await resolveImage(img.path)).url,
        type: "IMAGE",
        altText: img.alt ?? p.name,
        isFeatured: img.featured ?? i === 0,
        isHover: img.hover ?? i === 1,
      });
    }
    return assets;
  };

  const failed = [];
  const unstocked = [];
  let createdCount = 0;
  for (const p of catalog.products) {
    try {
      const outcome = await importProduct(p);
      if (outcome === "created") createdCount += 1;
      if (outcome === "unstocked") {
        createdCount += 1;
        unstocked.push(p.slug);
      }
    } catch (error) {
      failed.push(`${p.slug}: ${error.message}`);
      console.log(`  ✖ ${p.name}: ${error.message}`);
    }
  }
  console.log(`\n${createdCount} created, ${unstocked.length} without stock, ${failed.length} failed.`);
  if (unstocked.length) console.log(`  Set their stock in the dashboard: ${unstocked.join(", ")}`);
  if (failed.length) {
    console.log("  Failed (re-run to retry; existing products are skipped):");
    for (const line of failed) console.log(`    - ${line}`);
    return false;
  }
  return true;
};

/** Lookbooks: header (cover, mobile cover), its looks in order, then publish. Existing slugs are skipped. */
const importLookbooks = async () => {
  const { getLookbooks } = await gql(`{ getLookbooks(limit: 100) { lookbooks { _id slug } } }`);
  const existing = new Set(getLookbooks.lookbooks.map((l) => l.slug));
  const failed = [];
  for (const l of catalog.lookbooks) {
    if (existing.has(l.slug)) {
      console.log(`  = lookbook ${l.title} (exists)`);
      continue;
    }
    try {
      process.stdout.write(`  + lookbook ${l.title}`);
      const cover = await lookbookMedia(l.cover);
      const created = await gql(`mutation($i: LookbookInput!) { createLookbook(input: $i) { _id version } }`, {
        i: {
          title: l.title,
          slug: l.slug,
          subtitle: l.subtitle,
          intro: l.intro ? `<p>${escapeHtml(l.intro)}</p>` : undefined,
          tags: l.tags ?? [],
          sortOrder: l.sortOrder,
          cover,
          coverMobile: l.coverMobile ? await lookbookMedia(l.coverMobile) : undefined,
          seo: { title: l.title.slice(0, 70), description: l.intro?.slice(0, 160), ogImageUrl: cover.url },
        },
      });
      const id = created.createLookbook._id;
      let version = created.createLookbook.version;
      for (const look of l.looks ?? []) {
        const media = [];
        for (const image of (look.media ?? []).slice(0, 4)) media.push(await lookbookMedia(image));
        const added = await gql(
          `mutation($id: ID!, $i: LookbookLookInput!, $v: Int!) { createLookbookLook(lookbookId: $id, input: $i, expectedVersion: $v) { version } }`,
          { id, v: version, i: { layout: look.layout ?? "GRID", heading: look.heading, body: look.body, media } },
        );
        version = added.createLookbookLook.version;
      }
      await gql(`mutation($id: ID!, $v: Int!) { publishLookbook(id: $id, expectedVersion: $v) { status } }`, {
        id,
        v: version,
      });
      console.log(` · ${l.looks?.length ?? 0} looks · published`);
    } catch (error) {
      failed.push(`${l.slug}: ${error.message}`);
      console.log(` ✖ ${error.message}`);
    }
  }
  if (failed.length) {
    console.log("  Lookbooks failed (a half-made one is a DRAFT: delete it in the dashboard, then re-run):");
    for (const line of failed) console.log(`    - ${line}`);
    return false;
  }
  return true;
};

/** One product: skip, update images, or create with stock. */
const importProduct = async (p) => {
  // Admin search (matches the slug) also finds DRAFT and ARCHIVED products,
  // which the storefront read never returns
  const found = await gql(
    `query($s: String) { getProducts(limit: 20, filters: { search: $s }) { products { _id slug } } }`,
    { s: p.slug },
  );
  const existingId = (found.getProducts?.products ?? []).find((x) => x?.slug === p.slug)?._id;
  if (existingId && args["update-images"]) {
    await gql(`mutation($id: ID!, $i: UpdateProductInput) { updateProduct(productId: $id, input: $i) { _id } }`, {
      id: existingId,
      i: { assets: await assetsOf(p) },
    });
    console.log(`  ~ ${p.name} (images updated)`);
    return "updated";
  }
  if (existingId && args["skip-existing"] !== "false") {
    console.log(`  = ${p.name} (exists)`);
    return "skipped";
  }
  const { options, variants } = variantPlan(p);
  // Full slug keeps SKUs unique (e.g. SCRIPT-JOGGER vs SCRIPT-TRIM-TEE)
  const prefix =
    p.skuPrefix ??
    p.slug
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 24);
  const input = {
    name: p.name,
    slug: p.slug,
    description: p.description ? `<p>${escapeHtml(p.description)}</p>` : undefined,
    productType: "PHYSICAL",
    status: "PUBLISHED",
    categoryIds: categoryIds[p.category] ? [categoryIds[p.category]] : [],
    assets: await assetsOf(p),
    productOptions: options.map((o) => ({
      optionName: o.name,
      showInProductPageAs: o.name === "Colour" ? "Color" : "List",
      choices: o.values.map((v) => ({ name: v })),
    })),
    variants: variants.map(({ values, price, compareAtPrice }) => ({
      title: values.join(" / ") || p.name,
      sku: [prefix, ...values.map(skuPart)].join("-"),
      optionValues: values,
      price,
      compareAtPrice,
      requiresShipping: true,
      taxable: true,
      status: "PUBLISHED",
    })),
    additionalInfo: Array.isArray(p.additionalInfo) ? p.additionalInfo : undefined,
    seo: { title: p.name, description: p.description?.slice(0, 160) },
  };
  const created = await gql(
    `mutation($i: ProductInput!) { createProduct(input: $i) { _id name variants { _id optionValues } } }`,
    { i: input },
  );
  const product = created.createProduct;
  process.stdout.write(`  + ${product.name} · ${product.variants.length} variants`);

  // Stock (the inventory items are created from the product event; retry briefly)
  const updates = product.variants.map((v) => ({
    productId: product._id,
    variantId: v._id,
    warehouseId: warehouse._id,
    desiredQuantity: STOCK,
    reason: "RECEIVED",
    notes: "Initial stock (zcom-import-products)",
  }));
  let stocked = false;
  for (let attempt = 0; attempt < 5 && !stocked; attempt += 1) {
    try {
      await gql(`mutation($u: [InventoryQuantityInput!]!) { setInventoryQuantities(updates: $u) { __typename } }`, {
        u: updates,
      });
      stocked = true;
    } catch (error) {
      if (attempt === 4) process.stdout.write(` · stock not set (${error.message})`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  console.log(stocked ? ` · stock ${STOCK} each` : "");
  return stocked ? "created" : "unstocked";
};

run().catch((error) => fail(error.message));
