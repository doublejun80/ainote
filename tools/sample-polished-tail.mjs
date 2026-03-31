import fs from 'node:fs';
for (const file of ['manuscript/ch09/section-02.md','manuscript/ch10/section-05.md']) {
  const text = fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((line) => line.includes('## 이 개념이 책 전체에서 다시 나오는 자리'));
  console.log('FILE=' + file);
  console.log(lines.slice(idx - 4, idx + 6).join('\n'));
  console.log('---END---');
}
