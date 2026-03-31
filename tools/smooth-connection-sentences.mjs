import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const manuscriptRoot = path.join(root, 'manuscript');
for (const chapter of fs.readdirSync(manuscriptRoot).filter((name) => /^ch\d{2}$/.test(name))) {
  const dir = path.join(manuscriptRoot, chapter);
  for (const file of fs.readdirSync(dir).filter((name) => /^section-\d{2}\.md$/.test(name))) {
    const full = path.join(dir, file);
    let text = fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
    text = text.replace(
      /이 절은 한 장 안의 작은 설명처럼 보여도 책 전체에서는 중요한 연결 고리 역할을 합니다\. (.+?)(?:를|을) 읽을 때 같은 기준이 다시 필요하기 때문입니다\./g,
      '이 절은 한 장 안의 작은 설명처럼 보여도 책 전체에서는 중요한 연결 고리 역할을 합니다. 뒤에서는 $1 같은 주제와 이어집니다.'
    );
    fs.writeFileSync(full, text.replace(/\n/g, '\r\n'), 'utf8');
  }
}
console.log('Connection sentences smoothed.');
