# Update `.agents/` Submodule in a Consuming Project

Use this snippet to pull the latest skills, bootstrap notes, and prompts from `dot-agents` into an existing project.

## Prompt

```text
Update the `.agents/` submodule to the latest `origin/main` and sync any relevant project conventions:

1. Run `git submodule update --remote .agents`. (Note: in a fresh clone or agent VM where `.agents/` starts in detached HEAD, only switch to `main` if we intend to make commits inside `.agents/`.)
2. Check `git -C .agents log -n 5 --oneline` to see what changed in skills or `.agents/dev/notes/`.
3. Summarize what changed, mention if any updates affect this repo's `AGENTS.md` or build scripts, and commit the updated `.agents` submodule pointer in this repo.
```
