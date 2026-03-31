---
id: "ch04"
chapter: 4
order: 0
title: "4장. 워크플로우 설계 패턴"
status: "draft"
verification: "partial"
page_target: 7
keywords: ["워크플로우", "역할 분리", "사람 검토", "재시도", "로그"]
source_refs: ["https://openai.com/index/harness-engineering/", "https://platform.openai.com/docs/guides/production-best-practices", "https://platform.openai.com/docs/guides/conversation-state"]
crosslinks: ["section-01.md", "section-02.md", "section-03.md", "section-04.md"]
---

# 4장. 워크플로우 설계 패턴

자동화를 오래 쓰다 보면 결국 비슷한 설계 패턴이 반복된다는 사실을 알게 됩니다. 어떤 흐름은 한 번의 호출로 충분하고, 어떤 흐름은 계획과 실행을 나눠야 하며, 어떤 흐름은 반드시 사람 검토가 들어가야 합니다. 이 장은 그런 패턴을 정리하는 장입니다.

패턴을 안다고 해서 모든 자동화가 쉬워지는 것은 아니지만, 적어도 매번 처음부터 설계하지 않아도 되는 장점이 생깁니다. 어떤 상황에서 단계를 나누고, 어디에 안전 장치를 두고, 어떤 정보를 남겨야 하는지에 대한 판단이 훨씬 빨라집니다.
