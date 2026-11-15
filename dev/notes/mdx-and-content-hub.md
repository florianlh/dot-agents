# MDX, Content Conventions & Generic Hub

Part of the [Web Project Bootstrap Guide](./web-project-bootstrap.md). See also [Vite MPA & Dual Build Setup](./vite-mpa-build.md), [Per-Page PWA Installs & Offline Caching](./per-page-pwa.md), and [Web Tech Stack Recommendations](./web-tech-stack.md).

`@mdx-js/rollup` compiles both `.md` and `.mdx` files at build time into JSX modules, powering hub metadata cards (`content/PAGE.md`), PWA manifest configuration, and in-page documentation (`content/SUMMARY.md`, `content/*.mdx`, or shared repo docs).

---

## 1. Page Content Convention (`content/`)

Each page stores its Markdown/MDX documents under `src/pages/<slug>/content/`. Two conventional filenames power shared tooling:

1. **`content/PAGE.md`** — metadata and short summary displayed on the hub index card **and** read at build time by `scripts/pwa/pageMetadata.ts` to generate the page's PWA `manifest.webmanifest`:

   ```md
   ---
   title: JSON Formatter
   tag: Utility
   description: Format, validate, and inspect JSON payloads with collapsible tree paths.
   downloadName: JSON Formatter     # optional (defaults to title / slug)
   order: 10                        # optional sort order for getAllPageEntries()
   shortName: JSON Tool             # optional PWA short_name (auto-derived if omitted)
   themeColor: "#0f172a"            # optional PWA theme_color (default: "#0f172a")
   backgroundColor: "#0f172a"       # optional PWA background_color (default: "#0f172a")
   display: standalone              # optional: standalone | minimal-ui | fullscreen | browser
   icon: ./custom-logo.png          # optional custom PNG path relative to page dir
   pwa: true                        # set pwa: false to opt a page out of PWA generation
   ---
   ```

   *(If `description` is omitted in frontmatter, `<PageCard />` falls back to rendering the Markdown body of `PAGE.md` directly—useful when you want inline formatting like code spans in the card description.)*

2. **`content/SUMMARY.md`** *(plus any `*.md` / `*.mdx` in `content/` or elsewhere in the repo)* — page overviews, guides, or interactive MDX notes rendered inside the page's UI.

---

## 2. Shared Hub, PWA & MDX Helpers

### A. Page Metadata Registry (`src/shared/pageRegistry.ts`)

Loads every `/src/pages/*/content/PAGE.md` eagerly via `import.meta.glob` and exposes dual links (`href` for **Open** / **Install App**, and `downloadHref` switching automatically via `import.meta.env.VITE_OFFLINE`):

```ts
import type { MDXContent } from "mdx/types";

export interface PageFrontmatter {
  title?: string;
  tag?: string;
  description?: string;
  downloadName?: string;
  order?: number;
}

interface PageDocModule {
  default: MDXContent;
  frontmatter?: PageFrontmatter;
}

export interface PageEntry {
  slug: string;
  href: string;
  downloadHref: string;
  downloadName: string;
  title: string;
  tag?: string;
  description?: string;
  order: number;
  Body: MDXContent;
}

export function formatDownloadFilename(rawName: string, fallbackSlug: string): string {
  const sanitized = rawName
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+|[.\s]+$/g, "");

  const base = sanitized.length > 0 ? sanitized : fallbackSlug;
  return base.toLowerCase().endsWith(".html") ? base : `${base}.html`;
}

const modules = import.meta.glob<PageDocModule>("/src/pages/*/content/PAGE.md", {
  eager: true,
});

const registry = new Map<string, PageEntry>();

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/^\/src\/pages\/([^/]+)\/content\/PAGE\.md$/);
  if (!match) continue;

  const slug = match[1];
  const fm = mod.frontmatter ?? {};
  const title = fm.title ?? slug;
  const isOfflineBuild = import.meta.env.VITE_OFFLINE === "true";

  registry.set(slug, {
    slug,
    href: `./src/pages/${slug}/index.html`,
    downloadHref: isOfflineBuild
      ? `./src/pages/${slug}/index.html`
      : `./downloads/${slug}.html`,
    downloadName: formatDownloadFilename(fm.downloadName ?? title, slug),
    title,
    tag: fm.tag,
    description: fm.description,
    order: typeof fm.order === "number" ? fm.order : 999,
    Body: mod.default,
  });
}

export function getPageEntry(slug: string): PageEntry | undefined {
  return registry.get(slug);
}

export function getAllPageEntries(): PageEntry[] {
  return Array.from(registry.values()).sort(
    (a, b) => a.order - b.order || a.slug.localeCompare(b.slug),
  );
}
```

