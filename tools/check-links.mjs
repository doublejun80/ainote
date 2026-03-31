import fs from "node:fs";
import path from "node:path";
import {
  readText,
  relativeRepoPath,
  repoRoot,
  walkFiles
} from "./lib/manuscript-utils.mjs";

const markdownFiles = walkFiles(repoRoot, (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.endsWith(".md")) {
    return false;
  }
  return !normalized.includes("/.git/") && !normalized.includes("/_book/");
});

const brokenLinks = [];

for (const filePath of markdownFiles) {
  const content = readText(filePath);
  const relativePath = relativeRepoPath(filePath);

  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim();
    if (!target || target.startsWith("http://") || target.startsWith("https://") || target.startsWith("mailto:") || target.startsWith("#") || target.startsWith("/C:/")) {
      continue;
    }
    const resolved = path.resolve(path.dirname(filePath), target.split("#")[0]);
    if (path.extname(resolved) !== ".md") {
      continue;
    }
    if (!fs.existsSync(resolved)) {
      brokenLinks.push(`${relativePath} -> ${target}`);
    }
  }

  for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const rawTarget = match[1].split("|")[0].trim();
    const target = rawTarget.endsWith(".md") ? rawTarget : `${rawTarget}.md`;
    const resolved = path.resolve(path.dirname(filePath), target);
    if (!fs.existsSync(resolved)) {
      brokenLinks.push(`${relativePath} -> [[${rawTarget}]]`);
    }
  }
}

if (brokenLinks.length > 0) {
  console.error("Broken internal links found.");
  for (const broken of brokenLinks) {
    console.error(`- ${broken}`);
  }
  process.exit(1);
}

console.log(`Checked ${markdownFiles.length} Markdown files. No broken internal links found.`);
