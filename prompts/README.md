# Reusable Agent Prompts

A collection of bare, directly usable prompts and snippets for bootstrapping new repositories or maintaining existing ones with `dot-agents`.

All `prompts/*.md` files contain **only** the prompt text itself (no headings, wrappers, or filler), so you can:
- Copy-paste the raw file contents directly into an AI chat, or
- Reference them directly from a repository that already has `.agents/` attached (for example: *"Follow `.agents/prompts/05-add-mpa-page-or-tool.md` to add a new color-contrast tool"*).

## Quickstart (Cloud or Local AI Agent)

1. Create an **empty repository** on GitHub (e.g. `my-tools-lab`).
2. Open it in your AI coding environment (e.g., attach it in Antigravity Cloud or open a local clone with Claude Code, Codex, Cursor, etc.).
3. Copy one of the starter prompts below and paste it as your first message.

---

## Prompt Catalog

| File | Category | When to Use |
| :--- | :--- | :--- |
| **[`01-attach-dot-agents-submodule.md`](./01-attach-dot-agents-submodule.md)** | Git Snippet | Add `.agents/` tracking `main` (`update = rebase`) to an empty or existing repo without scaffolding project code yet. |
| **[`02-bootstrap-web-lab-interactive.md`](./02-bootstrap-web-lab-interactive.md)** | Starter *(Recommended)* | **Best for friends & family:** attaches `.agents/`, reads the Vite MPA + MDX + PWA bootstrap notes, and asks a few short questions before scaffolding. |
| **[`03-bootstrap-web-lab-direct.md`](./03-bootstrap-web-lab-direct.md)** | Starter *(Direct)* | Fill-in-the-blank starter when you already know your project name and first tool and want it built immediately. |
| **[`04-bootstrap-general-project.md`](./04-bootstrap-general-project.md)** | Starter *(Any Stack)* | Stack-agnostic starter for CLIs, Python utilities, libraries, or when you want stack recommendations first. |
| **[`05-add-mpa-page-or-tool.md`](./05-add-mpa-page-or-tool.md)** | Follow-up | Add a new auto-discovered page/tool inside an existing bootstrapped web-lab repository. |
| **[`06-update-dot-agents-submodule.md`](./06-update-dot-agents-submodule.md)** | Maintenance | Pull the latest `origin/main` from `dot-agents` into `.agents/` and commit the updated submodule pointer. |

## Notes

- **Submodule URL (`florianlh/*` vs. any account):** Prompts default to `https://github.com/florianlh/dot-agents.git` so they work from **any** GitHub account. For sibling repositories owned by `florianlh`, you can swap the URL to `../dot-agents.git` if preferred.
- **Direct reference inside existing repos:** Once `.agents/` is attached, you don't need to copy-paste follow-up prompts like `05-add-mpa-page-or-tool.md` or `06-update-dot-agents-submodule.md`—you can simply tell the agent to read and follow `.agents/prompts/05-add-mpa-page-or-tool.md`.