### B. Single-Line Hub Card Component (`src/shared/PageCard.tsx`)

Inserts a card with `PAGE.md` content plus:
1. **Open** -> `entry.href` (`./src/pages/<slug>/index.html`)
2. **Install App** *(only when `import.meta.env.VITE_OFFLINE !== "true"` and `isPwaSupportedProtocol(protocol, hostname)`)* -> `${entry.href}?install=1`
3. **Download HTML** -> `<a href={entry.downloadHref} download={resolvedDownloadName}>`

```tsx
import { formatDownloadFilename, getPageEntry } from "./pageRegistry";
import { isPwaSupportedProtocol } from "./pwa";

export interface PageCardProps {
  page: string;
  tag?: string;
  title?: string;
  description?: string;
  downloadName?: string;
}

export function PageCard({ page, tag, title, description, downloadName }: PageCardProps) {
  const entry = getPageEntry(page);
  if (!entry) {
    return (
      <article class="card card-missing">
        <h2>{page}</h2>
        <p>Missing <code>src/pages/{page}/content/PAGE.md</code>.</p>
      </article>
    );
  }

  const resolvedTag = tag ?? entry.tag;
  const resolvedTitle = title ?? entry.title;
  const resolvedDescription = description ?? entry.description;
  const resolvedDownloadName = downloadName
    ? formatDownloadFilename(downloadName, entry.slug)
    : title
      ? formatDownloadFilename(title, entry.slug)
      : entry.downloadName;
  const Body = entry.Body;
  const canShowInstall =
    import.meta.env.VITE_OFFLINE !== "true" &&
    typeof window !== "undefined" &&
    isPwaSupportedProtocol(window.location.protocol, window.location.hostname);

  return (
    <article class="card">
      {resolvedTag && <span class="card-tag">{resolvedTag}</span>}
      <h2 class="card-title">{resolvedTitle}</h2>
      <div class="card-desc">
        {resolvedDescription ? <p>{resolvedDescription}</p> : <Body />}
      </div>
      <div class="card-actions">
        <a href={entry.href}>Open</a>
        {canShowInstall && <a href={`${entry.href}?install=1`}>Install App</a>}
        <a href={entry.downloadHref} download={resolvedDownloadName}>
          Download HTML
        </a>
      </div>
    </article>
  );
}
```

> **Dev caveat:** In `npm run dev`, `./downloads/<slug>.html` is not served because single-file downloads are build artifacts, and Service Workers are disabled; always verify **Download HTML** and **Install App** via `npm run build && npm run preview`.

### C. Shared Page Chrome & PWA Modal (`src/shared/PageChrome.tsx`)

Every page uses `<PageChrome />` (or `mountPageChrome()`) to render a consistent top bar with:
- Back link (`../../../index.html`) and page title/subtitle
- **Docs** drawer button powered by `buildPageDocTabs(import.meta.glob("./content/*.{md,mdx}", { eager: true }))` (automatically excluding `PAGE.md` and placing `SUMMARY` first)
- Automatic PWA initialization (`useEffect(() => initPagePwa(), [])`), top-bar **Install** button (hidden when `VITE_OFFLINE === "true"`, missing manifest, unsupported protocol, or already installed), and **Install App** modal handling both `?install=1` auto-open and one-click `beforeinstallprompt` / manual browser hints. See [Per-Page PWA Installs & Offline Caching](./per-page-pwa.md).

### D. Shared MDX Rendering Helpers (`src/shared/mdx.tsx`)

Works in both Preact UIs (`<DocPanel />`) and plain DOM/Canvas/WebGL pages (`mountMdx()`):

