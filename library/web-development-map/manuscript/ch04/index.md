---
id: "ch04"
chapter: 4
order: 0
title: "4장. 로그인과 보안의 기본 규칙"
status: "draft"
verification: "partial"
page_target: 7
keywords: ["인증", "인가", "세션", "토큰", "CORS", "HTTPS"]
source_refs: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies", "https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"]
crosslinks: ["section-01.md", "section-02.md", "section-03.md", "section-04.md"]
---

# 4장. 로그인과 보안의 기본 규칙

웹 개발을 조금만 해도 로그인, 쿠키, 토큰, CORS, HTTPS 같은 단어가 한꺼번에 등장합니다. 초보자에게는 모두 보안 용어처럼 보이지만, 실제로는 각각 맡는 역할이 조금씩 다릅니다. 이 장의 목표는 그 구분을 흐릿하지 않게 만드는 것입니다.

보안 주제는 처음부터 깊게 파고들면 어렵지만, 기본 규칙을 잡아 두면 프로젝트를 만들 때 훨씬 덜 불안합니다. 누가 사용자인지 확인하는 일, 무엇을 해도 되는지 판단하는 일, 요청이 안전하게 오가는지 확인하는 일은 결국 모두 같은 서비스 흐름 안에서 이어집니다.
