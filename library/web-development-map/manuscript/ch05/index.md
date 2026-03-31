---
id: "ch05"
chapter: 5
order: 0
title: "5장. 서버와 데이터의 책임"
status: "draft"
verification: "partial"
page_target: 7
keywords: ["서버", "라우트", "서비스", "데이터베이스", "캐시"]
source_refs: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"]
crosslinks: ["section-01.md", "section-02.md", "section-03.md", "section-04.md"]
---

# 5장. 서버와 데이터의 책임

프론트엔드에서 보이는 화면 뒤에는 서버와 데이터 계층이 있습니다. 사용자는 버튼을 눌렀을 뿐이지만, 서버는 요청을 해석하고 규칙을 적용하고 데이터를 읽고 쓰며 응답을 만들어 냅니다. 이 장은 그 뒤쪽 흐름을 입문자 눈높이로 정리합니다.

웹 개발이 어려운 이유 중 하나는 화면만으로는 서버와 데이터가 보이지 않기 때문입니다. 하지만 서비스가 조금만 복잡해져도 결국 어디에서 규칙을 처리하고, 어디에 데이터를 저장하고, 느린 일을 어떻게 감당할지 고민해야 합니다.
