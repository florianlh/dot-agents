Add `https://github.com/florianlh/dot-agents.git` as a Git submodule at `.agents/` tracking the `main` branch with `update = rebase`:

1. If an `.agents/` directory already exists and is tracked or non-empty, back up any unique files first, remove the old `.agents/` tracking, add the submodule with `git submodule add -b main https://github.com/florianlh/dot-agents.git .agents`, and configure `git config -f .gitmodules submodule..agents.update rebase`.
2. Ensure `.agents/` is checked out on `main` (not detached HEAD) and clean.
3. Briefly list what skills and bootstrap docs are now available under `.agents/skills/` and `.agents/dev/notes/`, then commit `.gitmodules` and `.agents`.
