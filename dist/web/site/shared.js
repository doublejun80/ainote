import { EMBEDDED_BOOKS, EMBEDDED_CATALOGS } from "./prebuilt-data.js";

const booksUrl = new URL("./books.json", import.meta.url);

export async function getBooks() {
  return loadJsonWithFallback(booksUrl, EMBEDDED_BOOKS);
}

export async function getBookCatalog(book) {
  if (!book?.catalogPath) {
    return [];
  }
  return loadJsonWithFallback(
    new URL(`../${book.catalogPath}`, import.meta.url),
    EMBEDDED_CATALOGS[book.catalogPath] || null
  );
}

export function buildCatalogStats(catalog) {
  const chapters = catalog.length;
  const sections = catalog.reduce((sum, chapter) => sum + chapter.sections.length, 0);
  return { chapters, sections };
}

export function buildBookHref(book, base = "/books/") {
  const slug = encodeURIComponent(book?.slug || DEFAULT_BOOK_SLUG);
  return `${base}?book=${slug}`;
}

export function getStatusLabel(status) {
  if (status === "live") {
    return "공개 중";
  }
  if (status === "suggested") {
    return "추천 후보";
  }
  return "준비 중";
}

export function buildReaderHref(book, path = "", base = "/reader/") {
  const query = new URLSearchParams({ book: book?.slug || DEFAULT_BOOK_SLUG }).toString();
  const hrefBase = query ? `${base}?${query}` : base;
  if (!path) {
    return hrefBase;
  }
  return `${hrefBase}#${encodeURIComponent(path)}`;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderCoverTitle(book, tagName = "h3") {
  return `<${tagName} class="${getCoverTitleClassNames(book)}">${renderCoverTitleLines(book)}</${tagName}>`;
}

export function renderCoverTitleLines(book) {
  const lines = getCoverTitleLines(book);

  return lines
    .map((line) => `<span class="cover-title-line">${escapeHtml(line)}</span>`)
    .join("");
}

export function getCoverTitleClassNames(book) {
  const lines = getCoverTitleLines(book);
  const classNames = ["cover-title"];

  if (lines.length >= 3) {
    classNames.push("cover-title-triple");
  } else if (lines.length === 2) {
    classNames.push("cover-title-double");
  } else {
    classNames.push("cover-title-single");
  }

  return classNames.join(" ");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
}

async function loadJsonWithFallback(url, fallbackValue) {
  try {
    return await fetchJson(url);
  } catch (error) {
    if (fallbackValue) {
      return cloneValue(fallbackValue);
    }
    throw error;
  }
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCoverTitleLines(book) {
  return Array.isArray(book?.coverTitleLines) && book.coverTitleLines.length
    ? book.coverTitleLines
    : [book?.title || ""];
}

const DEFAULT_BOOK_SLUG = "ainote";
