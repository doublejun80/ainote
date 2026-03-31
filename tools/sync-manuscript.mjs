import fs from "node:fs";
import path from "node:path";
import {
  ensureDir,
  parseOutline,
  readText,
  repoRoot,
  writeIfChanged
} from "./lib/manuscript-utils.mjs";

const checkOnly = process.argv.includes("--check");
const outlineText = readText(path.join(repoRoot, "index.txt"));
const chapters = parseOutline(outlineText);
const expectedFiles = new Set();
const supportFileChanges = [];

register("manuscript/index.md");
register("manuscript/prologue/index.md");
register("manuscript/appendix/index.md");
register("manuscript/appendix/glossary.md");
register("manuscript/appendix/source-guide.md");

for (const chapter of chapters) {
  const chapterDir = `manuscript/ch${String(chapter.number).padStart(2, "0")}`;
  register(`${chapterDir}/index.md`);
  chapter.sections.forEach((_, index) => {
    register(`${chapterDir}/section-${String(index + 1).padStart(2, "0")}.md`);
  });
}

syncSupportFiles();
syncChapterFiles();

if (checkOnly) {
  const missingFiles = [...expectedFiles].filter((file) => !fs.existsSync(path.join(repoRoot, file)));
  if (missingFiles.length > 0 || supportFileChanges.length > 0) {
    console.error("Outline drift detected.");
    for (const file of missingFiles) {
      console.error(`Missing: ${file}`);
    }
    for (const file of supportFileChanges) {
      console.error(`Outdated generated file: ${file}`);
    }
    process.exit(1);
  }

  console.log("Outline and generated support files are in sync.");
  process.exit(0);
}

console.log(`Synced manuscript scaffold for ${chapters.length} chapters.`);

function register(relativePath) {
  expectedFiles.add(relativePath);
}

function markSupportChange(relativePath, didChange) {
  if (didChange) {
    supportFileChanges.push(relativePath);
  }
}

