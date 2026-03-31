---
id: "ch03"
chapter: 3
order: 0
title: "3장. 프론트엔드와 백엔드의 연결"
status: "draft"
verification: "partial"
page_target: 7
keywords: ["프론트엔드", "백엔드", "API", "HTTP", "JSON", "fetch"]
source_refs: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", "https://www.rfc-editor.org/rfc/rfc9110"]
crosslinks: ["section-01.md", "section-02.md", "section-03.md", "section-04.md"]
---

# 3장. 프론트엔드와 백엔드의 연결

이 장에서는 브라우저 안의 화면 코드가 서버와 어떤 약속 위에서 만나는지 봅니다. 많은 입문자가 HTML, CSS, JavaScript까지는 따라가다가도 API와 HTTP가 등장하는 순간 갑자기 다른 세계로 넘어간 느낌을 받습니다. 하지만 실제로는 사용자의 클릭이 조금 더 멀리 이동했을 뿐입니다.

프론트엔드와 백엔드는 서로 다른 층이지만, 둘을 실제로 이어 주는 것은 결국 요청과 응답입니다. 어떤 자원을 읽을지, 어떤 데이터를 보낼지, 성공과 실패를 어떻게 표현할지에 대한 약속이 API로 구체화됩니다. 이 장은 그 연결 고리를 입문자 기준으로 정리합니다.
