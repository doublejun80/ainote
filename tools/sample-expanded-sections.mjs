import fs from 'node:fs';
for (const file of ['manuscript/ch01/section-01.md','manuscript/ch08/section-06.md','manuscript/ch09/section-02.md','manuscript/ch10/section-05.md']) {
  const text = fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  console.log('FILE=' + file);
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((line) => line.includes('## 아주 쉬운 장면으로 다시 보기'));
  console.log(lines.slice(idx, idx + 22).join('\n'));
  console.log('---END---');
}
