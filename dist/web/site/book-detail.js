import { buildBookHref, buildCatalogStats, buildReaderHref, getBookCatalog, getBooks, escapeHtml, getCoverTitleClassNames, renderCoverTitleLines } from "./shared.js?v=20260409-cachefix";

const requestedSlug = new URL(location.href).searchParams.get("book") || document.body.dataset.bookSlug;
const basePrefix = normalizeBasePrefix(document.body.dataset.basePrefix || "/");
const title = document.querySelector("#book-title");
const kicker = document.querySelector("#book-kicker");
const subtitle = document.querySelector("#book-subtitle");
const tagline = document.querySelector("#book-tagline");
const description = document.querySelector("#book-description");
const coverRoot = document.querySelector(".large-cover");
const statsRoot = document.querySelector("#book-stats");
const audienceList = document.querySelector("#audience-list");
const highlightList = document.querySelector("#highlight-list");
const catalogSummary = document.querySelector("#catalog-summary");
const chapterGrid = document.querySelector("#chapter-grid");
const primaryReaderLink = document.querySelector("#primary-reader-link");
const prologueLink = document.querySelector("#prologue-link");
const headerReaderLink = document.querySelector("#header-reader-link");
const footerReaderLink = document.querySelector("#footer-reader-link");

await bootstrap();

async function bootstrap() {
  try {
    const books = await getBooks();
    const book = books.find((item) => item.slug === requestedSlug)
      || books.find((item) => item.slug === "ainote")
      || books[0];

    if (!book) {
      renderMissingBook();
      return;
    }

    renderBook(book);

    const catalog = await getBookCatalog(book).catch(() => []);
    if (catalog.length) {
      renderCatalog(catalog, book);
    } else {
      catalogSummary.textContent = "목차 정보를 읽지 못해 간단한 소개만 표시합니다.";
    }
  } catch {
    renderLoadError();
  }
}

function renderBook(book) {
  document.title = `${book.title} | AINOTE 책방`;
  title.className = getCoverTitleClassNames(book);
  title.innerHTML = renderCoverTitleLines(book);
  kicker.textContent = book.kicker || "Book";
  subtitle.textContent = book.subtitle;
  tagline.textContent = book.tagline || "";
  description.textContent = book.description;
  if (coverRoot) {
    coverRoot.dataset.accent = book.accent || "dawn";
  }

  statsRoot.innerHTML = (book.stats || []).map((item) => `
    <span class="tag-chip">${escapeHtml(item)}</span>
  `).join("");

  audienceList.innerHTML = (book.audience || []).map((item) => `
    <li>${escapeHtml(item)}</li>
  `).join("");

  highlightList.innerHTML = (book.highlights || []).map((item) => `
    <article class="highlight-card">
      <p>${escapeHtml(item)}</p>
    </article>
  `).join("");

  primaryReaderLink.href = buildReaderHref(book, "", `${basePrefix}reader/`);
  prologueLink.href = buildReaderHref(book, `${book.contentRoot}/prologue/index.md`, `${basePrefix}reader/`);

  if (headerReaderLink) {
    headerReaderLink.href = buildReaderHref(book, "", `${basePrefix}reader/`);
  }
  if (footerReaderLink) {
    footerReaderLink.href = buildReaderHref(book, "", `${basePrefix}reader/`);
  }

  if (requestedSlug !== book.slug) {
    const canonicalUrl = buildBookHref(book, "/books/");
    history.replaceState(null, "", canonicalUrl);
  }
}

function renderCatalog(catalog, book) {
  const stats = buildCatalogStats(catalog);
  const statChips = [
    `${stats.chapters}개 장`,
    `${stats.sections}개 절`,
    "프롤로그 + 부록 포함"
  ];

  statsRoot.insertAdjacentHTML("afterbegin", statChips.map((item) => `
    <span class="tag-chip emphasis-chip">${escapeHtml(item)}</span>
  `).join(""));

  catalogSummary.textContent = `${book.title}는 총 ${stats.chapters}개의 장과 ${stats.sections}개의 절로 구성되어 있습니다. 장 단위로 훑어본 뒤, 관심 있는 절로 바로 들어갈 수 있습니다.`;

  chapterGrid.innerHTML = catalog.map((chapter) => {
    const chapterPath = `${book.contentRoot}/${chapter.dir}/index.md`;
    return `
      <article class="chapter-card">
        <div class="chapter-head">
          <div>
            <p>${chapter.number}장</p>
            <h3>${escapeHtml(chapter.title)}</h3>
          </div>
          <a class="chapter-link" href="${escapeHtml(buildReaderHref(book, chapterPath, `${basePrefix}reader/`))}">장 읽기</a>
        </div>
        <ul class="chapter-list">
          ${chapter.sections.map((section) => `
            <li>
              <a href="${escapeHtml(buildReaderHref(book, `${book.contentRoot}/${chapter.dir}/${section.file}`, `${basePrefix}reader/`))}">${escapeHtml(section.title)}</a>
            </li>
          `).join("")}
        </ul>
      </article>
    `;
  }).join("");
}

function renderMissingBook() {
  title.textContent = "책을 찾을 수 없습니다.";
  subtitle.textContent = "등록되지 않은 도서입니다.";
  description.textContent = "책 메타데이터를 읽지 못했습니다. 책방 홈으로 돌아가 다시 선택해 주세요.";
  audienceList.innerHTML = "<li>책 정보를 확인할 수 없습니다.</li>";
  highlightList.innerHTML = "<article class=\"highlight-card\"><p>홈으로 돌아가 등록된 책을 다시 선택해 주세요.</p></article>";
  catalogSummary.textContent = "목차를 표시할 수 없습니다.";
  chapterGrid.innerHTML = "";
  primaryReaderLink.href = `${basePrefix}`;
  primaryReaderLink.textContent = "책방 홈으로 돌아가기";
  prologueLink.remove();
}

function renderLoadError() {
  title.textContent = "책 정보를 불러오지 못했습니다.";
  subtitle.textContent = "정적 파일 로딩 상태를 확인해 주세요.";
  description.textContent = "HTTP 서버로 열었는지, 그리고 `site/books.json`과 책 원고용 `catalog.json` 파일들이 함께 업로드되었는지 확인하면 됩니다.";
  audienceList.innerHTML = "<li>정적 호스팅에서는 JSON 파일도 함께 배포되어야 합니다.</li>";
  highlightList.innerHTML = "<article class=\"highlight-card\"><p>업로드 폴더 전체를 올리면 대부분 바로 해결됩니다.</p></article>";
  catalogSummary.textContent = "목차를 표시할 수 없습니다.";
  chapterGrid.innerHTML = "<article class=\"inline-alert\"><strong>목차 로딩 실패</strong><p>`dist/web` 폴더 전체가 함께 배포되었는지 확인해 주세요.</p></article>";
}

function normalizeBasePrefix(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
