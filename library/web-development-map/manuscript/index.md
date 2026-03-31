---
id: "book-home"
chapter: 0
order: 0
title: "웹 개발 첫 지도"
status: "draft"
verification: "partial"
page_target: 12
keywords: ["웹 개발", "브라우저", "서버", "API", "배포", "보안"]
source_refs: ["https://developer.mozilla.org/en-US/docs/Learn_web_development", "https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview", "https://www.rfc-editor.org/rfc/rfc9110", "https://web.dev/learn/"]
crosslinks: ["prologue/index.md", "appendix/glossary.md"]
---

# 웹 개발 첫 지도

웹 개발을 처음 배우면 화면을 만드는 법, 서버를 띄우는 법, API를 호출하는 법, 로그인 상태를 유지하는 법, 배포하는 법이 각각 따로 노는 것처럼 보입니다. 이 책은 그 조각들을 하나의 흐름으로 연결해 주기 위해 만들어졌습니다.

핵심 질문은 단순합니다. 사용자가 브라우저에서 어떤 행동을 했을 때, 그 신호가 화면과 서버와 데이터와 배포 환경을 거쳐 어떻게 돌아오는가입니다. 이 흐름만 잡혀도 웹 개발은 훨씬 덜 막막해집니다. 반대로 이 연결이 보이지 않으면 HTML은 화면 문법으로, API는 낯선 약속으로, 배포는 마지막에만 보는 행사처럼 느껴집니다.

웹 개발은 언어 하나를 배우는 일이 아니라 층을 이해하는 일입니다. 브라우저는 화면을 그리고 입력을 받는 실행 환경이고, 서버는 규칙과 데이터를 관리하는 곳이며, 네트워크는 둘이 약속대로 대화하게 하는 통로입니다. 이 책은 그 층을 위에서 아래로 한 번 훑고, 다시 아래에서 위로 연결해 보는 방식으로 구성했습니다.

## 이 책의 목적

- 웹을 화면 기술이 아니라 서비스 흐름으로 이해하도록 돕습니다.
- 브라우저, 서버, API, 인증, 배포를 따로 외우지 않게 만듭니다.
- 첫 프로젝트를 시작할 때 어디서부터 손대야 할지 감을 잡게 합니다.
- 초보자가 자주 막히는 로그인, 저장, 보안, 환경 분리 문제를 한 흐름으로 설명합니다.

## 읽는 방법

- 처음 읽을 때는 각 장의 `index.md`와 프롤로그를 먼저 훑어 큰 그림을 잡으세요.
- 실제로 웹을 만들며 읽을 때는 필요한 절만 골라 다시 들어오면 됩니다.
- 막히는 개념이 생기면 부록의 용어집과 점검표를 함께 보세요.

## 책 구성

- 프롤로그: 왜 웹 개발은 흐름으로 봐야 하는가
- 1장: 브라우저와 첫 화면이 만들어지는 과정
- 2장: 사용자의 입력과 화면 상호작용
- 3장: 프론트엔드, 백엔드, API의 연결
- 4장: 로그인과 보안을 보는 기본 규칙
- 5장: 서버와 데이터가 맡는 책임
- 6장: 개발환경, 폴더 구조, 비밀 정보 관리
- 7장: 배포와 운영까지 이어 보는 마지막 단계
