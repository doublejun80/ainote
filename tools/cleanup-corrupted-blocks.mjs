import fs from "node:fs";
import path from "node:path";

for (const dir of fs.readdirSync('manuscript')) {
  if (!/^ch\d{2}$/.test(dir)) continue;
  for (const file of fs.readdirSync(path.join('manuscript', dir))) {
    if (!/^section-\d{2}\.md$/.test(file)) continue;
    const full = path.join('manuscript', dir, file);
    const text = fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/);
    const badIndex = lines.findIndex((line) => /^##\s+[? ]{4,}/.test(line) || /^##\s+\?{2,}/.test(line));
    if (badIndex !== -1) {
      const cleaned = lines.slice(0, badIndex).join('\n').replace(/\s+$/u, '') + '\n';
      fs.writeFileSync(full, cleaned, 'utf8');
      console.log(`cleaned ${full}`);
    }
  }
}
