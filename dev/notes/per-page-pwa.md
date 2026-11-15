# Per-Page PWA Installs & Offline Caching

Each page under `src/pages/<slug>/` (excluding the root hub `index.html`) is automatically built as an isolated, installable **Progressive Web App (PWA)** with offline caching inside `dist/` (both `npm run build` and `npm run build:mpa`).

> **Scope note:** PWAs require an `https://` or `localhost` origin. Portable single-file HTMLs (`dist/downloads/<slug>.html`, `dist-offline/`), as well as `file://` opens, omit PWA sidecars and skip Service Worker registration (checked via `VITE_OFFLINE !== "true"` and the presence of `<link rel="manifest">`).

---

## How It Works (Zero Per-Page Boilerplate)

1. **Metadata from `content/PAGE.md` (`scripts/pwa/pageMetadata.ts`):**
   Every page's Web App Manifest (`manifest.webmanifest`) is generated from its existing `content/PAGE.md` frontmatter, with optional overrides:
   ```yaml
   ---
   title: Grid Room Builder
   shortName: Grid Room           # optional (auto-derived if omitted)
   description: ...
   themeColor: "#0f172a"          # optional (default: "#0f172a")
   backgroundColor: "#0f172a"     # optional (default: "#0f172a")
   display: standalone            # optional: standalone | minimal-ui | fullscreen | browser
   icon: ./custom-logo.png        # optional custom PNG path relative to page dir
   pwa: true                      # set pwa: false to opt a page out
   ---
   ```

2. **Modular Auto-Generated Icons + Overrides (`scripts/pwa/iconGenerator.ts`):**
   - **Custom override lookup (checked in order inside `src/pages/<slug>/`):**
     1. Frontmatter `icon` path (relative to the page folder).
     2. Conventional `icon-192.png` and/or `icon-512.png`.
     3. Conventional single `icon.png` (its `IHDR` dimensions are read automatically).
   - **Default generator:** When no override file exists, `DefaultIconProvider` renders crisp `192×192` and `512×512` RGBA PNG icons using Node's built-in `node:zlib` (deterministic per-slug accent palette + 2-character badge derived from `tag`/`title`). Swap `IconProvider` in `scripts/pwa/iconGenerator.ts` to change the visual style or plug in another renderer later.

3. **Isolated Per-Page Service Worker (`scripts/pwa/serviceWorkerTemplate.ts` + `vitePwaPagesPlugin.ts`):**
   - Emits `manifest.webmanifest`, `sw.js`, `icon-192.png`, and `icon-512.png` directly into `dist/src/pages/<slug>/` (omitted when building `DOWNLOAD_BUNDLE=true` downloads or `OFFLINE=true` offline bundles).
   - Uses an isolated cache prefix (`babylonjs-lab-<slug>-<hash>`), so updating or caching one page never invalidates or pollutes another page's cache.
   - Walks Rollup's chunk graph (`chunk.imports`, `chunk.dynamicImports`, `viteMetadata.importedCss`, and `viteMetadata.importedAssets`) and precaches only that page's own `../../../assets/*` JS, CSS, and font chunks.

4. **Shared Runtime & Hub Install UX (`src/shared/pwa.ts`, `PageChrome.tsx`, `PageCard.tsx`):**
   - [`PageChrome`](../../src/shared/PageChrome.tsx) automatically calls [`initPagePwa()`](../../src/shared/pwa.ts) (skipped in `vite dev`, `file://`, `dist/downloads/`, and `dist-offline/`) and renders a top-bar **Install** button + **Install App** modal.
   - [`PageCard`](../../src/shared/PageCard.tsx) renders an **Install App** link (`./src/pages/<slug>/index.html?install=1`) when not in `VITE_OFFLINE` mode on HTTP(S)/`localhost` origins, alongside **Open** (`./src/pages/<slug>/index.html`) and **Download HTML** (`./downloads/<slug>.html`). Navigating with `?install=1` opens the page's install dialog immediately (stripping the query param cleanly) so one click triggers `beforeinstallprompt`—or displays browser-specific instructions (e.g. Safari Share → Add to Home Screen).
