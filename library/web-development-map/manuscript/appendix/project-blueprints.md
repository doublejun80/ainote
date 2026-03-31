---
id: "appendix-blueprints"
chapter: 99
order: 5
title: "부록. 미니 프로젝트 설계 노트"
status: "draft"
verification: "partial"
page_target: 5
keywords: ["프로젝트", "설계", "웹 서비스", "MVP"]
source_refs: ["https://web.dev/learn/", "https://developer.mozilla.org/en-US/docs/Learn_web_development"]
crosslinks: ["index.md"]
---

# 부록. 미니 프로젝트 설계 노트

이 책과 잘 맞는 첫 프로젝트는 기능 수가 많은 서비스보다 흐름이 선명한 서비스입니다.

1. 메모 앱
2. 할 일 목록
3. 북마크 저장기

이 세 프로젝트는 공통적으로 조회, 생성, 수정, 삭제 흐름을 작게 경험하기 좋습니다. 로그인까지 붙이고 싶다면 사용자별 데이터 분리를 추가하면 됩니다.

프로젝트를 설계할 때는 화면 한 장과 데이터 한 종류부터 잡으세요. 그다음 API 한 개를 연결하고, 저장이 실제로 되는지 확인한 뒤, 마지막에 배포까지 밀어 보는 편이 좋습니다. 기능이 많아지는 것보다 끝까지 도는 흐름이 먼저 살아야 합니다.
