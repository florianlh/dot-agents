const PROMPTS = [
  {
    id: "web-lab-interactive",
    category: "starters",
    recommended: true,
    badge: "Recommended Starter",
    title: "Bootstrap Multi-Page Web Lab (Interactive Q&A)",
    description:
      "Best for friends & family starting an empty repo. Attaches .agents, reads the architecture notes, asks a couple of quick questions about your idea, and scaffolds the full app.",
    sourceFile: "prompts/02-bootstrap-web-lab-interactive.md",
    buildText: ({ repoUrl, projectName, firstTool, extraStack }) => {
      const contextLines = [];
      if (projectName) contextLines.push(`- Project name / focus: ${projectName}`);
      if (firstTool) contextLines.push(`- First tool / page idea: ${firstTool}`);
      if (extraStack) contextLines.push(`- Preferred optional libraries: ${extraStack}`);

      const extraBlock =
        contextLines.length > 0 ? `\nInitial preferences:\n${contextLines.join("\n")}\n` : "";

      return `Let's bootstrap this repository as a multi-page web lab using the shared \`.agents\` setup:
${extraBlock}
1. Attach \`${repoUrl}\` as a Git submodule at \`.agents/\` tracking \`main\` with \`update = rebase\`:
   - Run \`git submodule add -b main ${repoUrl} .agents\` and \`git config -f .gitmodules submodule..agents.update rebase\` (if \`.agents/\` already exists, preserve any existing files before converting it to a submodule).
2. Read the bootstrap guides in \`.agents/dev/notes/web-project-bootstrap.md\`, \`vite-mpa-build.md\`, \`mdx-and-content-hub.md\`, \`per-page-pwa.md\`, and \`web-tech-stack.md\`.
3. Before writing application code, ask me a few short questions to clarify:
   - What the project should be named and what it's generally for.
   - What first tool, page, or interactive experiment I want to build first (or propose 2–3 starter ideas if I'm not sure yet).
   - Whether I want any optional libraries from \`.agents/dev/notes/web-tech-stack.md\` (e.g., 2D SVG/Canvas, 3D, charts, CodeMirror, spreadsheets/PDF).
4. Once I answer, scaffold the full Vite MPA + Preact + Tailwind + MDX + Per-Page PWA project structure (including \`AGENTS.md\`, \`dev/notes/standalone-cdn-dependencies.md\`, \`scripts/build-deploy.mjs\`, \`scripts/pwa/\`, \`src/hub/\`, \`src/shared/\`, and my first \`src/pages/<slug>/\` app).
5. Run \`npm run typecheck\`, \`npm test\`, \`npm run build\`, and \`npm run build:offline\` to verify everything passes, then commit the work and share how to preview and use it.`;
    },
  },
  {
    id: "web-lab-direct",
    category: "starters",
    recommended: false,
    badge: "Direct Build",
    title: "Bootstrap Multi-Page Web Lab (Direct Template)",
    description:
      "Skips the Q&A round and builds right away when you already know your project name and first tool.",
    sourceFile: "prompts/03-bootstrap-web-lab-direct.md",
    buildText: ({ repoUrl, projectName, firstTool, extraStack }) => {
      const nameVal =
        projectName || '[PROJECT_NAME — e.g., "Finance & Math Toolkit for everyday calculators"]';
      const toolVal =
        firstTool ||
        '[FIRST_TOOL — e.g., "Compound Interest & Mortgage Simulator with interactive sliders and SVG chart"]';
      const stackVal = extraStack || '[OPTIONAL_STACK — e.g., "None / SVG.js / Paper.js / pdf-lib"]';

      return `Bootstrap this repository as a Vite MPA + MDX + Per-Page PWA web lab:

- Project name & purpose: ${nameVal}
- First page/tool to implement: ${toolVal}
- Optional stack additions (from \`.agents/dev/notes/web-tech-stack.md\`): ${stackVal}

Steps:
1. Add \`${repoUrl}\` as a Git submodule at \`.agents/\` tracking \`main\` (\`git submodule add -b main ${repoUrl} .agents\` and \`git config -f .gitmodules submodule..agents.update rebase\`).
2. Follow \`.agents/dev/notes/web-project-bootstrap.md\` and its companion guides (\`vite-mpa-build.md\`, \`mdx-and-content-hub.md\`, \`per-page-pwa.md\`, \`web-tech-stack.md\`).
3. Scaffold the repo (\`package.json\`, \`tsconfig.json\`, \`vite.config.ts\`, \`.gitignore\`, \`AGENTS.md\`, \`dev/notes/standalone-cdn-dependencies.md\`, \`scripts/build-deploy.mjs\`, \`scripts/pwa/*\`, \`src/hub/App.tsx\`, \`src/shared/*\`, and \`tests/\`).
4. Implement the first page under \`src/pages/<slug>/\` with \`content/PAGE.md\`, \`content/SUMMARY.md\`, polished UI, unit tests for pure logic, and wire it into \`src/hub/App.tsx\`.
5. Verify with \`npm run typecheck\`, \`npm test\`, \`npm run build\`, and \`npm run build:offline\`, then commit cleanly.`;
    },
  },
  {
    id: "general-project",
    category: "starters",
    recommended: false,
    badge: "Any Stack",
    title: "Bootstrap Any Project (General Purpose + Interactive)",
    description:
      "For Python tools, CLIs, libraries, or when you want the agent to recommend the right project type and stack first.",
    sourceFile: "prompts/04-bootstrap-general-project.md",
    buildText: ({ repoUrl, projectName, firstTool, extraStack }) => {
      const notes = [];
      if (projectName) notes.push(`- Project idea / name: ${projectName}`);
      if (firstTool) notes.push(`- First MVP feature: ${firstTool}`);
      if (extraStack) notes.push(`- Preferred stack / constraints: ${extraStack}`);
      const notesBlock = notes.length > 0 ? `\nInitial context:\n${notes.join("\n")}\n` : "";

      return `Let's initialize this repository with \`.agents/\` and design the project together:
${notesBlock}
1. Attach \`${repoUrl}\` as a Git submodule at \`.agents/\` tracking \`main\` with \`update = rebase\` (\`git submodule add -b main ${repoUrl} .agents\` and \`git config -f .gitmodules submodule..agents.update rebase\`).
2. Ask me a few quick questions before writing code:
   - What problem or project I want to build.
   - What kind of project it should be (multi-page web app, single-page app, CLI tool, Python utility, Node/TS library, etc.—or recommend the simplest fit based on my goal).
   - What the first minimal working version (MVP) should do.
3. If we choose a multi-page web app/toolkit, follow the architecture in \`.agents/dev/notes/web-project-bootstrap.md\`; otherwise propose a clean, minimal folder layout and tech stack.
4. Scaffold the initial project, add a concise \`AGENTS.md\` documenting commands, conventions, and verification steps, implement the first working feature with tests, run all checks, and commit.`;
    },
  },
  {
    id: "add-mpa-page",
    category: "followups",
    recommended: false,
    badge: "Existing Web Lab",
    title: "Add a New Page / Tool to an Existing Web Lab",
    description:
      "Use inside a repo already bootstrapped with the Vite MPA + MDX + PWA setup to add another tool card and page.",
    sourceFile: "prompts/05-add-mpa-page-or-tool.md",
    buildText: ({ firstTool, extraStack }) => {
      const toolVal =
        firstTool || '[DESCRIBE_NEW_TOOL — e.g., "JSON Schema & Diff Inspector with side-by-side validation"]';
      const stackLine = extraStack ? `\n- Optional libraries / notes: ${extraStack}` : "";

      return `Add a new page/tool to this web lab following \`AGENTS.md\` and \`.agents/dev/notes/\`:

- Tool / page idea: ${toolVal}${stackLine}

Requirements:
1. Create a new page under \`src/pages/<slug>/\` with \`index.html\`, \`main.tsx\`, \`content/PAGE.md\` (with \`title\`, \`tag\`, \`description\`, and optional PWA metadata), and \`content/SUMMARY.md\`.
2. Reuse \`src/shared/PageChrome.tsx\`, \`buildPageDocTabs()\`, and \`src/shared/theme.css\`; keep pure logic/math/parsing in a separate testable module and add Vitest unit tests under \`tests/\`.
3. Add \`<PageCard page="<slug>" />\` to \`src/hub/App.tsx\`.
4. Evaluate bundle footprint for any new dependency (update \`dev/notes/standalone-cdn-dependencies.md\` if adding a heavy library).
5. Run \`npm run typecheck\`, \`npm test\`, and \`npm run build\` (and verify the built output works cleanly).`;
    },
  },
  {
    id: "attach-submodule",
    category: "snippets",
    recommended: false,
    badge: "Git Snippet",
    title: "Attach dot-agents Submodule Only",
    description:
      "Drops .agents/ into any new or existing repo tracking main with update = rebase, without changing project code.",
    sourceFile: "prompts/01-attach-dot-agents-submodule.md",
    buildText: ({ repoUrl }) => `Add \`${repoUrl}\` as a Git submodule at \`.agents/\` tracking the \`main\` branch with \`update = rebase\`:

1. If an \`.agents/\` directory already exists and is tracked or non-empty, back up any unique files first, remove the old \`.agents/\` tracking, add the submodule with \`git submodule add -b main ${repoUrl} .agents\`, and configure \`git config -f .gitmodules submodule..agents.update rebase\`.
2. Ensure \`.agents/\` is checked out on \`main\` (not detached HEAD) and clean.
3. Briefly list what skills and bootstrap docs are now available under \`.agents/skills/\` and \`.agents/dev/notes/\`, then commit \`.gitmodules\` and \`.agents\`.`,
  },
  {
    id: "update-submodule",
    category: "snippets",
    recommended: false,
    badge: "Maintenance",
    title: "Update .agents Submodule to Latest main",
    description:
      "Pulls new skills or bootstrap note updates into an existing project and commits the updated submodule pointer.",
    sourceFile: "prompts/06-update-dot-agents-submodule.md",
    buildText: () => `Update the \`.agents/\` submodule to the latest \`origin/main\` and sync any relevant project conventions:

1. Run \`git submodule update --remote .agents\`. (Note: in a fresh clone or agent VM where \`.agents/\` starts in detached HEAD, only switch to \`main\` if we intend to make commits inside \`.agents/\`.)
2. Check \`git -C .agents log -n 5 --oneline\` to see what changed in skills or \`.agents/dev/notes/\`.
3. Summarize what changed, mention if any updates affect this repo's \`AGENTS.md\` or build scripts, and commit the updated \`.agents\` submodule pointer in this repo.`,
  },
];

