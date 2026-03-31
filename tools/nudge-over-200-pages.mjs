import fs from "node:fs";
import path from "node:path";

const addendum = {
  1: "그래서 입문 단계에서 큰 그림을 먼저 잡아 두면, 뒤 장에서 세부 기술을 배울 때도 길을 잃지 않고 왜 그 지식이 필요한지 계속 연결해서 이해할 수 있습니다.",
  2: "플랫폼과 전달 방식의 차이를 먼저 구분할 수 있으면, 이후에 나오는 기술 선택도 사용자의 경험과 운영 방식이라는 관점에서 훨씬 현실적으로 읽히게 됩니다.",
  3: "결국 언어와 프레임워크를 배우는 목적은 도구 이름을 늘리는 것이 아니라, 문제에 맞는 도구를 고를 수 있는 눈을 기르는 데 있다는 점이 이 책 전체를 관통합니다.",
  4: "이런 바닥 용어가 단단해야 나중에 더 복잡한 구조와 인프라 이야기를 읽어도 설명이 서로 엉키지 않고, 문장을 읽는 속도 자체가 빨라집니다.",
  5: "소프트웨어 공학의 용어들은 결국 사람과 일정과 품질을 함께 다루기 위해 생긴 언어이므로, 뒤 장의 기술 주제들도 항상 팀의 일하는 방식과 함께 읽는 편이 좋습니다.",
  6: "프로그램 아래에서 벌어지는 일을 이해하는 사람은 문제를 만났을 때 코드만 탓하지 않고 자원과 실행 환경까지 함께 보게 되며, 그 시야 차이가 점점 크게 드러납니다.",
  7: "데이터가 흐르는 구조를 이해하면 기능 설명뿐 아니라 성능 문제와 보안 문제도 훨씬 입체적으로 읽히기 때문에, 이 감각은 뒤의 모든 서버 주제에서 계속 힘을 발휘합니다.",
  8: "네트워크는 보이지 않는 층이 많지만 한 번 흐름을 잡아 두면 인증, 캐시, 분산 처리, 클라우드 구조가 모두 같은 여정의 다른 지점으로 보이게 됩니다.",
  9: "그래서 아키텍처는 책의 마지막에 따로 붙는 고급 주제가 아니라, 처음부터 끝까지 배운 내용을 실제 서비스 구조로 묶어 주는 핵심 축이라고 볼 수 있습니다.",
  10: "앞 장의 기초 개념 위에 이 장을 올려 읽을수록 최신 기술 용어는 덜 위압적으로 느껴지고, 유행보다 문제와 맥락으로 판단하는 힘이 생기게 됩니다."
};

for (const dir of fs.readdirSync('manuscript')) {
  const match = dir.match(/^ch(\d{2})$/);
  if (!match) continue;
  const chapter = Number(match[1]);
  for (const file of fs.readdirSync(path.join('manuscript', dir))) {
    if (!/^section-\d{2}\.md$/.test(file)) continue;
    const full = path.join('manuscript', dir, file);
    let text = fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
    if (text.includes(addendum[chapter])) continue;
    text = `${text.trimEnd()}\n\n${addendum[chapter]}\n`;
    fs.writeFileSync(full, text, 'utf8');
  }
}
