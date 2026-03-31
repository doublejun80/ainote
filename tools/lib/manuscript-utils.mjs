import fs from "node:fs";
import path from "node:path";

export const repoRoot = process.cwd();
export const manuscriptRoot = path.join(repoRoot, "manuscript");

export const requiredSectionHeadings = [
  "한눈에 보기",
  "왜 중요한가",
  "생활 비유",
  "개발 현장 예시",
  "조금 더 기술적으로",
  "자주 헷갈리는 점",
  "AI 시대 연결",
  "이해 체크",
  "핵심 정리",
  "더 읽기"
];

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

export function writeIfChanged(filePath, content) {
  ensureDir(path.dirname(filePath));
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "") : null;
  if (current === content) {
    return false;
  }
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

export function walkFiles(rootDir, predicate = () => true) {
  const files = [];
  if (!fs.existsSync(rootDir)) {
    return files;
  }

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
      continue;
    }
    if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

export function parseOutline(text) {
  const chapters = [];
  let currentChapter = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const chapterMatch = line.match(/^(\d+)장\.\s+(.+)$/);
    if (chapterMatch) {
      currentChapter = {
        number: Number(chapterMatch[1]),
        title: chapterMatch[2],
        sections: []
      };
      chapters.push(currentChapter);
      continue;
    }

    const sectionMatch = line.match(/^- (.+)$/);
    if (sectionMatch && currentChapter) {
      currentChapter.sections.push(sectionMatch[1]);
    }
  }

  return chapters;
}

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: null, body: content };
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    data[key] = parseYamlScalar(rawValue);
  }

  return { data, body: content.slice(match[0].length) };
}

function parseYamlScalar(rawValue) {
  if (rawValue === "[]") {
    return [];
  }
  if (rawValue === "{}") {
    return {};
  }
  if (rawValue === "true") {
    return true;
  }
  if (rawValue === "false") {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
    return Number(rawValue);
  }
  if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
    return rawValue.slice(1, -1);
  }
  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    const inner = rawValue.slice(1, -1).trim();
    if (!inner) {
      return [];
    }
    return inner.split(",").map((part) => stripQuotes(part.trim()));
  }
  return stripQuotes(rawValue);
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

export function extractHeadings(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^##\s+(.+)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

export function isSectionFile(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return /\/manuscript\/ch\d{2}\/section-\d{2}\.md$/.test(normalized);
}

export function relativeRepoPath(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}
