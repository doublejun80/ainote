import fs from "node:fs";
import path from "node:path";

const ICON_DATA_URI = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2218%22%20fill%3D%22%230F667A%22%2F%3E%3Cpath%20d%3D%22M18%2018.5c0-1.7%201.4-3.1%203.1-3.1h9.1c2%200%203.9.7%205.4%202v29.1c-1.4-1.1-3.1-1.7-5-1.7H18V18.5Z%22%20fill%3D%22%23FFF8EE%22%2F%3E%3Cpath%20d%3D%22M46%2018.5c0-1.7-1.4-3.1-3.1-3.1h-9.1c-2%200-3.9.7-5.4%202v29.1c1.4-1.1%203.1-1.7%205-1.7H46V18.5Z%22%20fill%3D%22%23EFE0C9%22%2F%3E%3Cpath%20d%3D%22M39%2014h6a3%203%200%200%201%203%203v13l-6-3.6-6%203.6V17a3%203%200%200%201%203-3Z%22%20fill%3D%22%23E2A44B%22%2F%3E%3Cpath%20d%3D%22M32%2019v27%22%20stroke%3D%22%230B5365%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E";
const FEATURED_SLUG = "ainote";
const LEGACY_BOOK_STYLES = '@import url("/site/styles.css?v=20260410-static");\n';
const LEGACY_BOOK_DETAIL_MODULE = 'import "/site/book-detail.js?v=20260410-static";\n';

export function generateStorefrontPages({ repoRoot, outputRoot }) {
  const books = readJson(path.join(repoRoot, "site", "books.json"));
  const liveBooks = books.filter((book) => book.status === "live" && book.catalogPath && book.contentRoot);
  const catalogsBySlug = Object.fromEntries(liveBooks.map((book) => [book.slug, readJson(path.join(repoRoot, book.catalogPath))]));
  const summary = summarizeCatalogs(liveBooks, catalogsBySlug);

  writeFile(path.join(outputRoot, "index.html"), renderHomePage({ books, liveBooks, catalogsBySlug, summary }));
  writeFile(path.join(outputRoot, "books", "index.html"), renderBooksIndexPage({ books, liveBooks, catalogsBySlug }));

  for (const book of liveBooks) {
    const bookDir = path.join(outputRoot, "books", book.slug);
    writeFile(
      path.join(bookDir, "index.html"),
      renderBookPage({ book, catalog: catalogsBySlug[book.slug] || [], books })
    );
    writeFile(path.join(bookDir, "styles.css"), LEGACY_BOOK_STYLES);
    writeFile(path.join(bookDir, "book-detail.js"), LEGACY_BOOK_DETAIL_MODULE);
  }
}

