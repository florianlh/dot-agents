# Per-Page PWA Installs & Offline Caching

Part of the [Web Project Bootstrap Guide](./web-project-bootstrap.md). See also [Vite MPA & Dual Build Setup](./vite-mpa-build.md) and [MDX, Content & Generic Hub](./mdx-and-content-hub.md).

Each page under `src/pages/<slug>/` (excluding the root hub `index.html`) is automatically built as an isolated, installable **Progressive Web App (PWA)** with offline caching inside `dist/` (both `npm run build` Pass 1 and `npm run build:mpa`).

> **Scope note:** PWAs require an `https://` or `localhost` origin. The root hub (`index.html`), portable single-file HTMLs (`dist/downloads/<slug>.html`, `dist-offline/`), `vite dev`, and `file://` opens intentionally omit PWA sidecars and skip Service Worker registration.

---

## How It Works (Zero Per-Page Boilerplate)

1. **Metadata from `content/PAGE.md` (`scripts/pwa/pageMetadata.ts`):**
   Every page's Web App Manifest (`manifest.webmanifest`) is generated from its existing `content/PAGE.md` frontmatter, with optional overrides:
   ```yaml
   ---
   title: JSON Formatter
   shortName: JSON Tool           # optional (auto-derived if omitted)
   description: ...
   themeColor: "#0f172a"          # optional (default: "#0f172a")
   backgroundColor: "#0f172a"     # optional (default: "#0f172a")
   display: standalone            # optional: standalone | minimal-ui | fullscreen | browser
   icon: ./custom-logo.png        # optional custom PNG path relative to page dir
   pwa: true                      # set pwa: false to opt a page out
   ---
   ```

2. **Pluggable Zero-Dependency Icons + Overrides (`scripts/pwa/iconGenerator.ts`):**
   - **Custom override lookup (checked in order inside `src/pages/<slug>/`):**
     1. Frontmatter `icon` path (relative to the page folder).
     2. Conventional `icon-192.png` and/or `icon-512.png`.
     3. Conventional single `icon.png` (reading `IHDR` dimensions from bytes 16–24 automatically).
   - **Default generator (`IconProvider` interface):** When no override file exists, `DefaultIconProvider` generates crisp `192×192` and `512×512` RGBA PNGs using Node's built-in `node:zlib` (`deflateSync` + CRC32) with a deterministic per-slug accent palette and 2-character badge derived from `tag`/`title`. Swap `IconProvider` in `scripts/pwa/iconGenerator.ts` to customize the default visual style.

3. **Isolated Per-Page Manifest & Service Worker (`scripts/pwa/serviceWorkerTemplate.ts` + `vitePwaPagesPlugin.ts`):**
   - Emits `manifest.webmanifest`, `sw.js`, `icon-192.png`, and `icon-512.png` directly into `dist/src/pages/<slug>/` (omitted when `DOWNLOAD_BUNDLE=true` or `OFFLINE=true`).
   - Uses an isolated cache prefix `<app>-<slug>-<sha256_12>`, so updating or caching one page never invalidates or pollutes another page's cache.
   - Walks Rollup's chunk graph (`chunk.imports`, `chunk.dynamicImports`, `viteMetadata.importedCss`, and `viteMetadata.importedAssets`) from the page's HTML `<script>`/`<link>` tags so *only* that page's JS, CSS, and font chunks (`../../../assets/*`) are precached.

4. **Shared Runtime & Hub Install UX (`src/shared/pwa.ts`, `PageChrome.tsx`, `PageCard.tsx`):**
   - `PageChrome` (`src/shared/PageChrome.tsx`) calls `initPagePwa()` on mount and renders the top-bar **Install** button + **Install App** modal.
   - `PageCard` (`src/shared/PageCard.tsx`) renders an **Install App** link (`./src/pages/<slug>/index.html?install=1`) alongside **Open** and **Download HTML** when `VITE_OFFLINE !== "true"` on HTTP(S)/`localhost` origins.

---

## Critical PWA Warnings & Patterns

1. **Plugin order (`enforce: "post"` after `viteSingleFile`):**
   `vitePwaPagesPlugin` **must** run *after* `viteSingleFile()` (`enforce: "post"` + `generateBundle: { order: "post" }`) so `htmlSource` hashed for the SW cache version is already finalized and `viteSingleFile` never attempts to inline or warn on `sw.js`, `manifest.webmanifest`, or PNG icons.

2. **Relative manifest scoping:**
   Emit `manifest.webmanifest` with `id: "./"`, `start_url: "./index.html"`, and `scope: "./"`. Relative paths resolve cleanly both at `/` and under subpaths (`/repo-name/`), and isolate each page's installed app identity on the same origin.

3. **Offline `?install=1` navigation:**
   The generated `sw.js` navigation handler must fall back with `cache.match("./index.html", { ignoreSearch: true })` so URLs with query strings (such as `?install=1`) load offline cleanly.

4. **Runtime guards in `src/shared/pwa.ts` (`VITE_OFFLINE` + `hasManifest` + `PROD`):**
   Check all three before enabling PWA UI or registering `./sw.js`:
   ```ts
   const hasManifest = !!document.querySelector('link[rel="manifest"]');
   const supported =
     import.meta.env.VITE_OFFLINE !== "true" &&
     hasManifest &&
     isPwaSupportedProtocol(window.location.protocol, window.location.hostname);
   ```
   - `hasManifest` is critical when `dist/downloads/<slug>.html` is served or opened over HTTP(S)/`localhost` (where protocol passes, yet PWA sidecars were intentionally omitted for downloads).
   - `isPwaSupportedProtocol(protocol, hostname)` returns `true` only for `https:` or `http:` on `localhost` / `127.0.0.1` / `[::1]` / `*.localhost`.
   - Only register `./sw.js` (`{ scope: "./" }`) when `import.meta.env.PROD && supported` (never in `vite dev`, where SWs break HMR).

5. **Hub Install UX (`?install=1`):**
   - Browsers forbid triggering another page's `beforeinstallprompt` from the hub and require a user click on the target page.
   - `<PageCard />` renders `<a href="${entry.href}?install=1">Install App</a>` *only* when `import.meta.env.VITE_OFFLINE !== "true"` and `isPwaSupportedProtocol` is true.
   - The target page detects `?install=1`, opens the install modal immediately, strips `?install=1` with `history.replaceState`, and lets one click trigger `deferredPrompt.prompt()` (falling back to Safari/iOS/browser instructions when `beforeinstallprompt` is unavailable).
