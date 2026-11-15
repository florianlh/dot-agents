Bootstrap this repository as a Vite MPA + MDX + Per-Page PWA web lab:

- Project name & purpose: [PROJECT_NAME — e.g., "Finance & Math Toolkit for everyday calculators"]
- First page/tool to implement: [FIRST_TOOL — e.g., "Compound Interest & Mortgage Simulator with interactive sliders and SVG chart"]
- Optional stack additions (from `.agents/dev/notes/web-tech-stack.md`): [OPTIONAL_STACK — e.g., "None / SVG.js / Paper.js / pdf-lib"]

Steps:
1. Add `https://github.com/florianlh/dot-agents.git` as a Git submodule at `.agents/` tracking `main` (`git submodule add -b main https://github.com/florianlh/dot-agents.git .agents` and `git config -f .gitmodules submodule..agents.update rebase`).
2. Follow `.agents/dev/notes/web-project-bootstrap.md` and its companion guides (`vite-mpa-build.md`, `mdx-and-content-hub.md`, `per-page-pwa.md`, `web-tech-stack.md`).
3. Scaffold the repo (`package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `AGENTS.md`, `dev/notes/standalone-cdn-dependencies.md`, `scripts/build-deploy.mjs`, `scripts/pwa/*`, `src/hub/App.tsx`, `src/shared/*`, and `tests/`).
4. Implement the first page under `src/pages/<slug>/` with `content/PAGE.md`, `content/SUMMARY.md`, polished UI, unit tests for pure logic, and wire it into `src/hub/App.tsx`.
5. Verify with `npm run typecheck`, `npm test`, `npm run build`, and `npm run build:offline`, then commit cleanly.
