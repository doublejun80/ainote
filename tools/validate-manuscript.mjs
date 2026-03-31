import path from "node:path";
import {
  isSectionFile,
  parseFrontmatter,
  repetitiveClosingHeadings,
  readText,
  relativeRepoPath,
  repoRoot,
  walkFiles
} from "./lib/manuscript-utils.mjs";

const manuscriptFiles = walkFiles(path.join(repoRoot, "manuscript"), (filePath) => filePath.endsWith(".md"));
const errors = [];
const placeholderPhrases = [
  "이 절이 설명하려는 핵심을 3문장 이내로 정리합니다.",
  "일상적인 비유를 사용해 개념의 감각을 잡아 줍니다.",
  "합성된 현장 사례를 사용해",
  "공식 문서 또는 권위 자료 1",
  "핵심 포인트 1",
  "질문 1:"
];

for (const filePath of manuscriptFiles) {
  if (!isSectionFile(filePath)) {
    continue;
  }

  const { data, body } = parseFrontmatter(readText(filePath));
  const relativePath = relativeRepoPath(filePath);

  if (!data) {
    errors.push(`${relativePath}: missing frontmatter`);
    continue;
  }

  for (const key of ["id", "chapter", "order", "title", "status", "verification", "page_target", "keywords", "source_refs", "crosslinks"]) {
    if (!(key in data)) {
      errors.push(`${relativePath}: missing frontmatter field \"${key}\"`);
    }
  }

  if (!["draft", "reviewed", "verified", "final"].includes(data.status)) {
    errors.push(`${relativePath}: invalid status \"${data.status}\"`);
  }

  if (!["unverified", "partial", "verified"].includes(data.verification)) {
    errors.push(`${relativePath}: invalid verification \"${data.verification}\"`);
  }

  if (typeof data.page_target !== "number" || Number.isNaN(data.page_target)) {
    errors.push(`${relativePath}: page_target must be numeric`);
  }

  if (!body.trim().startsWith("# ")) {
    errors.push(`${relativePath}: body must start with an H1 title`);
  }

  if (data.status !== "draft") {
    const h2Count = (body.match(/^##\s+/gm) || []).length;
    const textLength = body.replace(/\s+/g, "").length;
    if (h2Count < 2) {
      errors.push(`${relativePath}: reviewed or higher sections need at least two H2 headings`);
    }
    if (textLength < 800) {
      errors.push(`${relativePath}: reviewed or higher sections are too short to be book-ready`);
    }
    for (const phrase of placeholderPhrases) {
      if (body.includes(phrase)) {
        errors.push(`${relativePath}: reviewed or higher sections still contain scaffold placeholder text`);
        break;
      }
    }

    for (const heading of repetitiveClosingHeadings) {
      if (body.includes(`## ${heading}`)) {
        errors.push(`${relativePath}: reviewed or higher sections still contain repetitive boilerplate ending "${heading}"`);
        break;
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Manuscript validation failed.");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${manuscriptFiles.filter(isSectionFile).length} section files.`);
