# Attach `dot-agents` as `.agents/` Submodule

Use this standalone snippet when you want to add `.agents/` to an existing or empty repository without bootstrapping the rest of the project yet.

## Prompt (Any GitHub Account)

```text
Add `https://github.com/florianlh/dot-agents.git` as a Git submodule at `.agents/` tracking the `main` branch with `update = rebase`:

1. If an `.agents/` directory already exists and is tracked or non-empty, back up any unique files first, remove the old `.agents/` tracking, add the submodule with `git submodule add -b main https://github.com/florianlh/dot-agents.git .agents`, and configure `git config -f .gitmodules submodule..agents.update rebase`.
2. Ensure `.agents/` is checked out on `main` (not detached HEAD) and clean.
3. Briefly list what skills and bootstrap docs are now available under `.agents/skills/` and `.agents/dev/notes/`, then commit `.gitmodules` and `.agents`.
```

## Variant for `florianlh/*` Repositories

Replace `https://github.com/florianlh/dot-agents.git` with `../dot-agents.git` so sibling repos under the same owner use a relative submodule URL.
