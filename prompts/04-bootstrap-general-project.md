Let's initialize this repository with `.agents/` and design the project together:

1. Attach `https://github.com/florianlh/dot-agents.git` as a Git submodule at `.agents/` tracking `main` with `update = rebase` (`git submodule add -b main https://github.com/florianlh/dot-agents.git .agents` and `git config -f .gitmodules submodule..agents.update rebase`).
2. Ask me a few quick questions before writing code:
   - What problem or project I want to build.
   - What kind of project it should be (multi-page web app, single-page app, CLI tool, Python utility, Node/TS library, etc.—or recommend the simplest fit based on my goal).
   - What the first minimal working version (MVP) should do.
3. If we choose a multi-page web app/toolkit, follow the architecture in `.agents/dev/notes/web-project-bootstrap.md`; otherwise propose a clean, minimal folder layout and tech stack.
4. Scaffold the initial project, add a concise `AGENTS.md` documenting commands, conventions, and verification steps, implement the first working feature with tests, run all checks, and commit.
