# Vite MPA & Dual Build Setup

Part of the [Web Project Bootstrap Guide](./web-project-bootstrap.md). See also [MDX, Content & Generic Hub](./mdx-and-content-hub.md) and [Web Tech Stack Recommendations](./web-tech-stack.md).

This build setup keeps one unified URL structure across three workflows:
1. **Dev server (`npm run dev`):** Instant HMR for the hub, all pages, and `.md`/`.mdx` docs.
2. **Fast dev build (`npm run build:dev`):** Single-pass MPA build into `dist-dev/` with shared JS/CSS chunks for quick verification.
3. **Deployment build (`npm run build`):** Builds `dist/` with the hub and every page compiled as a self-contained standalone `.html` bundle via `vite-plugin-singlefile`.

---

## 1. `vite.config.ts` (Auto-Discovery + Dual Build Modes)

Scan `src/pages/` with `node:fs` to build the entry map dynamically. The same config powers both:
- **Shared-asset mode (default):** Builds all entries together into `dist-dev/` with shared chunks.
- **Standalone mode (`SINGLE_FILE=true ENTRY=<key>`):** Builds a single entry with `vite-plugin-singlefile` directly into `dist/` at the exact same relative path (`dist/index.html`, `dist/src/pages/<name>/index.html`).

```ts
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

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

const allEntries: Record<string, string> = {
  ...discoverPages(pagesDir),
  main: resolve(rootDir, "index.html"),
};

const isSingleFile = process.env.SINGLE_FILE === "true";
const targetEntry = process.env.ENTRY;

if (isSingleFile && (!targetEntry || !allEntries[targetEntry])) {
  const available = Object.keys(allEntries).join(", ");
  throw new Error(`Set ENTRY=<key> to one of: ${available}`);
}

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
    ...(isSingleFile ? [viteSingleFile()] : []),
  ],
  build: {
    target: "esnext",
    outDir: isSingleFile ? "dist" : "dist-dev",
    emptyOutDir: !isSingleFile,
    copyPublicDir: !isSingleFile || targetEntry === "main",
    rollupOptions: {
      input: isSingleFile ? allEntries[targetEntry!] : allEntries,
    },
  },
});
```

### Why Write Standalone Pages Directly to `dist/src/pages/<name>/index.html`?

- **Identical URLs across all modes:** `./src/pages/<name>/index.html` and `../../../index.html` resolve identically in `vite dev`, `dist-dev/`, and `dist/`.
- **Zero duplicate builds for downloads:** Each deployed page *is* the standalone HTML bundle, so the hub's download link points to the exact same file as the navigation link.
- **Portable subpath hosting:** `base: "./"` plus relative links works whether hosted at `/` or under a subpath like `/my-web-lab/`.

---

## 2. Deployment Build Script (`scripts/build-deploy.mjs`)

For the deployment build, `scripts/build-deploy.mjs` cleans `dist/` once and runs `vite build` per entry (`main` + each discovered page) in `SINGLE_FILE=true` mode. Spawning Vite's CLI per entry avoids ESM config caching across iterations and works identically on Linux, macOS, and Windows without `cross-env`:

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
  : [];

const args = process.argv.slice(2);
const buildAll = args.length === 0 || args.includes("--all");
const targets = buildAll ? ["main", ...discoveredPages] : args;

if (buildAll) {
  rmSync(resolve("dist"), { recursive: true, force: true });
}

for (const entry of targets) {
  console.log(`\nBuilding standalone bundle for "${entry}"...`);
  execFileSync(process.execPath, [viteBin, "build"], {
    stdio: "inherit",
    env: { ...process.env, SINGLE_FILE: "true", ENTRY: entry },
  });
}
```

### Resulting `dist/` Layout

```text
dist/
├── index.html                               # Standalone hub page
└── src/
    └── pages/
        ├── json-formatter/index.html        # Standalone HTML bundle
        ├── shader-sandbox/index.html        # Standalone HTML bundle
        └── color-contrast/index.html        # Standalone HTML bundle
```

---

## 3. Build Commands

```bash
npm run dev                        # Fast HMR dev server
npm run build:dev                  # Single-pass shared-asset build into dist-dev/
npm run preview:dev                # Preview dist-dev/
npm run build                      # Full standalone deployment build into dist/
npm run build -- json-formatter    # Rebuild one standalone page into dist/
npm run preview                    # Preview dist/ over HTTP (verifies Open + Download)
```

---

## 4. Key Build & Deployment Caveats

- **Download links in `dev` / `build:dev` vs. `dist/`:** In `npm run dev` and `dist-dev/`, `./src/pages/<name>/index.html` points to the un-inlined HTML (referencing dev modules or `dist-dev/assets/`). The downloaded `.html` is only self-contained when served from the deployment build (`dist/`). Test download links with `npm run preview`, not over `file://`.
- **Assets in single-file mode:** Imported assets (`.png`, `.svg`, `.woff2`, data files) are base64-inlined into each standalone HTML, which increases file size for large media. For heavy assets that don't need offline single-file portability, place them in `public/` and reference them by URL.
- **Avoid naming a page `main`:** Since the root `index.html` uses the key `main`, avoid creating `src/pages/main/` (or namespace page keys, e.g. `entries[`pages/${entry.name}`]`).
- **Cleaner URLs vs. `src/` prefix:** Keeping pages under `src/pages/` keeps TypeScript config clean and matches dev/build paths automatically. If you want deployed URLs like `/pages/<name>/` instead of `/src/pages/<name>/`, place `pages/` at the repo root alongside `src/shared/` (and update `backHref` to `../../index.html`).
- **Nested page groups:** If you organize pages into categories (e.g. `src/pages/tools/json-formatter/`), replace the 1-level `readdirSync` loop with a recursive walk or `fs.globSync("**/index.html", { cwd: pagesDir })` (Node 22+) and adjust the `import.meta.glob` pattern in [MDX, Content & Generic Hub](./mdx-and-content-hub.md) to `/src/pages/**/content/PAGE.md`.
