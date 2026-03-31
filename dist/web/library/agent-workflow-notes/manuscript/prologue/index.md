---
id: "prologue"
chapter: 0
order: 1
title: "프롤로그. 자동화는 왜 도구보다 흐름 설계가 중요한가요?"
status: "draft"
verification: "partial"
page_target: 6
keywords: ["자동화", "에이전트", "흐름 설계"]
source_refs: ["https://openai.com/index/harness-engineering/", "https://platform.openai.com/docs/guides/prompting", "https://platform.openai.com/docs/guides/production-best-practices"]
crosslinks: ["../index.md", "../ch01/index.md", "../ch06/index.md"]
---

# 프롤로그. 자동화는 왜 도구보다 흐름 설계가 중요한가요?

AI 자동화에 관심을 가지면 가장 먼저 어떤 모델이 좋은지, 어떤 툴이 유명한지, 어떤 에이전트 프레임워크가 편한지부터 궁금해집니다. 물론 중요한 질문이지만, 실제로 성패를 가르는 것은 대개 도구 이름보다 흐름 설계입니다.

같은 모델을 써도 어떤 입력을 주고, 중간 판단은 어디에서 하고, 결과를 누가 검토하며, 실패했을 때 어떻게 되돌릴지를 정리한 사람과 그렇지 않은 사람의 결과는 크게 다릅니다. 자동화는 마법 버튼이 아니라 업무 흐름을 다시 그리는 작업에 가깝습니다.

특히 자동화가 길어질수록 프롬프트 한 줄의 품질보다 더 중요한 것이 드러납니다. 입력 형식이 일정한지, 도구가 필요한지, 이전 단계의 맥락을 어떻게 이어갈지, 사람이 개입해야 할 지점을 어디에 둘지 같은 문제가 바로 그것입니다. 이 질문을 빼면 자동화는 쉽게 데모 수준에 머뭅니다.

이 책은 그래서 무엇을 자동화할 것인가와 어디까지 자동화할 것인가를 먼저 묻습니다. 그 위에 프롬프트, 도구, 메모리, 에이전트, 인간 검토를 얹어 보는 식으로 접근합니다. 이 순서를 익히면 새 도구가 나와도 쉽게 흔들리지 않습니다.