function renderHomePage({ books, liveBooks, catalogsBySlug, summary }) {
  const featuredPrimary = liveBooks.find((book) => book.slug === FEATURED_SLUG) || liveBooks[0];
  const featuredSecondary = liveBooks.find((book) => book.slug !== featuredPrimary?.slug) || featuredPrimary;
  const shelfCards = books.map((book) => renderShelfCard(book, catalogsBySlug[book.slug] || [])).join("");

  return wrapPage({
    title: "AINOTE 책방",
    description: "웹에서 바로 읽을 수 있는 출판형 기술 책방. 외부 브라우저에서도 안정적으로 보이도록 정적 페이지로 구성했습니다.",
    bodyClass: "storefront-page",
    navItems: [
      { href: bookHref(featuredPrimary), label: "대표 책" },
      { href: readerHref(featuredPrimary), label: "바로 읽기" },
      { href: "/README.md", label: "README", target: "_blank", rel: "noreferrer" }
    ],
    content: `
      <main class="page-main">
        <section class="hero-band">
          <div class="hero-copy">
            <p class="eyebrow">AINOTE Bookshelf</p>
            <h1>AINOTE 책방</h1>
            <p class="hero-lead"><strong>AI 노트</strong>, <strong>웹 개발 첫 지도</strong>, <strong>AI 자동화와 에이전트 워크플로우</strong>를 한곳에 모아두었습니다. 홈과 책 소개는 정적으로 렌더링해서 외부 브라우저에서도 바로 열리고, 읽기 화면만 리더 로직으로 이어지도록 구조를 단순화했습니다.</p>
            <div class="hero-actions">
              <a class="button-primary" href="${escapeHtml(bookHref(featuredPrimary))}">대표 책 소개 보기</a>
              <a class="button-secondary" href="${escapeHtml(readerHref(featuredPrimary))}">지금 바로 읽기</a>
            </div>
            <div class="metric-row">
              <article class="metric-card">
                <strong>${summary.liveBooks}권</strong>
                <span>공개 중인 책</span>
              </article>
              <article class="metric-card">
                <strong>${summary.chapters}장</strong>
                <span>공개 중인 장 수</span>
              </article>
              <article class="metric-card">
                <strong>${summary.sections}절</strong>
                <span>공개 중인 절 수</span>
              </article>
            </div>
          </div>

          <div class="hero-visual">
            <div class="hero-stack">
              <div class="hero-stack-head">
                <p>현재 공개 도서</p>
                <strong>${liveBooks.length}권</strong>
              </div>
              ${renderHeroBook(featuredPrimary, "hero-book-main")}
              ${renderHeroBook(featuredSecondary, "hero-book-side")}
              <article class="hero-note">
                <strong>읽기 흐름</strong>
                <p>책 소개는 정적 페이지로 바로 열리고, 실제 읽기 화면은 공용 리더로 이어집니다. 그래서 캐시나 스크립트 상태에 덜 흔들립니다.</p>
              </article>
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Shelf</p>
              <h2>지금 읽을 책과 다음 후보</h2>
            </div>
            <p class="section-copy">공개된 책은 정적 소개 페이지와 리더를 함께 갖추고 있고, 추천 후보는 같은 형식으로 이어서 추가할 수 있습니다.</p>
          </div>
          <div class="shelf-grid">${shelfCards}</div>
        </section>
      </main>
      <footer class="site-footer">
        <p>AINOTE 책방은 정적 페이지와 브라우저 리더를 함께 쓰는 구조입니다. 대표 도서는 <a href="${escapeHtml(bookHref(featuredPrimary))}">책 소개</a>와 <a href="${escapeHtml(readerHref(featuredPrimary))}">브라우저 리더</a>로 이어집니다.</p>
      </footer>
    `
  });
}

function renderBooksIndexPage({ books, liveBooks, catalogsBySlug }) {
  const featuredPrimary = liveBooks.find((book) => book.slug === FEATURED_SLUG) || liveBooks[0];
  const cards = books.map((book) => renderShelfCard(book, catalogsBySlug[book.slug] || [])).join("");

  return wrapPage({
    title: "책 목록 | AINOTE 책방",
    description: "AINOTE 책방 도서 목록",
    bodyClass: "storefront-page",
    navItems: [
      { href: "/", label: "책방 홈" },
      { href: readerHref(featuredPrimary), label: "바로 읽기" },
      { href: "/README.md", label: "README", target: "_blank", rel: "noreferrer" }
    ],
    extraBody: `
      <script>
        (function () {
          var slug = new URL(location.href).searchParams.get("book");
          if (slug) {
            location.replace("/books/" + encodeURIComponent(slug) + "/");
          }
        })();
      </script>
    `,
    content: `
      <main class="page-main">
        <section class="section-block">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Books</p>
              <h2>책 목록</h2>
            </div>
            <p class="section-copy">예전의 <code>/books/?book=slug</code> 링크도 이 페이지를 거쳐 정적 상세 페이지로 이어집니다.</p>
          </div>
          <div class="shelf-grid">${cards}</div>
        </section>
      </main>
      <footer class="site-footer">
        <p><a href="/">책방 홈</a>으로 돌아가거나 바로 원하는 책의 소개 페이지를 선택할 수 있습니다.</p>
      </footer>
    `
  });
}

