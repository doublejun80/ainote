import fs from 'node:fs';
for (const file of ['manuscript/ch09/section-02.md','manuscript/ch08/section-06.md']) {
  const text = fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  console.log('FILE=' + file);
  console.log(text.split(/\r?\n/).slice(0, 18).join('\n'));
  console.log('---END---');
}
