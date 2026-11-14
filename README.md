# dot-agents
Shared `.agents/` dir for my personal projects.

Made public to ease auth issues with private submodules in CI or agent VMs, not intending to share or provide anything of value.

## What's Inside

- **`skills/`** — [obra/superpowers](https://github.com/obra/superpowers) agent skills, installed with `npx skills` using the `--copy` option (copied rather than symlinked so files are self-contained and tracked cleanly in Git).
- **Web project bootstrap notes** — Vite MPA, MDX content hub, and web tech stack notes (written in `babylonjs-lab/dev/notes/`).

## Usage in Projects

Add as a submodule (from another repo under the same GitHub owner):

```bash
git submodule add ../dot-agents.git .agents
```

Initialize in an existing clone:

```bash
git submodule update --init --recursive
```

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

```bash
git submodule update --remote .agents
git add .agents
git commit -m "chore: update .agents submodule"
```
