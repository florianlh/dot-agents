# Vite MPA & Dual Build Setup

Part of the [Web Project Bootstrap Guide](./web-project-bootstrap.md). See also [MDX, Content & Generic Hub](./mdx-and-content-hub.md), [Per-Page PWA Installs & Offline Caching](./per-page-pwa.md), and [Web Tech Stack Recommendations](./web-tech-stack.md).

This build setup keeps one unified source tree across four workflows:
1. **Dev server (`npm run dev`):** Instant HMR for the hub, all pages, and `.md`/`.mdx` docs (no Service Worker, no `downloads/`).
2. **Default production build (`npm run build` -> `dist/`):** Two-pass build ideal for Vercel, GitHub Pages, or Netlify:
   - **Pass 1:** Chunked MPA (`dist/index.html`, `dist/src/pages/<slug>/index.html`, `dist/assets/*`) + isolated per-page PWAs (`manifest.webmanifest`, `sw.js`, icons).
   - **Pass 2 (`DOWNLOAD_BUNDLE=true`):** Standalone single-file HTML downloads (`dist/downloads/<slug>.html`) with KaTeX/Highlight.js styles loaded from jsDelivr CDN and **no** PWA sidecars.
3. **Fast MPA-only pass (`npm run build:mpa` -> `dist/`):** Runs only Pass 1 (chunked MPA + per-page PWAs, skipping `dist/downloads/`).
4. **Offline standalone (`npm run build:offline` -> `dist-offline/`):** 100% air-gapped single `.html` per entry (`main` + each page) with `.woff2`-trimmed inline KaTeX fonts, **no** PWA sidecars, and **no** **Install App** button.

> **Why CDN-backed standalone is the default for downloads:** The primary purpose of `dist/downloads/<slug>.html` is to **test or share built tools without any web hosting** (opening directly via `file://` or sending a single `.html` file), **assuming the user still has an internet connection**. Air-gapped `dist-offline/` remains available when zero external network requests are required.

---

## 1. `vite.config.ts` (Auto-Discovery, Standalone Styles & Per-Page PWA)

Scan `src/pages/` with `node:fs` to build the entry map dynamically, strip or trim heavy `katex` / `highlight.js` stylesheets in single-file modes, inline bundles when `SINGLE_FILE=true`, and emit per-page PWAs when `!isOffline && !isDownloadBundle`:

```ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { vitePwaPagesPlugin } from "./scripts/pwa/vitePwaPagesPlugin";

const rootDir = dirname(fileURLToPath(import.meta.url));
const pagesDir = resolve(rootDir, "src/pages");

function discoverPages(dir: string): Record<string, string> {
  if (!existsSync(dir)) return {};

  const entries: Record<string, string> = {};
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const htmlPath = resolve(dir, entry.name, "index.html");
    if (existsSync(htmlPath)) {
      entries[entry.name] = htmlPath;
    }
  }
  return entries;
}

function getPackageVersion(pkgName: string): string {
  const pkgJsonPath = resolve(rootDir, "node_modules", pkgName, "package.json");
  return (JSON.parse(readFileSync(pkgJsonPath, "utf8")) as { version: string }).version;
}

const katexVersion = getPackageVersion("katex");
const hljsVersion = getPackageVersion("highlight.js");
const externalStyleUrls = [
  `https://cdn.jsdelivr.net/npm/katex@${katexVersion}/dist/katex.min.css`,
  `https://cdn.jsdelivr.net/npm/highlight.js@${hljsVersion}/styles/github-dark.min.css`,
];

