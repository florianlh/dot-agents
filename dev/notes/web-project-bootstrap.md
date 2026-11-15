# Web Project Bootstrap Guide (Vite MPA + MDX + Per-Page PWA)

A reusable template guide for repositories hosting multiple related web pages, tools, utilities, or experiments in one codebase with shared logic, styles, `.md`/`.mdx` documentation, and isolated per-page PWAs.

## Documentation Map

| Document | Focus |
| :--- | :--- |
| **[Vite MPA & Dual Build Setup](./vite-mpa-build.md)** | Page auto-discovery, 3-mode build (`dist/` chunked MPA + `dist/downloads/<slug>.html`, `build:mpa`, `dist-offline/`), `standaloneStylesPlugin`, `scripts/build-deploy.mjs`, and deployment caveats |
| **[MDX, Content & Generic Hub](./mdx-and-content-hub.md)** | `@mdx-js/rollup` (`.md` + `.mdx`), `content/PAGE.md` & `SUMMARY.md` conventions, `pageRegistry.ts` dual links, `<PageCard />` (**Open**, **Install App**, **Download HTML**), `PageChrome` PWA modal, and `mountMdx()` |
| **[Per-Page PWA Installs & Offline Caching](./per-page-pwa.md)** | Isolated per-page `manifest.webmanifest`, `sw.js`, `IconProvider` + custom PNG overrides, `hasManifest` + `VITE_OFFLINE` runtime guards, and `?install=1` UX |
| **[Web Tech Stack Recommendations](./web-tech-stack.md)** | Case-by-case CDN externalization policy & `standalone-cdn-dependencies.md` template, optional CSS/UI, CodeMirror 6, 2D/SVG, 3D (Babylon.js `sideEffects` note), and client-side document/Office libraries |

---

## Core Architecture & Three Build Modes