function renderBookPage({ book, catalog, books }) {
  const stats = buildCatalogStats(catalog);
  const chips = [
    `${stats.chapters}개 장`,
    `${stats.sections}개 절`,
    "프롤로그 + 부록 포함",
    ...(book.stats || [])
  ];

  const chapterCards = catalog.map((chapter) => `
    <article class="chapter-card">
      <div class="chapter-head">
        <div>
          <p>${chapter.number}장</p>
          <h3>${escapeHtml(chapter.title)}</h3>
        </div>
        <a class="chapter-link" href="${escapeHtml(readerHref(book, `${book.contentRoot}/${chapter.dir}/index.md`))}">장 읽기</a>
      </div>
      <ul class="chapter-list">
        ${chapter.sections.map((section) => `<li><a href="${escapeHtml(readerHref(book, `${book.contentRoot}/${chapter.dir}/${section.file}`))}">${escapeHtml(section.title)}</a></li>`).join("")}
      </ul>
    </article>
  `).join("");

  const featuredPrimary = books.find((item) => item.slug === FEATURED_SLUG) || books[0];

  return wrapPage({
    title: `${book.title} | AINOTE 책방`,
    description: `${book.title} 책 소개 페이지`,
    bodyClass: "detail-page",
    navItems: [
      { href: "/", label: "책방 홈" },
      { href: readerHref(book), label: "바로 읽기" },
      { href: "/README.md", label: "README", target: "_blank", rel: "noreferrer" }
    ],
    content: `
      <main class="page-main">
        <section class="detail-hero">
          <div class="detail-cover-panel">
            <div class="book-cover large-cover" data-accent="${escapeHtml(book.accent || "dawn")}">
              <p>${escapeHtml(book.kicker || "BOOK")}</p>
              ${renderCoverTitle(book, "h1", true)}
              <span>${escapeHtml(book.tagline || "")}</span>
            </div>
          </div>

          <div class="detail-copy">
            <p class="eyebrow">Book Overview</p>
            <h2>${escapeHtml(book.subtitle)}</h2>
            <p class="detail-lead">${escapeHtml(book.description)}</p>
            <div class="detail-stat-row">
              ${chips.map((item, index) => `<span class="tag-chip${index < 3 ? " emphasis-chip" : ""}">${escapeHtml(item)}</span>`).join("")}
            </div>
            <div class="hero-actions">
              <a class="button-primary" href="${escapeHtml(readerHref(book))}">지금 바로 읽기</a>
              <a class="button-secondary" href="${escapeHtml(readerHref(book, `${book.contentRoot}/prologue/index.md`))}">프롤로그부터 보기</a>
            </div>
            <div class="info-note">
              <strong>이 페이지에서 하는 일</strong>
              <p>책 소개, 핵심 포인트, 목차 미리보기, 바로 읽기 링크를 한 페이지에서 함께 보여 줍니다. 스크립트가 늦어도 기본 내용은 그대로 보이도록 정적으로 렌더링했습니다.</p>
            </div>
          </div>
        </section>

        <section class="detail-section-grid">
          <article class="section-panel">
            <p class="section-kicker">Audience</p>
            <h3>이 책이 잘 맞는 독자</h3>
            <ul class="bullet-list">${(book.audience || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </article>
          <article class="section-panel">
            <p class="section-kicker">Highlights</p>
            <h3>읽기 전에 알아두면 좋은 포인트</h3>
            <div class="highlight-list">${(book.highlights || []).map((item) => `<article class="highlight-card"><p>${escapeHtml(item)}</p></article>`).join("")}</div>
          </article>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Preview</p>
              <h2>목차 미리보기</h2>
            </div>
            <p class="section-copy">${escapeHtml(book.title)}는 총 ${stats.chapters}개의 장과 ${stats.sections}개의 절로 구성되어 있습니다. 원하는 장과 절로 바로 이동할 수 있습니다.</p>
          </div>
          <div class="chapter-grid">${chapterCards}</div>
        </section>
      </main>
      <footer class="site-footer">
        <p><a href="/">책방 홈</a>으로 돌아가거나, 바로 <a href="${escapeHtml(readerHref(book))}">리더에서 이어 읽기</a>를 선택할 수 있습니다. 대표 도서는 <a href="${escapeHtml(bookHref(featuredPrimary))}">${escapeHtml(featuredPrimary.title)}</a>입니다.</p>
      </footer>
    `
  });
}

function renderShelfCard(book, catalog) {
  const isLive = book.status === "live" && Array.isArray(catalog) && catalog.length > 0;
  const catalogStats = isLive ? buildCatalogStats(catalog) : null;
  const stats = [...(book.stats || [])];

  if (catalogStats) {
    stats.unshift(`${catalogStats.sections}개 절`);
    stats.unshift(`${catalogStats.chapters}개 장`);
  }

  return `
    <article class="book-card" data-status="${escapeHtml(book.status)}">
      <div class="book-cover" data-accent="${escapeHtml(book.accent || "dawn")}">
        <p>${escapeHtml(book.kicker || "BOOK")}</p>
        ${renderCoverTitle(book, "h3", false)}
        <span>${escapeHtml(book.tagline || "")}</span>
      </div>
      <div class="book-card-copy">
        <div class="book-card-head">
          <span class="status-pill">${escapeHtml(getStatusLabel(book.status))}</span>
          <strong>${escapeHtml(book.subtitle)}</strong>
        </div>
        <p class="book-description">${escapeHtml(book.description)}</p>
        <div class="tag-row">${stats.map((item) => `<span class="tag-chip">${escapeHtml(item)}</span>`).join("")}</div>
        <div class="card-actions">
          ${isLive
            ? `
              <a class="button-primary" href="${escapeHtml(bookHref(book))}">책 소개</a>
              <a class="button-secondary" href="${escapeHtml(readerHref(book))}">바로 읽기</a>
            `
            : `<span class="button-disabled">선택 후 제작</span>`
          }
        </div>
      </div>
    </article>
  `;
}

