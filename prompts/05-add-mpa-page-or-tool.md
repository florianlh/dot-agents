Add a new page/tool to this web lab following `AGENTS.md` and `.agents/dev/notes/`:

- Tool / page idea: [DESCRIBE_NEW_TOOL — e.g., "JSON Schema & Diff Inspector with side-by-side validation"]

Requirements:
1. Create a new page under `src/pages/<slug>/` with `index.html`, `main.tsx`, `content/PAGE.md` (with `title`, `tag`, `description`, and optional PWA metadata), and `content/SUMMARY.md`.
2. Reuse `src/shared/PageChrome.tsx`, `buildPageDocTabs()`, and `src/shared/theme.css`; keep pure logic/math/parsing in a separate testable module and add Vitest unit tests under `tests/`.
3. Add `<PageCard page="<slug>" />` to `src/hub/App.tsx`.
4. Evaluate bundle footprint for any new dependency (update `dev/notes/standalone-cdn-dependencies.md` if adding a heavy library).
5. Run `npm run typecheck`, `npm test`, and `npm run build` (and verify the built output works cleanly).
