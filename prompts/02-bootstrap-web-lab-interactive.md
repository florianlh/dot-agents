Let's bootstrap this repository as a multi-page web lab using the shared `.agents` setup:

1. Attach `https://github.com/florianlh/dot-agents.git` as a Git submodule at `.agents/` tracking `main` with `update = rebase`:
   - Run `git submodule add -b main https://github.com/florianlh/dot-agents.git .agents` and `git config -f .gitmodules submodule..agents.update rebase` (if `.agents/` already exists, preserve any existing files before converting it to a submodule).
2. Read the bootstrap guides in `.agents/dev/notes/web-project-bootstrap.md`, `vite-mpa-build.md`, `mdx-and-content-hub.md`, `per-page-pwa.md`, and `web-tech-stack.md`.
3. Before writing application code, ask me a few short questions to clarify:
   - What the project should be named and what it's generally for.
   - What first tool, page, or interactive experiment I want to build first (or propose 2–3 starter ideas if I'm not sure yet).
   - Whether I want any optional libraries from `.agents/dev/notes/web-tech-stack.md` (e.g., 2D SVG/Canvas, 3D, charts, CodeMirror, spreadsheets/PDF).
4. Once I answer, scaffold the full Vite MPA + Preact + Tailwind + MDX + Per-Page PWA project structure (including `AGENTS.md`, `dev/notes/standalone-cdn-dependencies.md`, `scripts/build-deploy.mjs`, `scripts/pwa/`, `src/hub/`, `src/shared/`, and my first `src/pages/<slug>/` app).
5. Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run build:offline` to verify everything passes, then commit the work and share how to preview and use it.
