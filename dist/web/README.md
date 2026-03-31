# AINOTE

AI 시대에 초보자가 알아야 할 개발의 큰 그림을 한국어 Markdown 책으로 정리하는 저장소입니다.

## 어떻게 보나

가장 빠른 방법은 아래 명령으로 브라우저 뷰어를 실행하는 것입니다.

```powershell
node tools/serve-reader.mjs
```

브라우저에서 `http://127.0.0.1:4173/` 를 열면 책방 홈이 보입니다.

- 책방 홈: `http://127.0.0.1:4173/`
- 대표 책 소개: `http://127.0.0.1:4173/books/?book=ainote`
- 바로 읽기: `http://127.0.0.1:4173/reader/`

업로드용 정적 웹 폴더를 만들려면 아래 명령을 실행하세요.

```powershell
node tools/build-reader-site.mjs
```

그러면 `dist/web/` 아래에 호스팅 가능한 파일이 생성됩니다.

자세한 설명은 [보기와 실행](/C:/Users/05507/Documents/Github/AINOTE/docs/viewing-and-running.md)을 확인하세요.

## 구조

- `index.txt`: 원본 목차
- `docs/`: 운영 원칙, 스타일 가이드, 품질 기준, 참고 자료 인덱스
- `manuscript/`: Obsidian 호환 원고 원본
- `books/`: 단일 책 소개 템플릿
- `reader/`: 브라우저 책 뷰어
- `site/`: 책방 홈과 책 소개용 정적 자산
- `skills/`: 반복 집필과 검수를 위한 커스텀 Codex 스킬
- `.github/workflows/`: PR 점검, Pages 배포, 야간 가드닝 자동화
- `tools/`: 목차 동기화, 구조 검사, 링크 검사, 리뷰 리포트 생성, 뷰어 서버

## 주요 명령

- `node tools/sync-manuscript.mjs`
- `node tools/sync-manuscript.mjs --check`
- `node tools/validate-manuscript.mjs`
- `node tools/check-links.mjs`
- `node tools/review-manuscript.mjs`
- `node tools/serve-reader.mjs`
- `node tools/build-reader-site.mjs`

## 출판 방향

원본은 Markdown 하나로 유지하고, Quarto를 통해 HTML/PDF/EPUB을 파생 산출물로 만듭니다. GitHub에 올리면 GitHub Pages로 HTML 책을 자동 배포할 수 있습니다.
