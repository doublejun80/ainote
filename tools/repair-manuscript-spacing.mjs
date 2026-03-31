import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function repairMarkdown(file) {
  let text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    const cleanedFrontmatter = match[1]
      .split('\n')
      .map((line) => line.trimEnd())
      .filter((line) => line.trim() !== '')
      .join('\n');
    const body = text.slice(match[0].length).replace(/\n{3,}/g, '\n\n').trimEnd();
    text = `---\n${cleanedFrontmatter}\n---\n\n${body}\n`;
  } else {
    text = text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  }
  fs.writeFileSync(file, text.replace(/\n/g, '\r\n'), 'utf8');
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (name.endsWith('.md')) repairMarkdown(full);
  }
}

walk(path.join(root, 'manuscript'));
console.log('Repaired manuscript frontmatter and spacing.');
