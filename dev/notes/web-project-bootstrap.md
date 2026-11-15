# Web Project Bootstrap Guide (Vite MPA + MDX)

A reusable template guide for repositories hosting multiple related web pages, tools, utilities, or experiments in one codebase with shared logic, styles, and `.md`/`.mdx` documentation.

## Documentation Map

| Document | Focus |
| :--- | :--- |
| **[Vite MPA & Dual Build Setup](./vite-mpa-build.md)** | Page auto-discovery, fast shared-asset `dist-dev/` build, standalone `dist/` deployment build, `scripts/build-deploy.mjs`, and deployment caveats |
| **[MDX, Content & Generic Hub](./mdx-and-content-hub.md)** | `@mdx-js/rollup` (`.md` + `.mdx`), `content/PAGE.md` & `SUMMARY.md` conventions, `pageRegistry.ts`, `<PageCard />`, `mountMdx()`, and `src/hub/App.tsx` |
| **[Web Tech Stack Recommendations](./web-tech-stack.md)** | Optional CSS/UI, CodeMirror 6, 2D/SVG, 3D (Babylon.js), and client-side document/Office libraries |

---

## Core Architecture

- **Local Dev Server (`npm run dev`):** Instant Vite HMR across the hub, all pages, and `.md`/`.mdx` files.
- **Fast Dev Build (`npm run build:dev`):** Single-pass MPA build into `dist-dev/` with shared JS/CSS chunks for quick local/CI verification.
- **Deployment Build (`npm run build`):** Compiles the hub and every auto-discovered page into self-contained `.html` bundles under `dist/`, keeping identical relative URLs so the hub's **Open** and **Download HTML** links both work seamlessly.
- **Zero Manual Page Lists:** Any subdirectory under `src/pages/` containing an `index.html` is picked up automatically by both `vite.config.ts` and `scripts/build-deploy.mjs`.
- **Zero-Runtime Markdown/MDX:** `.md` and `.mdx` files compile at build time via `@mdx-js/rollup` into lightweight Preact JSX modules.

---

## 1. Project Folder Structure

```text
my-web-lab/
├── index.html                        # Generic hub shell mounting src/hub/App.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts                    # Auto-discovers src/pages/*/index.html + MDX
├── scripts/
│   └── build-deploy.mjs              # Cleans dist/ and builds hub + standalone pages
└── src/
    ├── vite-env.d.ts                 # Vite + @types/mdx + frontmatter types
    ├── hub/
    │   └── App.tsx                   # Grouped hub layout using <PageCard page="..." />
    ├── shared/
    │   ├── theme.css                 # Shared theme, cards, and .mdx-prose styles
    │   ├── layout.ts                 # Shared page header / shell helpers
    │   ├── mdx.tsx                   # mountMdx() + <DocPanel /> for any .md/.mdx
    │   ├── pageRegistry.ts           # Loads src/pages/*/content/PAGE.md metadata
    │   ├── PageCard.tsx              # Single-line hub card with Open + Download links
    │   └── docs/                     # Project-wide shared docs usable by any page
    │       └── SHORTCUTS.md
    └── pages/                        # Each subdirectory with index.html is an entry
        ├── json-formatter/
        │   ├── index.html
        │   ├── main.ts
        │   └── content/
        │       ├── PAGE.md           # Hub title, tag, and short description
        │       ├── SUMMARY.md        # Page overview / help rendered in the UI
        │       └── NOTES.mdx         # Rich interactive MDX doc
        ├── shader-sandbox/
        │   ├── index.html
        │   ├── main.ts
        │   └── content/
        │       ├── PAGE.md
        │       └── SUMMARY.md
        └── color-contrast/
            ├── index.html
            ├── main.ts
            └── content/
                ├── PAGE.md
                └── SUMMARY.md
```

Subdirectories under `src/pages/` without an `index.html` (drafts or helper folders) are ignored automatically.

---

## 2. Base Dependencies

Preact keeps standalone single-file HTML bundles compact (~4 KB runtime) while providing a standard JSX runtime for `@mdx-js/rollup`. (If you prefer React or Solid, swap `preact` and adjust `jsxImportSource`.)

```bash
npm install preact
npm install -D vite typescript @types/node @types/mdx vite-plugin-singlefile \
  @mdx-js/rollup remark-frontmatter remark-mdx-frontmatter remark-gfm \
  remark-math rehype-katex rehype-highlight katex
```

> Import `katex/dist/katex.min.css` and a syntax theme such as `highlight.js/styles/github-dark.css` in `src/shared/theme.css` (or `src/shared/mdx.tsx`). All math and code highlighting runs at build time—zero runtime parser JS is shipped.

For optional UI, 2D/3D graphics, and document/Office libraries, see [Web Tech Stack Recommendations](./web-tech-stack.md).

---

## 3. TypeScript Quick Reference

`tsconfig.json`:

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
  "include": ["src", "vite.config.ts"]
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
    "build:dev": "vite build",
    "preview": "vite preview --outDir dist",
    "preview:dev": "vite preview --outDir dist-dev",
    "typecheck": "tsc --noEmit"
  }
}
```

```bash
npm run dev                        # Fast HMR dev server (hub + all pages + MDX)
npm run build:dev                  # Fast shared-asset MPA build into dist-dev/
npm run preview:dev                # Preview shared-asset build
npm run build                      # Main deployment build: standalone HTMLs in dist/
npm run build -- json-formatter    # Rebuild a single standalone page into dist/
npm run preview                    # Preview dist/ over HTTP (verifies Open + Download)
```

---

## Next Steps

1. Configure `vite.config.ts` and `scripts/build-deploy.mjs` using **[Vite MPA & Dual Build Setup](./vite-mpa-build.md)**.
2. Set up `content/`, `<PageCard />`, and shared MDX rendering using **[MDX, Content & Generic Hub](./mdx-and-content-hub.md)**.
3. Pick project-specific packages from **[Web Tech Stack Recommendations](./web-tech-stack.md)**.
