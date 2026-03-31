---
id: "ch06"
chapter: 6
order: 0
title: "6장. 개발환경과 프로젝트 운영 감각"
status: "draft"
verification: "partial"
page_target: 7
keywords: ["개발환경", "배포환경", "폴더 구조", "빌드", "환경변수"]
source_refs: ["https://12factor.net/config", "https://developer.mozilla.org/en-US/docs/Learn_web_development", "https://web.dev/learn/"]
crosslinks: ["section-01.md", "section-02.md", "section-03.md", "section-04.md"]
---

# 6장. 개발환경과 프로젝트 운영 감각

튜토리얼을 따라 할 때는 잘 되는데, 막상 작은 서비스를 스스로 만들어 보려 하면 순서가 흐려지는 경우가 많습니다. 어떤 파일부터 만들어야 하는지, 로컬과 배포 환경이 왜 다른지, 비밀 정보는 왜 숨겨야 하는지 헷갈리기 때문입니다.

이 장은 기술 하나를 더 가르치기보다, 작은 웹 서비스를 실제로 다루는 운영 감각을 정리합니다. 완벽한 정답보다도 어떤 기준으로 구조를 나누고 환경을 구분하면 덜 흔들리는지를 익히는 데 목적이 있습니다.
