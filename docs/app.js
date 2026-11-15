const GITHUB_BASE = "https://github.com/florianlh/dot-agents/blob/main/";
const DEFAULT_REPO_URL = "https://github.com/florianlh/dot-agents.git";

const repoUrlSelect = document.getElementById("input-repo-url");
const projectNameInput = document.getElementById("input-project-name");
const firstToolInput = document.getElementById("input-first-tool");
const extraStackInput = document.getElementById("input-extra-stack");
const resetBtn = document.getElementById("btn-reset-fields");
const customizerStatus = document.getElementById("customizer-status");
const promptListEl = document.getElementById("prompt-list");
const filterButtons = Array.from(document.querySelectorAll(".tab-btn"));

let prompts = [];
let activeCategory = "all";

function getState() {
  return {
    repoUrl: repoUrlSelect.value,
    projectName: projectNameInput.value.trim(),
    firstTool: firstToolInput.value.trim(),
    extraStack: extraStackInput.value.trim(),
  };
}

function updateCustomizerStatus(state) {
  if (!customizerStatus) return;
  const isCustomized =
    state.repoUrl !== DEFAULT_REPO_URL ||
    state.projectName.length > 0 ||
    state.firstTool.length > 0 ||
    state.extraStack.length > 0;
  customizerStatus.textContent = isCustomized ? "Customized" : "Optional";
  customizerStatus.className = isCustomized ? "tag tag-recommended" : "tag";
}

function customizePromptText(item, state) {
  let text = item.text;

  if (state.repoUrl && state.repoUrl !== DEFAULT_REPO_URL) {
    text = text.replaceAll(DEFAULT_REPO_URL, state.repoUrl);
  }

  if (item.id === "web-lab-direct") {
    if (state.projectName) {
      text = text.replace(/\[PROJECT_NAME[^\]]*\]/, state.projectName);
    }
    if (state.firstTool) {
      text = text.replace(/\[FIRST_TOOL[^\]]*\]/, state.firstTool);
    }
    if (state.extraStack) {
      text = text.replace(/\[OPTIONAL_STACK[^\]]*\]/, state.extraStack);
    }
    return text;
  }

  if (item.id === "add-mpa-page") {
    if (state.firstTool) {
      text = text.replace(/\[DESCRIBE_NEW_TOOL[^\]]*\]/, state.firstTool);
    }
    if (state.extraStack) {
      text = text.replace(
        /^(- Tool \/ page idea: .+)$/m,
        `$1\n- Optional libraries / notes: ${state.extraStack}`,
      );
    }
    return text;
  }

  if (item.id === "web-lab-interactive" || item.id === "general-project") {
    const contextLines = [];
    if (state.projectName) contextLines.push(`- Project name / focus: ${state.projectName}`);
    if (state.firstTool) contextLines.push(`- First tool / MVP idea: ${state.firstTool}`);
    if (state.extraStack) contextLines.push(`- Preferred stack / libraries: ${state.extraStack}`);

    if (contextLines.length > 0) {
      const heading =
        item.id === "web-lab-interactive" ? "Initial preferences:" : "Initial context:";
      const newlineIdx = text.indexOf("\n");
      if (newlineIdx !== -1) {
        text = `${text.slice(0, newlineIdx)}\n\n${heading}\n${contextLines.join("\n")}${text.slice(newlineIdx)}`;
      }
    }
    return text;
  }

  return text;
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
  updateCustomizerStatus(state);

  for (const item of prompts) {
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
      preEl.textContent = customizePromptText(item, state);
    }

    card.hidden = activeCategory !== "all" && item.category !== activeCategory;
  }
}

async function init() {
  try {
    const response = await fetch("./prompts-data.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    prompts = await response.json();
    renderPrompts();
  } catch (err) {
    const notice = document.createElement("div");
    notice.className = "callout-note";
    notice.innerHTML =
      "<strong>Prompts not loaded:</strong> Run <code>node scripts/build-pages.mjs</code> and serve <code>_site/</code> over HTTP (or deploy via GitHub Actions Pages).";
    promptListEl.replaceChildren(notice);
    console.error("Failed to load prompts-data.json:", err);
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
  repoUrlSelect.value = DEFAULT_REPO_URL;
  projectNameInput.value = "";
  firstToolInput.value = "";
  extraStackInput.value = "";
  renderPrompts();
});

init();
