# Reusable Agent Prompts

A collection of copy-pastable prompts and snippets for bootstrapping new repositories or maintaining existing ones with `dot-agents`.

## Friend & Family Quickstart (Antigravity Cloud)

1. Create an **empty repository** on GitHub (e.g. `my-tools-lab`).
2. Start a new **Antigravity Cloud** project with that repository attached.
3. Copy one of the starter prompts below and paste it as your first message.

---

## Prompt Catalog

| File | Purpose |
| :--- | :--- |
| **[`01-attach-dot-agents-submodule.md`](./01-attach-dot-agents-submodule.md)** | Snippet/prompt to attach `dot-agents` at `.agents/` tracking `main` (`update = rebase`). |
| **[`02-bootstrap-web-lab-interactive.md`](./02-bootstrap-web-lab-interactive.md)** | **Recommended starter:** attaches `.agents/`, reads the Vite MPA + MDX + PWA bootstrap notes, and interviews you about your project name, first tool, and stack before scaffolding. |
| **[`03-bootstrap-web-lab-direct.md`](./03-bootstrap-web-lab-direct.md)** | **Fill-in-the-blank starter:** attaches `.agents/` and immediately builds a Vite MPA + MDX + PWA project for a specific tool/idea. |
| **[`04-bootstrap-general-project.md`](./04-bootstrap-general-project.md)** | **Any stack/language starter:** attaches `.agents/`, asks what kind of app/library/script you want to build, and sets up a clean structure + `AGENTS.md`. |
| **[`05-add-mpa-page-or-tool.md`](./05-add-mpa-page-or-tool.md)** | Follow-up prompt to add a new auto-discovered page/tool inside an existing bootstrapped web-lab repo. |
| **[`06-update-dot-agents-submodule.md`](./06-update-dot-agents-submodule.md)** | Maintenance prompt to pull the latest `dot-agents` `main` into `.agents/` and commit the pointer update. |

> **Submodule URL note:** Prompts default to `https://github.com/florianlh/dot-agents.git` so they work from **any** GitHub account. If the new repo lives under `florianlh/`, you can swap the URL to `../dot-agents.git` if preferred.
