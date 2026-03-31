import fs from 'node:fs';
import path from 'node:path';
const bad = [];
for (const dir of fs.readdirSync('manuscript')) {
  if (!/^ch\d{2}$/.test(dir)) continue;
  for (const file of fs.readdirSync(path.join('manuscript', dir))) {
    if (!/^section-\d{2}\.md$/.test(file)) continue;
    const full = path.join('manuscript', dir, file);
    const text = fs.readFileSync(full,'utf8').replace(/^\uFEFF/,'');
    if (text.includes('�')) bad.push(full + ' contains replacement char');
  }
}
console.log(bad.join('\n') || 'NO_REPLACEMENT_CHAR');
