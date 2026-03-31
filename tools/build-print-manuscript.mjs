import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manuscriptRoot = path.join(root, 'manuscript');
const buildRoot = path.join(root, 'build', 'print');

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\r?\n?/, '').trim();
}

function demoteHeadings(text) {
  return text.replace(/^(#{1,5})\s+/gm, (_, hashes) => `${hashes}# `);
}

fs.mkdirSync(buildRoot, { recursive: true });

const chapters = fs.readdirSync(manuscriptRoot)
  .filter((name) => /^ch\d{2}$/.test(name))
  .sort();

for (const chapter of chapters) {
  const dir = path.join(manuscriptRoot, chapter);
  const chapterIndex = stripFrontmatter(read(path.join(dir, 'index.md')));
  const sections = fs.readdirSync(dir)
    .filter((name) => /^section-\d{2}\.md$/.test(name))
    .sort()
    .map((name) => demoteHeadings(stripFrontmatter(read(path.join(dir, name)))));

  const out = [chapterIndex, ...sections].join('\n\n');
  fs.writeFileSync(path.join(buildRoot, `${chapter}.md`), `${out}\n`, 'utf8');
}

console.log(`Built ${chapters.length} print chapter files.`);