function standaloneStylesPlugin(mode: "cdn" | "offline"): Plugin {
  const katexCssPath = resolve(rootDir, "node_modules/katex/dist/katex.min.css");
  const katexFontsDir = resolve(rootDir, "node_modules/katex/dist/fonts").replace(/\\/g, "/");

  return {
    name: "standalone-styles",
    enforce: "pre",
    transform(code, id) {
      const cleanId = id.split("?")[0].replace(/\\/g, "/");
      if (!cleanId.endsWith("/src/shared/theme.css")) return null;

      if (mode === "cdn") {
        return code
          .replace(/@import\s+["']katex\/dist\/katex\.min\.css["'];?\s*/g, "")
          .replace(/@import\s+["']highlight\.js\/styles\/github-dark\.css["'];?\s*/g, "");
      }

      // Offline mode: inline KaTeX CSS with .woff2-only fonts (drops legacy .woff/.ttf, saving ~1.09 MB per bundle).
      const woff2OnlyKatexCss = readFileSync(katexCssPath, "utf8")
        .replace(/,url\(fonts\/[^)]+\.(woff|ttf)\) format\("[^"]+"\)/g, "")
        .replace(/url\(fonts\//g, `url(${katexFontsDir}/`);

      return code.replace(/@import\s+["']katex\/dist\/katex\.min\.css["'];?/, woff2OnlyKatexCss);
    },
    transformIndexHtml(html) {
      if (mode !== "cdn") return html;
      const cdnLinks = externalStyleUrls
        .map((href) => `    <link rel="stylesheet" href="${href}" crossorigin="anonymous" />`)
        .join("\n");
      return html.replace(/(\s*<link\b[^>]*rel=["']stylesheet["'][^>]*>)/i, `\n${cdnLinks}$1`);
    },
  };
}

const allEntries: Record<string, string> = {
  ...discoverPages(pagesDir),
  main: resolve(rootDir, "index.html"),
};

const isSingleFile = process.env.SINGLE_FILE === "true";
const isOffline = process.env.OFFLINE === "true";
const isDownloadBundle = process.env.DOWNLOAD_BUNDLE === "true";
const targetEntry = process.env.ENTRY;

if (isSingleFile && (!targetEntry || !allEntries[targetEntry])) {
  const available = Object.keys(allEntries).join(", ");
  throw new Error(`Set ENTRY=<key> to one of: ${available}`);
}

const outDir = isOffline ? "dist-offline" : "dist";
const enablePwaPages = !isOffline && !isDownloadBundle;

export default defineConfig({
  base: "./",
  plugins: [
    {
      enforce: "pre" as const,
      ...mdx({
        jsxImportSource: "preact",
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex, rehypeHighlight],
      }),
    },
    ...(isSingleFile ? [standaloneStylesPlugin(isOffline ? "offline" : "cdn")] : []),
    tailwindcss(),
    ...(isSingleFile
      ? [
          viteSingleFile(
            isDownloadBundle ? { outputFileName: `downloads/${targetEntry}.html` } : undefined,
          ),
        ]
      : []),
    ...(enablePwaPages
      ? [
          vitePwaPagesPlugin({
            rootDir,
            appPrefix: "my-lab",
            externalStyleUrls: isSingleFile ? externalStyleUrls : [],
            isSingleFile,
          }),
        ]
      : []),
  ],
  build: {
    target: "esnext",
    outDir,
    emptyOutDir: !isSingleFile,
    copyPublicDir: !isSingleFile || (isOffline && targetEntry === "main"),
    rollupOptions: {
      input: isSingleFile ? allEntries[targetEntry!] : allEntries,
    },
  },
});
```

---

## 2. Fonts & Styles Optimization (`katex` + `highlight.js`)

Importing `@import "katex/dist/katex.min.css";` in `src/shared/theme.css` pulls **59 font files** across 3 formats (`20 .ttf` + `20 .woff` + `19–20 .woff2` ≈ `1,048 KiB` raw). Because `vite-plugin-singlefile` sets `assetsInlineLimit = () => true`, all 59 fonts get base64-encoded into **every** single-file HTML (~**1,463 KiB** of `<style>`).

`standaloneStylesPlugin` eliminates this overhead cleanly:
- **Hosted MPA (`dist/assets/`):** Vite bundles local CSS + font chunks once, shared across pages and precached per page by `sw.js`.
- **Standalone downloads (`dist/downloads/<slug>.html`):** CDN CSS/fonts drop **~1.46 MB** per downloadable HTML.
- **Offline bundles (`dist-offline/`):** `.woff2`-only trim drops **~1.09 MB** per air-gapped HTML with zero visual loss.

### Critical Implementation Warnings

1. **Plugin ordering (`enforce: "pre"` before `@tailwindcss/vite`):** `@tailwindcss/vite` resolves CSS `@import`s inside `theme.css` directly from disk *before* Rollup processes sub-stylesheets as separate modules. `standaloneStylesPlugin` **must** set `enforce: "pre"` and appear **before** `tailwindcss()` in `vite.config.ts`, transforming `src/shared/theme.css` directly.
2. **Preserve CSS cascade order:** In CDN mode, inject external `<link rel="stylesheet">` tags *immediately before* the existing `<link rel="stylesheet" href="...theme.css">` tag (not before `</head>`). That way custom overrides in `theme.css` (such as `.mdx-prose pre code.hljs { background: transparent; padding: 0; }`) still override `github-dark.min.css`.
3. **Read installed versions from `node_modules`:** Never hardcode CDN versions or rely on `package.json` semver ranges (`^`); read `node_modules/<pkg>/package.json` at build time so CDN links match installed lockfile versions.
4. **Offline `.woff2`-only rewrite:** All 20 KaTeX `@font-face` rules provide `.woff2` (supported by all browsers capable of ESNext/WebGL). Stripping `,url(fonts/[^)]+\.(woff|ttf)) format("[^"]+")` and rewriting `url(fonts/` to the resolved `node_modules/katex/dist/fonts/` path trims ~1.09 MB from every offline bundle.
5. **Single-file output filename & `copyPublicDir`:** Pass `viteSingleFile({ outputFileName: \`downloads/${targetEntry}.html\` })` when `DOWNLOAD_BUNDLE === "true"` so Pass 2 writes directly to `dist/downloads/<slug>.html` while `emptyOutDir: !isSingleFile` (`false`) preserves Pass 1's `dist/` assets and PWA files. Also set `copyPublicDir: !isSingleFile || (isOffline && targetEntry === "main")` so Pass 2 doesn't redundantly re-copy `public/`.
6. **PWA plugin ordering (`enforce: "post"` after `viteSingleFile`):** `vitePwaPagesPlugin` must run *after* `viteSingleFile()` (`enforce: "post"`) so HTML hashed for the SW cache is finalized and `viteSingleFile` never attempts to inline `sw.js`, `manifest.webmanifest`, or PNG icons. See [Per-Page PWA Installs & Offline Caching](./per-page-pwa.md).

---

## 3. Deployment Build Script (`scripts/build-deploy.mjs`)

`scripts/build-deploy.mjs` orchestrates both the default dual-pass `dist/` build and the `--offline` `dist-offline/` build. Spawning Vite's CLI per entry avoids ESM config caching across iterations and works identically on Linux, macOS, and Windows without `cross-env`:

```js
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const pagesDir = resolve("src/pages");
const viteBin = resolve("node_modules/vite/bin/vite.js");

const discoveredPages = existsSync(pagesDir)
  ? readdirSync(pagesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(resolve(pagesDir, d.name, "index.html")))
      .map((d) => d.name)
      .sort()
  : [];

const rawArgs = process.argv.slice(2);
const isOffline = rawArgs.includes("--offline");
const args = rawArgs.filter((arg) => arg !== "--offline" && arg !== "--all");
const buildAll = args.length === 0 || rawArgs.includes("--all");

if (isOffline) {
  const targets = buildAll ? ["main", ...discoveredPages] : args;
  if (buildAll) {
    rmSync(resolve("dist-offline"), { recursive: true, force: true });
  }

  for (const entry of targets) {
    console.log(`\nBuilding offline standalone bundle for "${entry}" -> dist-offline/...`);
    execFileSync(process.execPath, [viteBin, "build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        SINGLE_FILE: "true",
        OFFLINE: "true",
        VITE_OFFLINE: "true",
        ENTRY: entry,
      },
    });
  }
} else {
  const pageTargets = buildAll ? discoveredPages : args.filter((entry) => entry !== "main");

  if (buildAll) {
    console.log("\nBuilding chunked MPA + per-page PWAs -> dist/...");
    execFileSync(process.execPath, [viteBin, "build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        SINGLE_FILE: "false",
        OFFLINE: "false",
      },
    });
  }

  for (const entry of pageTargets) {
    console.log(`\nBuilding standalone (CDN styles) download for "${entry}" -> dist/downloads/${entry}.html...`);
    execFileSync(process.execPath, [viteBin, "build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        SINGLE_FILE: "true",
        OFFLINE: "false",
        DOWNLOAD_BUNDLE: "true",
        ENTRY: entry,
      },
    });
  }
}
```

### Resulting Output Layouts

**Default `npm run build` (`dist/`):**

```text
dist/
├── index.html                               # Chunked MPA hub
├── assets/                                  # Shared JS/CSS/font chunks
├── downloads/
│   ├── json-formatter.html                  # Single-file download (CDN styles, no PWA)
│   ├── shader-sandbox.html
│   └── color-contrast.html
└── src/
    └── pages/
        ├── json-formatter/
        │   ├── index.html                   # Hosted page shell
        │   ├── manifest.webmanifest         # Isolated PWA manifest
        │   ├── sw.js                        # Per-page chunk precaching SW
        │   ├── icon-192.png
        │   └── icon-512.png
        ├── shader-sandbox/...
        └── color-contrast/...
```

**Air-gapped `npm run build:offline` (`dist-offline/`):**

```text
dist-offline/
├── index.html                               # Self-contained hub (Download HTML -> ./src/pages/<slug>/index.html)
└── src/
    └── pages/
        ├── json-formatter/index.html        # 100% offline single-file bundle (.woff2-only KaTeX)
        ├── shader-sandbox/index.html
        └── color-contrast/index.html
```

---

## 4. Build Commands

```bash
npm run dev                        # Fast HMR dev server (no SW, no downloads/)
npm run build:mpa                  # Single-pass chunked MPA + per-page PWAs into dist/
npm run build                      # Full production build -> dist/ (MPA + PWAs + downloads/*.html)
npm run build -- json-formatter    # Rebuild one standalone download into dist/downloads/
npm run preview                    # Preview dist/ over HTTP (verifies Open, Install App & Download HTML)
npm run build:offline              # Full air-gapped single-file build -> dist-offline/
npm run preview:offline            # Preview dist-offline/ over HTTP
```

---

## 5. Key Build & Deployment Caveats

- **Hosting vs. `file://` semantics:**
  - Verify hub **Open**, **Install App**, and **Download HTML** flows using `npm run build && npm run preview` over HTTP (`localhost`), never via `file://` and never relying on `npm run dev` (in `vite dev`, `./downloads/<slug>.html` does not exist because single-file downloads are build artifacts, and Service Workers are disabled to avoid breaking HMR).
  - Once downloaded (or taken from `dist/downloads/<slug>.html` or `dist-offline/`), single-file `.html` bundles open directly via `file://` without a server; `dist/downloads/<slug>.html` assumes internet access for jsDelivr CSS/fonts, whereas `dist-offline/` requires zero network access.
- **Portable subpath hosting:** `base: "./"` plus relative links (`./src/pages/<slug>/index.html`, `./downloads/<slug>.html`, `../../../index.html`, and relative PWA manifest paths) works whether hosted at `/` or under a subpath like `/my-web-lab/`.
- **Assets in single-file mode:** Imported assets (`.png`, `.svg`, `.woff2`, data files) are base64-inlined into each standalone HTML, increasing file size for large media. Place large static media that doesn't require offline single-file embedding in `public/` and reference it by relative URL.
- **Avoid naming a page `main`:** Since the root `index.html` uses the key `main`, avoid creating `src/pages/main/` (or namespace page keys, e.g., `entries[`pages/${entry.name}`]`).
- **Nested page groups:** If you organize pages into categories (e.g., `src/pages/tools/json-formatter/`), replace the 1-level `readdirSync` loop with a recursive walk or `fs.globSync("**/index.html", { cwd: pagesDir })` (Node 22+) and adjust the `import.meta.glob` pattern in [MDX, Content & Generic Hub](./mdx-and-content-hub.md) to `/src/pages/**/content/PAGE.md`.