function renderHeroBook(book, className) {
  if (!book) {
    return "";
  }

  return `
    <article class="hero-book ${className}">
      <p>${escapeHtml(book.kicker || "BOOK")}</p>
      ${renderCoverTitle(book, "h2", false)}
      <span>${escapeHtml(book.tagline || "")}</span>
    </article>
  `;
}

function wrapPage({ title, description, bodyClass, navItems, content, extraBody = "" }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="icon" type="image/svg+xml" sizes="any" href="${ICON_DATA_URI}">
  <link rel="shortcut icon" href="${ICON_DATA_URI}">
  <link rel="stylesheet" href="/site/styles.css?v=20260410-static">
</head>
<body class="${escapeHtml(bodyClass)}">
  <div class="site-shell">
    <header class="site-header">
      <a class="brand-mark" href="/">
        <span class="brand-mark-badge" aria-hidden="true">
          <svg class="brand-mark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="18" fill="#0F667A"/>
            <path d="M18 18.5c0-1.7 1.4-3.1 3.1-3.1h9.1c2 0 3.9.7 5.4 2v29.1c-1.4-1.1-3.1-1.7-5-1.7H18V18.5Z" fill="#FFF8EE"/>
            <path d="M46 18.5c0-1.7-1.4-3.1-3.1-3.1h-9.1c-2 0-3.9.7-5.4 2v29.1c1.4-1.1 3.1-1.7 5-1.7H46V18.5Z" fill="#EFE0C9"/>
            <path d="M39 14h6a3 3 0 0 1 3 3v13l-6-3.6-6 3.6V17a3 3 0 0 1 3-3Z" fill="#E2A44B"/>
            <path d="M32 19v27" stroke="#0B5365" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="brand-mark-copy">
          <strong>AINOTE 책방</strong>
          <small>Publishing MVP</small>
        </span>
      </a>
      <nav class="site-nav">
        ${navItems.map((item) => `<a href="${escapeHtml(item.href)}"${item.target ? ` target="${escapeHtml(item.target)}"` : ""}${item.rel ? ` rel="${escapeHtml(item.rel)}"` : ""}>${escapeHtml(item.label)}</a>`).join("")}
      </nav>
    </header>
    ${content}
  </div>
  ${extraBody}
</body>
</html>
`;
}

function renderCoverTitle(book, tagName, isLarge) {
  const lines = Array.isArray(book.coverTitleLines) && book.coverTitleLines.length ? book.coverTitleLines : [book.title];
  const classNames = ["cover-title"];
  if (lines.length >= 3) {
    classNames.push("cover-title-triple");
  } else if (lines.length === 2) {
    classNames.push("cover-title-double");
  } else {
    classNames.push("cover-title-single");
  }

  const tag = isLarge ? "h1" : tagName;
  return `<${tag} class="${classNames.join(" ")}">${lines.map((line) => `<span class="cover-title-line">${escapeHtml(line)}</span>`).join("")}</${tag}>`;
}

function buildCatalogStats(catalog) {
  return {
    chapters: catalog.length,
    sections: catalog.reduce((sum, chapter) => sum + chapter.sections.length, 0)
  };
}

function summarizeCatalogs(liveBooks, catalogsBySlug) {
  let chapters = 0;
  let sections = 0;

  for (const book of liveBooks) {
    const stats = buildCatalogStats(catalogsBySlug[book.slug] || []);
    chapters += stats.chapters;
    sections += stats.sections;
  }

  return {
    liveBooks: liveBooks.length,
    chapters,
    sections
  };
}

function bookHref(book) {
  return `/books/${encodeURIComponent(book.slug)}/`;
}

function readerHref(book, path = "") {
  const params = new URLSearchParams({ book: book.slug });
  const base = `/reader/?${params.toString()}`;
  return path ? `${base}#${encodeURIComponent(path)}` : base;
}

function getStatusLabel(status) {
  if (status === "live") {
    return "공개 중";
  }
  if (status === "suggested") {
    return "추천 후보";
  }
  return "준비 중";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
