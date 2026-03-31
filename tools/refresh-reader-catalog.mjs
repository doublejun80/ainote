import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const manuscriptRoot = path.join(repoRoot, 'manuscript');
const docsRoot = path.join(repoRoot, 'docs');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

const chapters = fs.readdirSync(manuscriptRoot)
  .filter((name) => /^ch\d{2}$/.test(name))
  .sort();

const catalog = chapters.map((dir) => {
  const chapterDir = path.join(manuscriptRoot, dir);
  const chapterIndex = parseFrontmatter(readText(path.join(chapterDir, 'index.md')));
  const number = Number(chapterIndex.chapter);
  const title = String(chapterIndex.title || `${number}장`).replace(/^\d+장\.\s*/, '');
  const sections = fs.readdirSync(chapterDir)
    .filter((name) => /^section-\d{2}\.md$/.test(name))
    .sort()
    .map((file) => {
      const frontmatter = parseFrontmatter(readText(path.join(chapterDir, file)));
      return {
        order: Number(frontmatter.order),
        title: frontmatter.title,
        file
      };
    });
  return { number, title, dir, sections };
});

fs.writeFileSync(path.join(manuscriptRoot, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

const outlineLines = ['# 책 목차', '', '이 문서는 현재 원고 frontmatter를 기준으로 갱신됩니다.', ''];
for (const chapter of catalog) {
  outlineLines.push(`## ${chapter.number}장. ${chapter.title}`);
  outlineLines.push('');
  for (const section of chapter.sections) {
    outlineLines.push(`- [${section.title}](/C:/Users/05507/Documents/Github/AINOTE/manuscript/${chapter.dir}/${section.file})`);
  }
  outlineLines.push('');
}
fs.writeFileSync(path.join(docsRoot, 'book-outline.md'), `${outlineLines.join('\n')}\n`, 'utf8');
console.log(`Refreshed catalog for ${catalog.length} chapters.`);
