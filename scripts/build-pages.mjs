import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = resolve(rootDir, "docs");
const promptsDir = resolve(rootDir, "prompts");
const outDir = resolve(rootDir, "_site");

const manifestPath = resolve(docsDir, "prompts-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const diskPromptFiles = readdirSync(promptsDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md")
  .sort();

const manifestFiles = manifest.map((entry) => entry.file).sort();
const missingFromManifest = diskPromptFiles.filter((file) => !manifestFiles.includes(file));
if (missingFromManifest.length > 0) {
  throw new Error(
    `Prompt file(s) missing from docs/prompts-manifest.json: ${missingFromManifest.join(", ")}`,
  );
}

const promptsData = manifest.map((entry) => {
  const filePath = resolve(promptsDir, entry.file);
  if (!existsSync(filePath)) {
    throw new Error(`Prompt file referenced in manifest not found: prompts/${entry.file}`);
  }
  const rawText = readFileSync(filePath, "utf8").trimEnd();
  return {
    ...entry,
    sourceFile: `prompts/${entry.file}`,
    text: rawText,
  };
});

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(docsDir, outDir, { recursive: true });
rmSync(resolve(outDir, "prompts-manifest.json"), { force: true });
writeFileSync(resolve(outDir, "prompts-data.json"), `${JSON.stringify(promptsData, null, 2)}\n`);

console.log(`Built _site/ with ${promptsData.length} prompt(s) from prompts/*.md.`);
