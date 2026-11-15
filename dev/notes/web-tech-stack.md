# Web Tech Stack Recommendations *(Optional)*

Part of the [Web Project Bootstrap Guide](./web-project-bootstrap.md). See also [Vite MPA & Dual Build Setup](./vite-mpa-build.md) and [MDX, Content & Generic Hub](./mdx-and-content-hub.md).

The base template only requires **Vite**, **Preact**, **TypeScript**, and **MDX** (`@mdx-js/rollup` + `remark-*`/`rehype-*` plugins). Depending on the project, add only what fits—keeping standalone single-file `.html` bundle size in mind.

---

## 1. HTML, CSS & UI *(optional)*

- **Preferred CSS stack — Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/vite`):** First-party Vite plugin with zero PostCSS config (`@import "tailwindcss";` in `src/shared/theme.css`); automatically purges unused styles so standalone `.html` exports stay compact.
- **Suggested for all interactive projects:**
  - **`lucide-preact`** — Tree-shakeable SVG icons (only imported icons are bundled).
  - **`@preact/signals`** — Lightweight (~1.6 KB) fine-grained reactive state for interactive tools and shared controls.
  - **CodeMirror 6 (`codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-json`, `@codemirror/lang-yaml`, …)** — Modular, tree-shakeable editor for embedded JSON/YAML configs, shaders, or live text/code tools.
- **Alternatives (to propose if asked):**
  - **`daisyui` (v5):** Pure-CSS component classes and themes as a Tailwind v4 plugin (`@plugin "daisyui";`).
  - **`bootstrap` (v5):** Familiar grid, forms, tables, and components (prefer CSS-only or Sass partials + native `<dialog>`/`popover` to keep bundles light).
  - **`bulma`:** Pure-CSS (zero JS) Flexbox/Grid components and forms.
  - **`beercss`:** Small Material Design 3 CSS framework (lightweight alternative to heavy Material JS kits).
  - **`open-props`:** CSS custom-property design tokens for enhancing plain CSS.
  - **Classless CSS (`simpledotcss`, `water.css`, `Blades CSS`):** Drop-in semantic styling for quick utilities with zero classes *(note: Pico CSS was archived in Oct 2026; Blades CSS is its active successor)*.
  - **Web Awesome (`@awesome.me/webawesome`):** Framework-agnostic Web Components (successor to Shoelace) for rich widgets like split panels, color pickers, trees, and drawers.
  - **React + MUI / Mantine / Ant Design:** Only if switching `jsxImportSource` to `"react"` for complex multi-view apps where standalone bundle size matters less.

---

## 2. 2D Graphics, SVG & Custom Dataviz *(optional)*

- **Default for 2D graphics — SVG.js (`@svgdotjs/svg.js`):** Zero-dependency fluent API for generating, manipulating, animating, and exporting custom SVGs (procedural graphics, custom dataviz, and downloadable `.svg` output).
- **For Canvas & heavy interactive animations — Paper.js (`paper`):** Vector scene graph with Bézier path math, boolean geometry operations, and smooth frame-driven interactive animations.
- **Alternatives (to propose if asked):**
  - **`uplot`:** Ultra-fast, tiny (~45 KB) Canvas 2D charting for dense time-series, benchmarks, and scientific plots.
  - **`chart.js`:** Familiar general charts (bar, line, pie, radar, scatter) with tree-shakeable registration.
  - **Modular D3 (`d3-scale`, `d3-shape`, `d3-hierarchy`, `d3-force`, …):** Cherry-pick math/layout helpers for custom Preact `<svg>` or Canvas visualizations without bundling all of `d3`.
  - **`@observablehq/plot`:** Concise declarative grammar-of-graphics charting built on D3 for exploratory data analysis.
  - **`roughjs`:** Tiny (~9 KB) hand-drawn/sketchy rendering over SVG or Canvas.
  - **`konva`:** 2D Canvas object model with drag/drop, resize/rotate handles, layers, and hit-testing (great for editors and whiteboards).
  - **`pixi.js`:** WebGL/WebGPU-accelerated 2D renderer for particle-heavy simulations or thousands of sprites.
  - **`cytoscape`:** Interactive node-link graph/network visualization and layouts.
  - **`mermaid`:** Text-to-diagram rendering *(large bundle for standalone `.html` exports unless pre-rendered at build time)*.

---

## 3. 3D & WebGL / WebGPU *(optional)*

- **Base 3D stack — Babylon.js (`@babylonjs/core`, optionally `@babylonjs/gui`, `@babylonjs/loaders`):** Full-featured TypeScript-first 3D engine with PBR materials, shadows, physics/gizmos, and WebGL/WebGPU support; import tree-shakeable subpaths so standalone `.html` exports stay as compact as possible.
- **Alternatives (to propose if asked):**
  - **`three` (+ `@types/three`):** Leaner modular WebGL/WebGPU core for focused 3D/shader experiments with a large ecosystem.
  - **`twgl.js` / `regl`:** Minimal WebGL wrappers for raw GLSL shader and GPGPU experiments without a full scene graph.
  - **`playcanvas`:** Lightweight 3D engine focused on fast-loading interactive web scenes.
  - **`@google/model-viewer`:** Drop-in `<model-viewer>` Web Component when you only need to inspect `.glb`/`.gltf` models with orbit controls and lighting.

---

## 4. Document, Spreadsheet & Office Manipulation *(optional, client-side)*

### CSV & Tabular Data
- **Base stack — `papaparse` (+ `@types/papaparse`):** Fast, battle-tested browser CSV parser and serializer with streaming and Web Worker support.
- **Alternatives:** `d3-dsv` (~3 KB minimal RFC-4180 CSV/TSV parser/formatter).

### Excel (`.xlsx` / Spreadsheets)
- **Base stack — `read-excel-file` + `write-excel-file`:** Lightweight, actively maintained, browser-first (`*/browser` entrypoints with Web Workers) for clean tabular import/export and schema mapping.
- **Alternatives:** `exceljs` (full workbook control: formulas, cell styles, borders, column widths, multi-sheet editing); SheetJS (`xlsx`, broad legacy `.xls`/`.ods` support—note npm `0.18.5` is frozen from 2022 and newer releases use SheetJS's CDN/commercial licensing).

### Word (`.docx`) & PowerPoint (`.pptx`)
- **Base stack — `mammoth` (read `.docx` → HTML/Markdown), `docx` (write `.docx`), and `pptxgenjs` (write `.pptx`):** Clean client-side document extraction and generation without a server.
- **Alternatives:** `docxtemplater` + `pizzip` (fill existing `.docx`/`.pptx` templates with structured JSON data).

### PDF
- **Base stack — `pdf-lib`:** Lightweight client-side PDF creation, merging, splitting, rotation, watermarking, and form filling.
- **Alternatives:** `pdfjs-dist` (render PDF pages to Canvas or extract text in the browser; heavier worker-based runtime).

### Low-Level Office Open XML / ZIP Inspection
- **Base stack — `jszip`:** Inspect, extract, or patch `.xlsx`, `.docx`, and `.pptx` ZIP/XML internals directly when higher-level libraries don't expose a feature.
- **Alternatives:** `fflate` (ultra-light, high-speed ZIP compression/decompression).
