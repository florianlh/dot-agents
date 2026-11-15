# MDX, Content Conventions & Generic Hub

Part of the [Web Project Bootstrap Guide](./web-project-bootstrap.md). See also [Vite MPA & Dual Build Setup](./vite-mpa-build.md) and [Web Tech Stack Recommendations](./web-tech-stack.md).

`@mdx-js/rollup` compiles both `.md` and `.mdx` files at build time into JSX modules, powering both hub metadata cards (`content/PAGE.md`) and in-page documentation (`content/SUMMARY.md`, `content/*.mdx`, or shared repo docs).

---

## 1. Page Content Convention (`content/`)

Each page stores its Markdown/MDX documents under `src/pages/<slug>/content/`. Two conventional filenames power shared tooling:

1. **`content/PAGE.md`** — metadata and short summary displayed on the hub index card:

   ```md
   ---
   title: JSON Formatter
   tag: Utility
   description: Format, validate, and inspect JSON payloads with collapsible tree paths.
   ---
   ```

   *(If `description` is omitted in frontmatter, `<PageCard />` falls back to rendering the Markdown body of `PAGE.md` directly—useful when you want inline formatting like code spans in the card description.)*

2. **`content/SUMMARY.md`** *(plus any `*.md` / `*.mdx` in `content/` or elsewhere in the repo)* — page overviews, guides, or interactive MDX notes rendered inside the page's UI.

---

## 2. Shared Hub & MDX Helpers

### A. Page Metadata Registry (`src/shared/pageRegistry.ts`)

Loads every `/src/pages/*/content/PAGE.md` eagerly via `import.meta.glob` and exposes a lookup by folder slug:

```ts
import type { MDXContent } from "mdx/types";

export interface PageFrontmatter {
  title?: string;
  tag?: string;
  description?: string;
}

interface PageDocModule {
  default: MDXContent;
  frontmatter?: PageFrontmatter;
}

export interface PageEntry {
  slug: string;
  href: string;
  downloadName: string;
  title: string;
  tag?: string;
  description?: string;
  Body: MDXContent;
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
  registry.set(slug, {
    slug,
    href: `./src/pages/${slug}/index.html`,
    downloadName: `${slug}.html`,
    title: fm.title ?? slug,
    tag: fm.tag,
    description: fm.description,
    Body: mod.default,
  });
}

export function getPageEntry(slug: string): PageEntry | undefined {
  return registry.get(slug);
}

export function getAllPageEntries(): PageEntry[] {
  return Array.from(registry.values());
}
```

### B. Single-Line Hub Card Component (`src/shared/PageCard.tsx`)

Inserts a card with `PAGE.md` content plus **Open** and **Download HTML** links in one line (`<PageCard page="..." />`). Always set `download="<slug>.html"` so browsers save a descriptive filename rather than `index.html`:

```tsx
import { getPageEntry } from "./pageRegistry";

export interface PageCardProps {
  page: string;
  tag?: string;
  title?: string;
  description?: string;
}

export function PageCard({ page, tag, title, description }: PageCardProps) {
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
  const Body = entry.Body;

  return (
    <article class="card">
      {resolvedTag && <span class="card-tag">{resolvedTag}</span>}
      <h2 class="card-title">{resolvedTitle}</h2>
      <div class="card-desc">
        {resolvedDescription ? <p>{resolvedDescription}</p> : <Body />}
      </div>
      <div class="card-actions">
        <a href={entry.href}>Open</a>
        <a href={entry.href} download={entry.downloadName}>
          Download HTML
        </a>
      </div>
    </article>
  );
}
```

### C. Shared MDX Rendering Helpers (`src/shared/mdx.tsx`)

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

### Example 1: Plain TypeScript / Canvas Page (`src/pages/shader-sandbox/main.ts`)

```ts
import { mountPageHeader } from "../../shared/layout";
import { mountMdx } from "../../shared/mdx";
import SummaryDoc from "./content/SUMMARY.md";
import ShortcutsDoc from "../../shared/docs/SHORTCUTS.md";

mountPageHeader("Shader Sandbox");

const infoDrawer = document.getElementById("info-drawer")!;
mountMdx(infoDrawer, SummaryDoc);

const helpModal = document.getElementById("help-modal")!;
mountMdx(helpModal, ShortcutsDoc);
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

> **Tip (Auto-listing a page's `content/` docs):** Inside any page that has multiple docs in `content/`, load them together with:
> ```ts
> const localDocs = import.meta.glob("./content/*.{md,mdx}", { eager: true });
> ```
> Filter out `PAGE.md` and render tabs or a sidebar from the remaining modules.

---

## 5. MDX Caveats

- **`.md` vs. `.mdx` parsing:** `@mdx-js/rollup` parses `.md` files with standard Markdown rules (so literal `<` or `{` characters in existing docs/READMEs won't error), while `.mdx` files enable JSX components and JS expressions (requiring `\<` or `\{` for literal angle brackets/braces in prose).
- **Zero runtime Markdown parser:** Both `.md` and `.mdx` compile to JS at build time (along with `remark-math`/`rehype-katex` and `rehype-highlight`), so standalone HTML exports ship no Markdown parser.
- **CSS for math & code blocks:** Remember to import `katex/dist/katex.min.css` and a `highlight.js/styles/*.css` theme in `src/shared/theme.css` or `src/shared/mdx.tsx`.
