# 보기와 실행

이 프로젝트는 **책 내용**과 **책을 보여 주는 방식**을 분리해서 운영합니다.

## 무엇을 만드는가

- 원본: `manuscript/`의 Markdown 원고
- 편집/탐색: Obsidian에서 바로 열기
- 빠른 브라우저 열람: `reader/` 책 뷰어
- 정식 출판형 산출물: Quarto HTML/PDF/EPUB

즉, 전용 책 프로그램을 새로 만드는 것이 핵심은 아닙니다. 원본 원고를 유지하고, 이미 검증된 오픈소스 도구로 보여 주는 것이 기본 전략입니다.

## 지금 이 PC에서 바로 보는 방법

Node가 설치되어 있으므로 아래 명령으로 리더를 실행할 수 있습니다.

```powershell
node tools/serve-reader.mjs
```

그다음 브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:4173/
```

이제 루트 주소는 책방 홈이며, 여기서 대표 책 소개와 브라우저 리더로 이동할 수 있습니다.

- 책방 홈: `http://127.0.0.1:4173/`
- 대표 책 소개: `http://127.0.0.1:4173/books/?book=ainote`
- 브라우저 리더: `http://127.0.0.1:4173/reader/`

이 방식은 Quarto가 없어도 바로 읽을 수 있는 브라우저 책 보기이자, 공개형 책방 MVP 테스트 환경입니다.

## 호스팅용 정적 폴더 만들기

내 호스팅에 바로 올려 테스트하려면 아래 명령으로 정적 산출물을 만들 수 있습니다.

```powershell
node tools/build-reader-site.mjs
```

결과물은 `dist/web/` 아래에 생성됩니다. 이 폴더째 업로드하면 `reader/`, `manuscript/`, `docs/`, 루트 `index.html`이 함께 포함되어 바로 브라우저에서 읽을 수 있습니다.

## Obsidian에서 보는 방법

- Obsidian에서 저장소 루트 `AINOTE`를 Vault로 엽니다.
- `manuscript/`를 중심으로 탐색합니다.
- 원고 작성과 내부 링크 점검에는 이 방식이 가장 편합니다.

## 정식 책 형태로 보는 방법

Quarto를 설치하면 아래 명령으로 정식 HTML/PDF/EPUB을 렌더할 수 있습니다.

```powershell
quarto render
```

결과물은 `_book/` 아래에 생성됩니다.

## GitHub에 올려서 웹으로 보는 방법

추천 배포 방식은 Quarto HTML 책을 GitHub Pages에 올리는 것입니다. Quarto 공식 문서는 GitHub Actions로 자동 렌더 후 배포하는 방식을 지원합니다.

- Quarto books: https://quarto.org/docs/books/
- Quarto GitHub Pages: https://quarto.org/docs/publishing/github-pages.html

## 왜 Quarto를 기본으로 두는가

- HTML, PDF, EPUB을 한 원본에서 같이 만들 수 있습니다.
- 책 형태의 탐색, 장/절 구조, 교차 링크에 맞습니다.
- 정적 사이트라 호스팅이 쉽습니다.

## 대안

- mdBook: HTML 책 읽기 경험은 좋지만, PDF/EPUB까지 한 번에 가져가려면 지금 구조보다 덜 맞습니다.
- Obsidian만 사용: 작성과 탐색은 좋지만, 정식 출판 산출물 관리에는 한계가 있습니다.

현재 프로젝트에서는 **Obsidian + Quarto + 브라우저 뷰어** 조합이 가장 현실적입니다.