const GITHUB_BASE = "https://github.com/florianlh/dot-agents/blob/main/";

const repoUrlSelect = document.getElementById("input-repo-url");
const projectNameInput = document.getElementById("input-project-name");
const firstToolInput = document.getElementById("input-first-tool");
const extraStackInput = document.getElementById("input-extra-stack");
const resetBtn = document.getElementById("btn-reset-fields");
const promptListEl = document.getElementById("prompt-list");
const filterButtons = Array.from(document.querySelectorAll(".tab-btn"));

let activeCategory = "all";

function getState() {
  return {
    repoUrl: repoUrlSelect.value,
    projectName: projectNameInput.value.trim(),
    firstTool: firstToolInput.value.trim(),
    extraStack: extraStackInput.value.trim(),
  };
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand fallback
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
  return ok;
}

function renderPrompts() {
  const state = getState();

  for (const item of PROMPTS) {
    let card = document.getElementById(`card-${item.id}`);
    if (!card) {
      card = document.createElement("article");
      card.id = `card-${item.id}`;
      card.className = "prompt-card";
      card.dataset.category = item.category;

      const top = document.createElement("div");
      top.className = "prompt-top";

      const meta = document.createElement("div");
      meta.className = "prompt-meta";

      const badges = document.createElement("div");
      badges.className = "prompt-badges";
      const badge = document.createElement("span");
      badge.className = item.recommended ? "tag tag-recommended" : "tag";
      badge.textContent = item.badge;
      badges.appendChild(badge);

      const h3 = document.createElement("h3");
      h3.textContent = item.title;

      const desc = document.createElement("p");
      desc.className = "prompt-desc";
      desc.textContent = item.description;

      meta.append(badges, h3, desc);

      const actions = document.createElement("div");
      actions.className = "prompt-actions";

      const sourceLink = document.createElement("a");
      sourceLink.className = "prompt-source-link";
      sourceLink.href = `${GITHUB_BASE}${item.sourceFile}`;
      sourceLink.target = "_blank";
      sourceLink.rel = "noopener noreferrer";
      sourceLink.textContent = "View .md";

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.id = `copy-${item.id}`;
      copyBtn.className = "btn-copy";
      copyBtn.textContent = "Copy Prompt";
      copyBtn.addEventListener("click", async () => {
        const pre = document.getElementById(`pre-${item.id}`);
        if (!pre) return;
        const ok = await copyText(pre.textContent || "");
        if (ok) {
          copyBtn.textContent = "Copied!";
          copyBtn.classList.add("copied");
          window.setTimeout(() => {
            copyBtn.textContent = "Copy Prompt";
            copyBtn.classList.remove("copied");
          }, 1800);
        }
      });

      actions.append(sourceLink, copyBtn);
      top.append(meta, actions);

      const pre = document.createElement("pre");
      pre.id = `pre-${item.id}`;
      pre.className = "prompt-pre";

      card.append(top, pre);
      promptListEl.appendChild(card);
    }

    const preEl = document.getElementById(`pre-${item.id}`);
    if (preEl) {
      preEl.textContent = item.buildText(state);
    }

    card.hidden = activeCategory !== "all" && item.category !== activeCategory;
  }
}

for (const btn of filterButtons) {
  btn.addEventListener("click", () => {
    activeCategory = btn.dataset.filter || "all";
    for (const b of filterButtons) {
      b.setAttribute("aria-pressed", String(b === btn));
    }
    renderPrompts();
  });
}

for (const input of [repoUrlSelect, projectNameInput, firstToolInput, extraStackInput]) {
  input.addEventListener("input", renderPrompts);
  input.addEventListener("change", renderPrompts);
}

resetBtn.addEventListener("click", () => {
  repoUrlSelect.value = "https://github.com/florianlh/dot-agents.git";
  projectNameInput.value = "";
  firstToolInput.value = "";
  extraStackInput.value = "";
  renderPrompts();
});

renderPrompts();
