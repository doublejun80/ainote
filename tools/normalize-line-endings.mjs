import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  path.join(root, 'manuscript'),
  path.join(root, 'build', 'print'),
  path.join(root, 'docs'),
  path.join(root, 'index.md'),
  path.join(root, '_quarto.yml'),
  path.join(root, 'README.md'),
  path.join(root, 'AGENTS.md')
];

function normalizeFile(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  fs.writeFileSync(file, normalized.replace(/\n/g, '\r\n'), 'utf8');
}

function walk(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(target)) walk(path.join(target, name));
    return;
  }
  if (/\.(md|yml|yaml|json|js|mjs|css|scss|txt)$/i.test(target)) normalizeFile(target);
}

for (const target of targets) walk(target);
console.log('Normalized line endings.');