function syncSupportFiles() {
  const catalog = chapters.map((chapter) => ({
    number: chapter.number,
    title: chapter.title,
    dir: `ch${String(chapter.number).padStart(2, "0")}`,
    sections: chapter.sections.map((title, index) => ({
      order: index + 1,
      title,
      file: `section-${String(index + 1).padStart(2, "0")}.md`
    }))
  }));

  markSupportChange("manuscript/catalog.json", writeIfChanged(path.join(repoRoot, "manuscript/catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`));
  markSupportChange("docs/book-outline.md", writeIfChanged(path.join(repoRoot, "docs/book-outline.md"), buildOutlineDoc()));
  markSupportChange("_quarto.yml", writeIfChanged(path.join(repoRoot, "_quarto.yml"), buildQuartoConfig()));
}

function syncChapterFiles() {
  for (const chapter of chapters) {
    const chapterNumber = String(chapter.number).padStart(2, "0");
    const chapterDir = path.join(repoRoot, "manuscript", `ch${chapterNumber}`);
    ensureDir(chapterDir);

    const chapterIndexPath = path.join(chapterDir, "index.md");
    if (!fs.existsSync(chapterIndexPath)) {
      fs.writeFileSync(chapterIndexPath, buildChapterIndex(chapter), "utf8");
    }

    chapter.sections.forEach((sectionTitle, index) => {
      const sectionPath = path.join(chapterDir, `section-${String(index + 1).padStart(2, "0")}.md`);
      if (!fs.existsSync(sectionPath)) {
        fs.writeFileSync(sectionPath, buildSection(chapter, sectionTitle, index + 1), "utf8");
      }
    });
  }
}

function buildOutlineDoc() {
  const lines = ["# 책 목차", "", "이 문서는 `index.txt`를 기준으로 자동 생성됩니다.", ""];

  for (const chapter of chapters) {
    lines.push(`## ${chapter.number}장. ${chapter.title}`);
    lines.push("");
    chapter.sections.forEach((section, index) => {
      const chapterDir = `manuscript/ch${String(chapter.number).padStart(2, "0")}`;
      const sectionPath = `${chapterDir}/section-${String(index + 1).padStart(2, "0")}.md`;
      lines.push(`- [${section}](/C:/Users/05507/Documents/Github/AINOTE/${sectionPath})`);
    });
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function buildQuartoConfig() {
  const chapterEntries = ["    - manuscript/prologue/index.md"];
  for (const chapter of chapters) {
    const chapterDir = `manuscript/ch${String(chapter.number).padStart(2, "0")}`;
    chapterEntries.push(`    - ${chapterDir}/index.md`);
    chapter.sections.forEach((_, index) => {
      chapterEntries.push(`    - ${chapterDir}/section-${String(index + 1).padStart(2, "0")}.md`);
    });
  }

  return `project:\n  type: book\n  output-dir: _book\n\nlang: ko\n\nbook:\n  title: "AI 노트"\n  subtitle: "AI 시대에 초보자가 알아야 할 개발의 큰 그림"\n  author: "AINOTE 프로젝트"\n  page-navigation: true\n  chapters:\n    - manuscript/index.md\n${chapterEntries.join("\n")}\n  appendices:\n    - manuscript/appendix/index.md\n    - manuscript/appendix/glossary.md\n    - manuscript/appendix/source-guide.md\n\nformat:\n  html:\n    toc: true\n    number-sections: false\n    theme: cosmo\n  pdf:\n    documentclass: scrreprt\n    pdf-engine: xelatex\n    mainfont: "Noto Serif CJK KR"\n    papersize: a4\n    toc: true\n    number-sections: false\n  epub:\n    toc: true\n    number-sections: false\n`;
}

function buildChapterIndex(chapter) {
  const chapterId = `ch${String(chapter.number).padStart(2, "0")}`;
  const crosslinks = chapter.sections
    .slice(0, 3)
    .map((_, index) => `"section-${String(index + 1).padStart(2, "0")}.md"`)
    .join(", ");

  return `---\nid: "${chapterId}"\nchapter: ${chapter.number}\norder: 0\ntitle: "${chapter.number}장. ${chapter.title}"\nstatus: "draft"\nverification: "unverified"\npage_target: ${Math.max(4, chapter.sections.length + 2)}\nkeywords: []\nsource_refs: []\ncrosslinks: [${crosslinks}]\n---\n\n# ${chapter.number}장. ${chapter.title}\n\n이 장은 "${chapter.title}"와 관련된 핵심 질문을 한 장의 지도처럼 보여 줍니다. 각 절은 정의만 설명하지 않고, 왜 중요한지와 실제 개발 현장에서 어떤 의미가 있는지까지 이어서 다룹니다.\n\n## 이 장에서 답할 질문\n\n${chapter.sections.map((section) => `- ${section}`).join("\n")}\n\n## 읽는 방법\n\n- 먼저 절 제목을 훑으며 전체 지형을 잡습니다.\n- 낯선 용어가 많아도 모든 절을 처음부터 완벽히 이해하려고 하지 않아도 됩니다.\n- 각 절의 \`한눈에 보기\`와 \`핵심 정리\`를 통해 큰 흐름을 먼저 잡습니다.\n\n## 장 메모\n\n- 초고 단계에서는 절별 예시와 비유의 균형을 확인합니다.\n- 장 후반 검증 단계에서는 중복 설명과 누락 개념을 함께 정리합니다.\n`;
}

function buildSection(chapter, title, order) {
  const chapterNumber = String(chapter.number).padStart(2, "0");
  const sectionNumber = String(order).padStart(2, "0");
  const id = `ch${chapterNumber}-sec${sectionNumber}`;

  return `---\nid: "${id}"\nchapter: ${chapter.number}\norder: ${order}\ntitle: "${title}"\nstatus: "draft"\nverification: "unverified"\npage_target: 3\nkeywords: []\nsource_refs: []\ncrosslinks: []\n---\n\n# ${title}\n\n## 한눈에 보기\n\n- 이 절이 설명하려는 핵심을 3문장 이내로 정리합니다.\n- 초보자가 먼저 알아야 할 개념 경계를 분명하게 적습니다.\n- 이 주제가 책 전체에서 어디에 놓이는지 한 줄로 연결합니다.\n\n## 왜 중요한가\n\n이 개념을 모를 때 초보자가 어떤 혼란을 겪는지 설명합니다. 실제로 왜 이 주제가 계속 등장하는지, 어떤 판단에 영향을 주는지 적습니다.\n\n## 생활 비유\n\n일상적인 비유를 사용해 개념의 감각을 잡아 줍니다. 다만 비유가 개념을 완전히 대체하지 못한다는 점도 함께 정리합니다.\n\n## 개발 현장 예시\n\n합성된 현장 사례를 사용해 이 개념이 실제 서비스, 팀 협업, 운영 문제에서 어떻게 드러나는지 설명합니다.\n\n## 조금 더 기술적으로\n\n정의, 구성 요소, 흐름, 비교 관점을 조금 더 기술적으로 설명합니다. 필요하면 작은 표나 목록을 사용합니다.\n\n## 자주 헷갈리는 점\n\n초보자가 혼동하는 용어, 범위, 비교 포인트를 정리합니다.\n\n## AI 시대 연결\n\nAI 도구가 이 개념을 더 쉽게 접하게 만들었지만, 왜 오히려 더 정확히 이해해야 하는지도 설명합니다.\n\n## 이해 체크\n\n- 질문 1:\n- 질문 2:\n- 질문 3:\n\n## 핵심 정리\n\n- 핵심 포인트 1\n- 핵심 포인트 2\n- 핵심 포인트 3\n\n## 더 읽기\n\n- 공식 문서 또는 권위 자료 1\n- 공식 문서 또는 권위 자료 2\n`;
}