```tsx
import { h, render } from "preact";
import type { MDXContent, MDXProps } from "mdx/types";

export function mountMdx(
  target: HTMLElement,
  Doc: MDXContent,
  props: MDXProps = {},
  className = "mdx-prose",
) {
  target.classList.add(className);
  render(h(Doc, props), target);
}

export function DocPanel({
  doc: Doc,
  title,
  props = {},
}: {
  doc: MDXContent;
  title?: string;
  props?: MDXProps;
}) {
  return (
    <section class="doc-panel mdx-prose">
      {title && <h2>{title}</h2>}
      <Doc {...props} />
    </section>
  );
}
```

---

## 3. Generic Index Hub (`index.html` + `src/hub/App.tsx`)

Keep `index.html` as a minimal generic shell:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Web Lab</title>
    <link rel="stylesheet" href="./src/shared/theme.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./src/hub/App.tsx"></script>
  </body>
</html>
```

In `src/hub/App.tsx`, organize pages explicitly into custom groups/sections while letting `<PageCard />` pull metadata and links from `content/PAGE.md`:

```tsx
import { render } from "preact";
import { PageCard } from "../shared/PageCard";

function App() {
  return (
    <>
      <header class="hub-header">
        <span class="badge">Web Lab</span>
        <h1>Tools &amp; Interactive Experiments</h1>
        <p class="subtitle">
          A collection of standalone utilities and prototypes sharing common code and docs.
        </p>
      </header>

      <main class="hub-sections">
        <section class="group">
          <h2>Developer Utilities</h2>
          <div class="grid">
            <PageCard page="json-formatter" />
            <PageCard page="color-contrast" />
          </div>
        </section>

        <section class="group">
          <h2>Graphics &amp; Shaders</h2>
          <div class="grid">
            <PageCard page="shader-sandbox" />
          </div>
        </section>
      </main>
    </>
  );
}

render(<App />, document.getElementById("app")!);
```

> **Tip:** If you prefer authoring the hub prose itself in Markdown/MDX, `src/hub/App.tsx` can mount a `src/hub/index.mdx` file that imports `PageCard` and mixes Markdown headings/notes with single-line `<PageCard page="..." />` embeds. And if you ever want an automatic catch-all section, `getAllPageEntries()` is already available in `pageRegistry.ts`.

---

## 4. Using `.md` / `.mdx` Files Inside Page UIs

Every `.md` and `.mdx` file anywhere in the project compiles to a standard ES module—whether inside the page's own `content/` folder or shared across the repo.

### Example 1: Page with `PageChrome` & Auto-Discovered Docs (`src/pages/shader-sandbox/main.tsx`)

```tsx
import { buildPageDocTabs, mountPageChrome } from "../../shared/PageChrome";

const localDocs = import.meta.glob("./content/*.{md,mdx}", { eager: true });
const docs = buildPageDocTabs(localDocs);

mountPageChrome({
  title: "Shader Sandbox",
  docs,
});
```

### Example 2: MDX with Interactive Components (`src/pages/json-formatter/content/NOTES.mdx`)

```mdx
---
title: Format Notes
---

Supports **JSON5-like comments** stripping before formatting.

<Callout kind="info">
  Exported HTML files keep all help docs bundled offline.
</Callout>
```

Render it in `main.tsx` (passing any custom components via the `components` prop) or with `mountMdx(el, NotesDoc, { components: { Callout } })`.

---

## 5. MDX Caveats

- **`.md` vs. `.mdx` parsing:** `@mdx-js/rollup` parses `.md` files with standard Markdown rules (so literal `<` or `{` characters in existing docs/READMEs won't error), while `.mdx` files enable JSX components and JS expressions (requiring `\<` or `\{` for literal angle brackets/braces in prose).
- **Zero runtime Markdown parser:** Both `.md` and `.mdx` compile to JS at build time (along with `remark-math`/`rehype-katex` and `rehype-highlight`), so standalone HTML exports ship no Markdown parser.
- **CSS for math & code blocks:** Import `katex/dist/katex.min.css` and a `highlight.js/styles/*.css` theme in `src/shared/theme.css`. In CDN download builds (`dist/downloads/<slug>.html`) and offline builds (`dist-offline/`), `standaloneStylesPlugin` in `vite.config.ts` handles externalizing or trimming them automatically—see [Vite MPA & Dual Build Setup](./vite-mpa-build.md).
