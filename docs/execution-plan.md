# 실행 계획

## 작업 단위

- 기본 집필 단위는 `manuscript/chXX/section-YY.md` 1개입니다.
- 권장 변경 크기는 1~3개 절입니다.
- 장 소개나 부록은 별도 단위로 다룹니다.

## 권장 흐름

1. `node tools/sync-manuscript.mjs`로 목차와 파일 구조를 동기화합니다.
2. 대상 절을 선택하고 관련 용어를 [glossary.md](/C:/Users/05507/Documents/Github/AINOTE/docs/glossary.md)에서 확인합니다.
3. 필요하면 `source-research` 스킬로 핵심 출처를 모읍니다.
4. `section-drafter` 스킬 기준으로 초고를 작성합니다.
5. `tone-review` 스킬과 `node tools/review-manuscript.mjs`로 톤과 난이도를 점검합니다.
6. 장 단위가 모이면 사실 검증을 하고 `verified`로 승격합니다.

## 가드닝

- 구조 누락, 중복 비유, 깨진 링크, 빈 `source_refs`를 주기적으로 검사합니다.
- 반복적으로 발견되는 문제는 문서 규칙이나 스크립트로 승격합니다.
