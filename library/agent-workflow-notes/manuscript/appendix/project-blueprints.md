---
id: "appendix-blueprints"
chapter: 99
order: 5
title: "부록. 미니 프로젝트 설계 노트"
status: "draft"
verification: "partial"
page_target: 5
keywords: ["프로젝트", "자동화", "설계", "실습"]
source_refs: ["https://openai.com/index/harness-engineering/", "https://platform.openai.com/docs/guides/function-calling"]
crosslinks: ["index.md"]
---

# 부록. 미니 프로젝트 설계 노트

첫 실습으로는 입력과 출력이 분명한 워크플로우가 좋습니다.

1. 회의록 자동 요약기
2. 이슈 분류기
3. 블로그 초안 생성기

이 세 프로젝트는 공통적으로 입력 형식, 출력 형식, 사람 검토 단계를 설계해 보기 좋습니다. 중요한 것은 모델 성능 경쟁보다도 템플릿, 검토 단계, 실패 대응을 함께 설계해 보는 것입니다.

처음에는 완전 자동화보다 반자동 흐름으로 시작하세요. 사람이 쉽게 검토할 수 있는 중간 산출물을 남기는 구조가 초반 성공률을 크게 높여 줍니다.
