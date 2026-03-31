---
id: "ch03"
chapter: 3
order: 0
title: "3장. 에이전트를 이루는 구성 요소"
status: "draft"
verification: "partial"
page_target: 7
keywords: ["에이전트", "도구", "상태", "메모리", "파일 검색"]
source_refs: ["https://platform.openai.com/docs/guides/function-calling", "https://platform.openai.com/docs/guides/tools/file-search", "https://platform.openai.com/docs/guides/conversation-state"]
crosslinks: ["section-01.md", "section-02.md", "section-03.md", "section-04.md"]
---

# 3장. 에이전트를 이루는 구성 요소

에이전트라는 말이 넓게 쓰이기 시작하면서, 단순한 챗봇과 여러 단계를 이어 가는 시스템이 한 단어로 섞여 보이는 경우가 많아졌습니다. 하지만 실무적으로는 에이전트를 이루는 요소를 분해해서 보는 편이 훨씬 도움이 됩니다.

이 장에서는 에이전트를 입력 해석, 도구 사용, 상태 유지, 외부 시스템 연결이라는 관점에서 살펴봅니다. 이 구성이 보이면 특정 프레임워크 이름에 덜 휘둘리고, 어떤 문제가 설계 문제인지 도구 문제인지도 더 잘 보이기 시작합니다.
