import { buildBookHref, buildCatalogStats, buildReaderHref, getBookCatalog, getBooks, getStatusLabel, escapeHtml, renderCoverTitle } from "./shared.js";

const shelfGrid = document.querySelector("#shelf-grid");
const metricLiveBooks = document.querySelector("#metric-live-books");
const metricChapters = document.querySelector("#metric-chapters");
const metricSections = document.querySelector("#metric-sections");

await bootstrap();

async function bootstrap() {
  try {
    const books = await getBooks();
    const liveBooks = books.filter((book) => book.status === "live" && book.catalogPath);
    const catalogEntries = await Promise.all(liveBooks.map(async (book) => {
      const catalog = await getBookCatalog(book).catch(() => []);
      return [book.slug, catalog];
    }));
    const catalogBySlug = Object.fromEntries(catalogEntries);

    updateMetrics(books, catalogBySlug);
    renderShelf(books, catalogBySlug);
  } catch {
    shelfGrid.innerHTML = `
      <article class="inline-alert">
        <strong>책 목록을 불러오지 못했습니다.</strong>
        <p>정적 파일을 HTTP 서버로 열었는지 확인해 주세요. <code>file://</code> 방식으로 열면 일부 브라우저에서 목록 로딩이 막힐 수 있습니다.</p>
      </article>
    `;
  }
}

function updateMetrics(books, catalogBySlug) {
  const liveBooks = books.filter((book) => book.status === "live").length;
  metricLiveBooks.textContent = `${liveBooks}권`;
  let chapterTotal = 0;
  let sectionTotal = 0;

  for (const catalog of Object.values(catalogBySlug)) {
    if (!catalog.length) {
      continue;
    }
    const stats = buildCatalogStats(catalog);
    chapterTotal += stats.chapters;
    sectionTotal += stats.sections;
  }

  if (chapterTotal > 0) {
    metricChapters.textContent = `${chapterTotal}장`;
  }
  if (sectionTotal > 0) {
    metricSections.textContent = `${sectionTotal}절`;
  }
}

function renderShelf(books, catalogBySlug) {
  shelfGrid.innerHTML = books.map((book) => {
    const isLive = book.status === "live";
    const catalog = catalogBySlug[book.slug] || [];
    const catalogStats = catalog.length ? buildCatalogStats(catalog) : null;
    const stats = [...(book.stats || [])];

    if (catalogStats) {
      stats.unshift(`${catalogStats.sections}개 절`);
      stats.unshift(`${catalogStats.chapters}개 장`);
    }

    return `
      <article class="book-card" data-status="${escapeHtml(book.status)}">
        <div class="book-cover" data-accent="${escapeHtml(book.accent || "dawn")}">
          <p>${escapeHtml(book.kicker || "Book")}</p>
          ${renderCoverTitle(book, "h3")}
          <span>${escapeHtml(book.tagline || "")}</span>
        </div>
        <div class="book-card-copy">
          <div class="book-card-head">
            <span class="status-pill">${escapeHtml(getStatusLabel(book.status))}</span>
            <strong>${escapeHtml(book.subtitle)}</strong>
          </div>
          <p class="book-description">${escapeHtml(book.description)}</p>
          <div class="tag-row">
            ${stats.map((item) => `<span class="tag-chip">${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="card-actions">
            ${isLive ? `
              <a class="button-primary" href="${escapeHtml(buildBookHref(book, "/books/"))}">책 소개</a>
              <a class="button-secondary" href="${escapeHtml(buildReaderHref(book, "", "/reader/"))}">바로 읽기</a>
            ` : `
              <span class="button-disabled">${escapeHtml(getWaitingLabel(book.status))}</span>
            `}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function getWaitingLabel(status) {
  if (status === "suggested") {
    return "선택 후 제작";
  }
  return "준비 중";
}
