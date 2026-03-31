import path from "node:path";
import {
  isSectionFile,
  parseFrontmatter,
  repetitiveClosingHeadings,
  readText,
  repoRoot,
  walkFiles
} from "./lib/manuscript-utils.mjs";

const sectionFiles = walkFiles(path.join(repoRoot, "manuscript"), (filePath) => filePath.endsWith(".md")).filter(isSectionFile);
const placeholderPhrases = [
  "이 절이 설명하려는 핵심을 3문장 이내로 정리합니다.",
  "일상적인 비유를 사용해 개념의 감각을 잡아 줍니다.",
  "합성된 현장 사례를 사용해",
  "공식 문서 또는 권위 자료 1",
  "핵심 포인트 1",
  "질문 1:"
];

const missingExamples = [];
const missingSources = [];
const duplicateTopics = [];
const titleCounts = new Map();
const boilerplateEndingFiles = [];

let structurePass = true;
let tonePass = true;
let totalCharacters = 0;

for (const filePath of sectionFiles) {
  const content = readText(filePath);
  totalCharacters += content.length;
  const { data, body } = parseFrontmatter(content);
  const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, "/");

  if (!data) {
    structurePass = false;
    continue;
  }

  titleCounts.set(data.title, (titleCounts.get(data.title) || 0) + 1);

  if (!body.trim().startsWith("# ")) {
    structurePass = false;
  }

  if (data.status !== "draft") {
    const h2Count = (body.match(/^##\s+/gm) || []).length;
    const textLength = body.replace(/\s+/g, "").length;
    if (h2Count < 2 || textLength < 800) {
      structurePass = false;
    }
  }

  if (placeholderPhrases.some((phrase) => body.includes(phrase))) {
    missingExamples.push(relativePath);
  }

  if (repetitiveClosingHeadings.some((heading) => body.includes(`## ${heading}`))) {
    structurePass = false;
    boilerplateEndingFiles.push(relativePath);
  }

  if (!Array.isArray(data.source_refs) || data.source_refs.length === 0) {
    missingSources.push(relativePath);
  }

  if (/\b해라\b|\b알아둬라\b|\b끝이다\b/.test(body)) {
    tonePass = false;
  }
}

for (const [title, count] of titleCounts.entries()) {
  if (count > 1) {
    duplicateTopics.push(title);
  }
}

let clarityScore = 100;
clarityScore -= missingExamples.length * 0.5;
clarityScore -= missingSources.length * 0.25;
clarityScore -= duplicateTopics.length * 2;
clarityScore -= boilerplateEndingFiles.length * 0.5;
if (!structurePass) {
  clarityScore -= 15;
}
if (!tonePass) {
  clarityScore -= 10;
}
clarityScore = Math.max(0, Math.min(100, Number(clarityScore.toFixed(1))));

const review = {
  structure_pass: structurePass,
  tone_pass: tonePass,
  beginner_clarity_score: clarityScore,
  missing_examples: missingExamples,
  missing_sources: missingSources,
  duplicate_topics: duplicateTopics,
  estimated_pages: Number((totalCharacters / 1700).toFixed(1)),
  next_actions: buildNextActions({
    structurePass,
    tonePass,
    boilerplateEndingFiles,
    missingExamples,
    missingSources,
    duplicateTopics
  })
};

process.stdout.write(`${JSON.stringify(review, null, 2)}\n`);

function buildNextActions({ structurePass, tonePass, boilerplateEndingFiles, missingExamples, missingSources, duplicateTopics }) {
  const actions = [];
  if (!structurePass) {
    actions.push("Expand reviewed sections so they read like complete prose chapters rather than short notes.");
  }
  if (!tonePass) {
    actions.push("Normalize the manuscript tone back to calm, beginner-friendly honorific Korean.");
  }
  if (boilerplateEndingFiles.length > 0) {
    actions.push("Remove repetitive end-of-section boilerplate and close each section with topic-specific prose.");
  }
  if (missingExamples.length > 0) {
    actions.push("Replace remaining scaffold sections with concrete explanation, examples, and term definitions.");
  }
  if (missingSources.length > 0) {
    actions.push("Add official or primary sources to `source_refs` before moving sections to verified.");
  }
  if (duplicateTopics.length > 0) {
    actions.push("Review duplicate outline topics and decide whether to merge, differentiate, or keep intentionally.");
  }
  if (actions.length === 0) {
    actions.push("Continue drafting the next 1 to 3 sections and run the review again.");
  }
  return actions;
}