- **Local Dev Server (`npm run dev`):** Instant Vite HMR across the hub, all pages, and `.md`/`.mdx` files (no Service Worker; `./downloads/<slug>.html` targets don't exist in dev).
- **Default Production Build (`npm run build` -> `dist/`):** Targets both static web hosting (e.g., Vercel Hobby auto-build, GitHub Pages, Netlify) and single-file downloads cleanly in two passes:
  1. **Hosted Chunked MPA + Per-Page PWAs (`dist/index.html`, `dist/src/pages/<slug>/`, `dist/assets/`):** Fast shared JS/CSS/font chunks + isolated per-page Service Workers & manifests powering the hub's **Open** and **Install App** links.
  2. **Standalone Downloads with CDN Styles (`dist/downloads/<slug>.html`):** Single-file `.html` bundles emitted per page for the hub's **Download HTML** links (`download="<Pretty Name>.html"`), with KaTeX/Highlight.js styles loaded from jsDelivr CDN and **no** PWA sidecars.
- **Purpose of Standalone `.html` Downloads (`dist/downloads/<slug>.html`):** To **test or share built tools without any web hosting** (opening directly via `file://` or sharing a single `.html` file), **assuming the user still has an internet connection**.
- **Full Air-Gapped Offline Bundles (`npm run build:offline` -> `dist-offline/`):** Explicit secondary build option for environments with zero network access.
- **Zero Manual Page Lists:** Any subdirectory under `src/pages/` containing an `index.html` is picked up automatically by both `vite.config.ts` and `scripts/build-deploy.mjs`.
- **Zero-Runtime Markdown/MDX:** `.md` and `.mdx` files compile at build time via `@mdx-js/rollup` into lightweight Preact JSX modules.

| Mode | Command | Output | Strategy & Purpose |
| :--- | :--- | :--- | :--- |
| **Default Production Build** | `npm run build` | `dist/` (`assets/`, `src/pages/<slug>/`, `downloads/<slug>.html`) | Ideal for Vercel/static auto-builds: hosts chunked MPA + per-page PWAs at `./src/pages/<slug>/index.html` and serves CDN-backed single-file downloads at `./downloads/<slug>.html`. |
| **Fast MPA-Only Pass** | `npm run build:mpa` | `dist/` *(without `downloads/`)* | Single-pass chunked MPA + per-page PWAs for quick CI/local hosted verification (skips compiling single-file download artifacts). |
| **Offline Standalone** | `npm run build:offline` | `dist-offline/` | 100% self-contained single `.html` per entry with `.woff2`-trimmed inline KaTeX fonts, **no** PWA sidecars, **no** **Install App** button, and **Download HTML** pointing directly to `./src/pages/<slug>/index.html`. |

---

## 1. Project Folder Structure

```text
my-web-lab/
├── .gitignore                        # Includes node_modules/, dist/, dist-offline/
├── AGENTS.md                         # Project conventions & verification gate (see checklist below)
├── index.html                        # Generic hub shell mounting src/hub/App.tsx
├── package.json
├── tsconfig.json                     # Includes "src", "tests", "scripts", "vite.config.ts"
├── vite.config.ts                    # Auto-discovers src/pages/*/index.html + MDX + styles + PWA
├── dev/
│   └── notes/
│       └── standalone-cdn-dependencies.md  # Per-project CDN/bundle footprint decisions
├── scripts/
│   ├── build-deploy.mjs              # Dual-pass dist/ + --offline dist-offline/ orchestrator
│   └── pwa/
│       ├── iconGenerator.ts          # IconProvider + zero-dep PNG generator + overrides
│       ├── pageMetadata.ts           # Reads src/pages/<slug>/content/PAGE.md frontmatter
│       ├── serviceWorkerTemplate.ts  # Generates isolated per-page sw.js
│       └── vitePwaPagesPlugin.ts     # Emits manifest, sw.js & icons per hosted page
├── tests/                            # Vitest unit tests
└── src/
    ├── vite-env.d.ts                 # Vite + @types/mdx + frontmatter types
    ├── hub/
    │   └── App.tsx                   # Grouped hub layout using <PageCard page="..." />
    ├── shared/
    │   ├── theme.css                 # Shared theme, Tailwind, KaTeX/HLJS imports & .mdx-prose
    │   ├── mdx.tsx                   # mountMdx() + <DocPanel /> for any .md/.mdx
    │   ├── pageRegistry.ts           # Loads src/pages/*/content/PAGE.md metadata + dual links
    │   ├── PageCard.tsx              # Hub card with Open, Install App, and Download HTML links
    │   ├── PageChrome.tsx            # Shared top bar, docs drawer, and PWA Install modal
    │   ├── pwa.ts                    # Runtime PWA guards, SW registration & install prompt signals
    │   └── docs/                     # Project-wide shared docs usable by any page
    │       └── SHORTCUTS.md
    └── pages/                        # Each subdirectory with index.html is an entry
        ├── json-formatter/
        │   ├── index.html
        │   ├── main.tsx
        │   ├── icon.png              # Optional custom PWA icon (or icon-192.png / icon-512.png)
        │   └── content/
        │       ├── PAGE.md           # Hub metadata + PWA manifest frontmatter
        │       ├── SUMMARY.md        # Page overview / help rendered in the UI
        │       └── NOTES.mdx         # Rich interactive MDX doc
        ├── shader-sandbox/
        │   ├── index.html
        │   ├── main.tsx
        │   └── content/
        │       ├── PAGE.md
        │       └── SUMMARY.md
        └── color-contrast/
            ├── index.html
            ├── main.tsx
            └── content/
                ├── PAGE.md
                └── SUMMARY.md
```

Subdirectories under `src/pages/` without an `index.html` (drafts or helper folders) are ignored automatically.

---

## 2. Base Dependencies

Preact + `@preact/signals` keep both hosted chunks and standalone single-file HTML bundles compact (~20–25 kB minified with `lucide-preact`) while providing a standard JSX runtime for `@mdx-js/rollup`.

```bash
npm install preact @preact/signals lucide-preact
npm install -D vite typescript @types/node @types/mdx vite-plugin-singlefile \
  tailwindcss @tailwindcss/vite @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter \
  remark-gfm remark-math rehype-katex rehype-highlight katex highlight.js vitest
```

> - Import `katex/dist/katex.min.css` and a syntax theme such as `highlight.js/styles/github-dark.css` in `src/shared/theme.css`. All math and code highlighting runs at build time—zero runtime parser JS is shipped.
> - `vite.config.ts` reads installed versions of `katex` and `highlight.js` directly from `node_modules/` to emit exact jsDelivr `<link>` tags in CDN download builds (`dist/downloads/<slug>.html`) and `.woff2`-only inline fonts in offline builds (`dist-offline/`).

For optional UI, 2D/3D graphics, document/Office libraries, and the **case-by-case CDN externalization policy**, see [Web Tech Stack Recommendations](./web-tech-stack.md).

---

## 3. TypeScript, `.gitignore` & `vite-env.d.ts`

`.gitignore`:

```gitignore
node_modules/
dist/
dist-offline/
```

`tsconfig.json` (includes `"scripts"` so TypeScript Vite/PWA plugins under `scripts/` are typechecked):

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "noEmit": true,
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests", "scripts", "vite.config.ts"]
}
```

`src/vite-env.d.ts` (merges `frontmatter` onto `@types/mdx` without redeclaring `default`):

```ts
/// <reference types="vite/client" />
/// <reference types="@types/mdx" />

