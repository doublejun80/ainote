import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manuscriptRoot = path.join(root, 'manuscript');
const chapterDirs = fs.readdirSync(manuscriptRoot).filter((name) => /^ch\d{2}$/.test(name)).sort();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const chapter of chapterDirs) {
  const dir = path.join(manuscriptRoot, chapter);
  const files = fs.readdirSync(dir).filter((name) => /^section-\d{2}\.md$/.test(name)).sort();
  for (const file of files) {
    const full = path.join(dir, file);
    let text = fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
    const titleMatch = text.match(/title:\s*"([^"]+)"/);
    const rawTitle = titleMatch ? titleMatch[1] : '';
    const topic = rawTitle.replace(/[?？]/g, '').replace(/\s+/g, ' ').trim();

    text = text.replace(/\n## 아주 쉬운 장면으로 다시 보기[\s\S]*?\n## (이 내용을 알면 어디서 덜 막히는가|실제로 만들 때는 이런 선택으로 이어집니다|현업 장면으로 바꾸면 이렇게 보입니다|이 개념이 실전에서 빛나는 순간)/, '\n## $1');

    if (topic) {
      const replacements = [
        [`"${topic}는 무엇을 설명하는 개념인가"`, '"이 절은 무엇을 설명하는가"'],
        [`${topic}를 읽`, '이 주제를 읽'],
        [`${topic}와 관련된`, '이 주제와 관련된'],
        [`${topic} 관점`, '이 주제 관점'],
        [`${topic}는`, '이 개념은'],
        [`${topic}를`, '이 개념을'],
        [`${topic}가`, '이 개념이'],
        [`${topic}와`, '이 주제와'],
        [`${topic}에서`, '이 주제에서']
      ];
      for (const [from, to] of replacements) {
        text = text.replace(new RegExp(escapeRegex(from), 'g'), to);
      }
    }

    text = text.replace(/를 읽을 때 다시 등장하기 때문입니다\./g, '를 읽을 때 같은 기준이 다시 필요하기 때문입니다.');
    text = text.replace(/을 읽을 때 다시 등장하기 때문입니다\./g, '을 읽을 때 같은 기준이 다시 필요하기 때문입니다.');
    text = text.replace(/를 읽을 때 다시 등장하기 때문입니다\./g, '를 읽을 때 같은 기준이 다시 필요하기 때문입니다.');

    fs.writeFileSync(full, text.replace(/\n/g, '\r\n'), 'utf8');
  }
}

console.log('Section endings cleaned up.');
