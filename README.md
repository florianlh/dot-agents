# dot-agents
Shared `.agents/` dir for my personal projects.

Made public to ease auth issues with private submodules in CI or agent VMs, not intending to share or provide anything of value.

## What's Inside

- **`skills/`** — [obra/superpowers](https://github.com/obra/superpowers) agent skills, installed with `npx skills` using the `--copy` option (copied rather than symlinked so files are self-contained and tracked cleanly in Git).
- **[`dev/notes/`](./dev/notes/web-project-bootstrap.md)** — Web project bootstrap notes:
  - [Web Project Bootstrap Guide](./dev/notes/web-project-bootstrap.md)
  - [Vite MPA & Dual Build Setup](./dev/notes/vite-mpa-build.md)
  - [MDX, Content Conventions & Generic Hub](./dev/notes/mdx-and-content-hub.md)
  - [Web Tech Stack Recommendations](./dev/notes/web-tech-stack.md)
  - [Per-Page PWA Installs & Offline Caching](./dev/notes/per-page-pwa.md)
- **[`prompts/`](./prompts/README.md)** — Reusable starter prompts and submodule snippets (including friend/family quickstart prompts for Antigravity Cloud).
- **[`docs/`](./docs/index.html)** — Static GitHub Pages site (`Settings -> Pages -> Deploy from a branch -> main / docs`) with general documentation, prompt template customizer, and one-click copy buttons.

## Usage in Projects

Add as a submodule tracking `main` with `update = rebase` (use `https://github.com/florianlh/dot-agents.git` from any GitHub account, or `../dot-agents.git` from another repo under `florianlh`):

```bash
git submodule add -b main https://github.com/florianlh/dot-agents.git .agents
git config -f .gitmodules submodule..agents.update rebase
```

Initialize in an existing clone:

```bash
git submodule update --init --recursive
```

> **Note (Detached `HEAD` on fresh clones / agent VMs):** `git clone --recurse-submodules` and `git submodule update --init` always check out `.agents/` in a detached `HEAD` at the commit pinned by the parent repo. That is fine for read-only consumption, but in a fresh clone or agent VM—before editing, committing, or pushing changes directly inside `.agents/`—first check out `main` (e.g. `git -C .agents switch main && git -C .agents pull --ff-only`, or `git -C .agents checkout -B main origin/main` if behind) so changes aren't left on a detached `HEAD`.

## Updating

### Updating skills in `dot-agents`

Re-run `npx skills` with `--copy` from the repo root, then commit and push:

```bash
npx skills add obra/superpowers --copy
git add skills/
git commit -m "chore: update superpowers skills"
git push
```

### Pulling updates into a consuming project

With `branch = main` and `update = rebase` in `.gitmodules`, pull the latest `origin/main` (rebasing any local submodule commits) and commit the updated submodule pointer in the consuming repo:

```bash
git submodule update --remote .agents
git add .agents
git commit -m "chore: update .agents submodule"
```

*(Note: plain `git submodule update` without `--remote` rebases onto the commit pinned by the parent repo, not `origin/main`, and `update = rebase` assumes `dot-agents` `main` history is not force-pushed.)*