declare module "*.md" {
  export const frontmatter: Record<string, unknown> | undefined;
}

declare module "*.mdx" {
  export const frontmatter: Record<string, unknown> | undefined;
}
```

---

## 4. `package.json` Scripts & Daily Workflow

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "node scripts/build-deploy.mjs",
    "build:mpa": "vite build",
    "build:offline": "node scripts/build-deploy.mjs --offline",
    "preview": "vite preview --outDir dist",
    "preview:offline": "vite preview --outDir dist-offline",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

```bash
npm run dev                        # Fast HMR dev server (hub + all pages + MDX; no SW/downloads)
npm run build:mpa                  # Fast single-pass chunked MPA + per-page PWAs into dist/
npm run build                      # Full production build -> dist/ (MPA + PWAs + downloads/*.html)
npm run build -- json-formatter    # Rebuild one CDN-backed standalone download into dist/downloads/
npm run preview                    # Preview dist/ over HTTP (verifies Open, Install App & Download HTML)
npm run build:offline              # Full air-gapped single-file build -> dist-offline/
npm run preview:offline            # Preview dist-offline/ over HTTP
npm run typecheck && npm test      # Typecheck src/, tests/, scripts/ and run Vitest suite
```

---

## 5. Starter `AGENTS.md` Checklist for Bootstrapped Projects

Add a concise `AGENTS.md` at the root of every newly bootstrapped project covering these five areas:

1. **Build Modes & Output Directories:**
   - `npm run dev`: HMR dev server (no Service Worker; `Download HTML` targets don't exist in dev).
   - `npm run build` -> `dist/`: Production build for Vercel/static hosting — Pass 1 emits chunked MPA + isolated per-page PWAs (`dist/src/pages/<slug>/`); Pass 2 emits standalone CDN-style HTML downloads (`dist/downloads/<slug>.html`).
   - `npm run build:mpa` -> `dist/`: Fast single-pass chunked MPA + per-page PWAs (skips `downloads/*.html`).
   - `npm run build:offline` -> `dist-offline/`: Air-gapped single `.html` bundles (`.woff2`-only inline fonts, no PWA sidecars, **Install App** hidden).
   - Always verify hub **Open**, **Install App**, and **Download HTML** flows with `npm run build && npm run preview` (not `vite dev` and not `file://`).
2. **Dependency Management & Documentation Policy:**
   - Evaluate bundle footprint impact before adding dependencies.
   - Decide CDN externalization **case by case**; keep small UI/runtime libraries (`preact`, `@preact/signals`, icon packs) bundled to avoid singleton identity bugs.
   - Update `dev/notes/standalone-cdn-dependencies.md` whenever adding a heavy dependency, externalizing one, or discovering bundling/tree-shaking quirks (e.g., `sideEffects: true`, duplicate state singletons).
3. **MPA Page, PWA & MDX Conventions:**
   - Pages auto-discover via `src/pages/<slug>/index.html` (never name a page `main`).
   - `content/PAGE.md` frontmatter drives both hub `<PageCard />` metadata and PWA `manifest.webmanifest` (`title`, `shortName`, `themeColor`, `icon`, `pwa: false`).
   - Custom page icons live at `src/pages/<slug>/icon.png` (or `icon-192.png` + `icon-512.png`); otherwise icons auto-generate cleanly.
   - Use `.md` for plain docs with literal `<` / `{` characters; use `.mdx` when embedding JSX components like `<Callout />`.
4. **Asset Placement:**
   - Place large static media that doesn't require offline single-file embedding in `public/` (referenced by relative URL) rather than importing into JS/CSS bundles.
5. **Verification Gate:**
   - Run `npm run typecheck`, `npm test`, and `npm run build`; when modifying `vite.config.ts`, `src/shared/theme.css`, `pageRegistry.ts`, or `scripts/pwa/`, also verify `npm run build:offline` and preview `dist/` + `dist-offline/`.

---

## Next Steps

1. Configure `vite.config.ts` and `scripts/build-deploy.mjs` using **[Vite MPA & Dual Build Setup](./vite-mpa-build.md)**.
2. Set up `content/`, `<PageCard />`, `PageChrome`, and shared MDX rendering using **[MDX, Content & Generic Hub](./mdx-and-content-hub.md)**.
3. Set up isolated manifests, icon generation, and Service Workers using **[Per-Page PWA Installs & Offline Caching](./per-page-pwa.md)**.
4. Pick project-specific packages and set up `dev/notes/standalone-cdn-dependencies.md` using **[Web Tech Stack Recommendations](./web-tech-stack.md)**.
