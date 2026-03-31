import { EMBEDDED_BOOKS, EMBEDDED_CATALOGS, EMBEDDED_DOCUMENTS } from "../site/prebuilt-data.js";

const tocRoot = document.querySelector("#toc");
const articleRoot = document.querySelector("#article");
const searchInput = document.querySelector("#search-input");
const currentLabel = document.querySelector("#current-label");
const currentMeta = document.querySelector("#current-meta");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const tocPageLink = document.querySelector("#toc-page-link");
const sidebarTitle = document.querySelector("#sidebar-title");
const sidebarSubtitle = document.querySelector("#sidebar-subtitle");
const bookHomeLink = document.querySelector("#book-home-link");
const readerBaseUrl = new URL("./", import.meta.url);
const repoBaseUrl = new URL("../", readerBaseUrl);
const DEFAULT_BOOK_SLUG = "ainote";

const VIRTUAL_TOC_PATH = "__toc__";
const TOC_STATE_KEY = "ai-note-reader-toc-state";
const entryIndex = [];

let activeBook = null;
let contentRoot = "manuscript";
let catalog = [];
let allEntries = [];
let currentEntry = null;
let appendixEntries = [];
let tocOpenState = loadTocOpenState();

await bootstrap();

async function bootstrap() {
  const books = await loadBooks();
  const requestedSlug = new URL(location.href).searchParams.get("book") || DEFAULT_BOOK_SLUG;
  activeBook = books.find((book) => book.slug === requestedSlug)
    || books.find((book) => book.slug === DEFAULT_BOOK_SLUG)
    || books[0];
  contentRoot = activeBook?.contentRoot || "manuscript";
  appendixEntries = buildAppendixEntries(contentRoot);
  catalog = await loadCatalog(activeBook?.catalogPath || `${contentRoot}/catalog.json`);
  allEntries = buildEntries(catalog);
  applyBookChrome();

  if (tocPageLink) {
    tocPageLink.href = `#${encodeHash(VIRTUAL_TOC_PATH)}`;
  }

  renderToc(filteredEntries(searchInput.value));
  window.addEventListener("hashchange", handleLocationChange);
  searchInput.addEventListener("input", handleSearch);
  prevButton.addEventListener("click", () => navigateByOffset(-1));
  nextButton.addEventListener("click", () => navigateByOffset(1));

  if (!location.hash) {
    location.hash = encodeHash(VIRTUAL_TOC_PATH);
    return;
  }

  await handleLocationChange();
}

function applyBookChrome() {
  const bookTitle = activeBook?.title || "책";
  document.title = `${bookTitle} 리더`;

  if (sidebarTitle) {
    sidebarTitle.textContent = bookTitle;
  }
  if (sidebarSubtitle) {
    sidebarSubtitle.textContent = activeBook?.tagline || "브라우저 책 뷰어";
  }
  if (searchInput) {
    searchInput.placeholder = `${bookTitle} 안에서 제목 검색`;
  }
  if (bookHomeLink && activeBook?.slug) {
    bookHomeLink.href = `../books/?book=${encodeURIComponent(activeBook.slug)}`;
  }
}

function buildAppendixEntries(root) {
  return [
    { section: "부록", title: "부록", path: `${root}/appendix/index.md` },
    { section: "부록", title: "부록. 핵심 용어집", path: `${root}/appendix/glossary.md` },
    { section: "부록", title: "부록. 참고 자료와 검증 원칙", path: `${root}/appendix/source-guide.md` },
    { section: "부록", title: "부록. 읽는 순서와 학습 로드맵", path: `${root}/appendix/reading-roadmaps.md` },
    { section: "부록", title: "부록. 미니 프로젝트 설계 노트", path: `${root}/appendix/project-blueprints.md` },
    { section: "부록", title: "부록. 점검표", path: `${root}/appendix/checklists.md` },
    { section: "부록", title: "부록. 자주 묻는 질문", path: `${root}/appendix/faq.md` },
    { section: "부록", title: "부록. 복습 질문", path: `${root}/appendix/review-questions.md` }
  ];
}

function buildEntries(catalogData) {
  entryIndex.length = 0;

  const entries = [
    { section: "시작", title: "전체 목차", path: VIRTUAL_TOC_PATH, kind: "virtual" },
    { section: "시작", title: activeBook?.title || "책 소개", path: `${contentRoot}/index.md`, kind: "page" },
    { section: "시작", title: "프롤로그", path: `${contentRoot}/prologue/index.md`, kind: "page" }
  ];

  for (const chapter of catalogData) {
    const chapterDir = `${contentRoot}/${chapter.dir}`;
    entries.push({
      section: `${chapter.number}장`,
      title: `${chapter.number}장. ${chapter.title}`,
      path: `${chapterDir}/index.md`,
      kind: "chapter-index"
    });

    for (const section of chapter.sections) {
      entries.push({
        section: `${chapter.number}장`,
        title: section.title,
        path: `${chapterDir}/${section.file}`,
        kind: "section"
      });
    }
  }

  entries.push(...appendixEntries.map((entry) => ({ ...entry, kind: "appendix" })));

  entries.forEach((entry, index) => {
    entry.index = index;
    entryIndex.push(entry);
  });

  return entries;
}

function renderToc(entries) {
  const activePath = decodeHash(location.hash.slice(1) || VIRTUAL_TOC_PATH);
  const grouped = groupBy(entries, (entry) => entry.section);
  const isSearching = Boolean(searchInput.value.trim());
  tocRoot.innerHTML = "";

  for (const [sectionTitle, sectionEntries] of grouped.entries()) {
    const wrap = document.createElement("section");
    wrap.className = "toc-section";

    const activeInSection = sectionEntries.some((entry) => entry.path === activePath);
    const isCollapsible = sectionTitle !== "시작";
    const open = isSearching || activeInSection || sectionTitle === "시작" || tocOpenState[sectionTitle] === true;

    if (isCollapsible) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "toc-section-toggle";
      button.setAttribute("aria-expanded", String(open));
      button.innerHTML = `
        <span class="toc-section-title">${escapeHtml(sectionTitle)}</span>
        <span class="toc-chevron" aria-hidden="true">›</span>
      `;
      button.addEventListener("click", () => {
        const nextOpen = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(nextOpen));
        list.hidden = !nextOpen;
        list.classList.toggle("collapsed", !nextOpen);
        tocOpenState[sectionTitle] = nextOpen;
        saveTocOpenState();
      });
      wrap.appendChild(button);
    } else {
      const title = document.createElement("h2");
      title.className = "toc-section-title";
      title.textContent = sectionTitle;
      wrap.appendChild(title);
    }

    const list = document.createElement("ul");
    list.className = "toc-list";
    list.hidden = !open;
    if (!open) {
      list.classList.add("collapsed");
    }

    for (const entry of sectionEntries) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "toc-link";
      if (entry.kind === "chapter-index") {
        link.classList.add("chapter-link");
      }
      if (entry.path === activePath) {
        link.classList.add("active");
      }
      link.href = `#${encodeHash(entry.path)}`;
      link.textContent = entry.title;
      item.appendChild(link);
      list.appendChild(item);
    }

    wrap.appendChild(list);
    tocRoot.appendChild(wrap);
  }
}

async function handleLocationChange() {
  const path = decodeHash(location.hash.slice(1) || VIRTUAL_TOC_PATH);
  const entry = allEntries.find((item) => item.path === path) || allEntries[0];
  currentEntry = entry;
  renderToc(filteredEntries(searchInput.value));
  await loadArticle(entry.path);
  updatePager();
}

async function loadArticle(path) {
  if (path === VIRTUAL_TOC_PATH) {
    currentLabel.textContent = "전체 목차";
    currentMeta.textContent = `${activeBook?.title || "책"} 전체 구조를 보고 원하는 장과 절로 바로 이동하세요.`;
    articleRoot.innerHTML = renderTocLandingPage();
    return;
  }

  const raw = await loadDocument(path);
  const parsed = parseMarkdownDocument(raw, path);
  currentLabel.textContent = parsed.title || currentEntry.title;
  currentMeta.textContent = `${currentEntry.section} 읽기`;
  articleRoot.innerHTML = parsed.html;
  wireInternalLinks(path);
}

function renderTocLandingPage() {
  const chapterCards = catalog.map((chapter) => {
    const chapterPath = `${contentRoot}/${chapter.dir}/index.md`;
    const sectionItems = chapter.sections
      .map((section) => `
        <li>
          <a href="#${encodeHash(`${contentRoot}/${chapter.dir}/${section.file}`)}">${escapeHtml(section.title)}</a>
        </li>
      `)
      .join("");

    return `
      <section class="toc-page-card">
        <div class="toc-page-card-head">
          <div>
            <p class="toc-page-kicker">${chapter.number}장</p>
            <h2><a href="#${encodeHash(chapterPath)}">${escapeHtml(chapter.title)}</a></h2>
          </div>
          <a class="toc-page-jump" href="#${encodeHash(chapterPath)}">장으로 이동</a>
        </div>
        <ul class="toc-page-list">${sectionItems}</ul>
      </section>
    `;
  }).join("");

  const appendixItems = appendixEntries
    .map((entry) => `<li><a href="#${encodeHash(entry.path)}">${escapeHtml(entry.title)}</a></li>`)
    .join("");

  return `
    <section class="toc-page-hero">
      <p class="toc-page-eyebrow">${escapeHtml(activeBook?.title || "책")} 길잡이</p>
      <h1>목차</h1>
      <p>처음 읽을 때는 책 소개와 프롤로그부터 훑고, 다시 볼 때는 필요한 절로 바로 들어가면 됩니다. 아래에서 원하는 장을 눌러 바로 이동하세요.</p>
      <div class="toc-page-quicklinks">
        <a href="#${encodeHash(`${contentRoot}/index.md`)}">책 소개</a>
        <a href="#${encodeHash(`${contentRoot}/prologue/index.md`)}">프롤로그</a>
        <a href="#${encodeHash(`${contentRoot}/appendix/index.md`)}">부록 안내</a>
      </div>
    </section>

    <section class="toc-page-stack">
      ${chapterCards}
    </section>

    <section class="toc-page-card toc-page-appendix">
      <div class="toc-page-card-head">
        <div>
          <p class="toc-page-kicker">부록</p>
          <h2><a href="#${encodeHash(`${contentRoot}/appendix/index.md`)}">찾아보기와 학습 가이드</a></h2>
        </div>
        <a class="toc-page-jump" href="#${encodeHash(`${contentRoot}/appendix/index.md`)}">부록으로 이동</a>
      </div>
      <ul class="toc-page-list">${appendixItems}</ul>
    </section>
  `;
}

function updatePager() {
  const index = currentEntry?.index ?? 0;
  prevButton.disabled = index <= 0;
  nextButton.disabled = index >= allEntries.length - 1;
}

function navigateByOffset(offset) {
  if (!currentEntry) {
    return;
  }
  const next = allEntries[currentEntry.index + offset];
  if (!next) {
    return;
  }
  location.hash = encodeHash(next.path);
}

function handleSearch() {
  renderToc(filteredEntries(searchInput.value));
}

function filteredEntries(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return allEntries;
  }
  return allEntries.filter((entry) => {
    return entry.title.toLowerCase().includes(normalized) || entry.section.toLowerCase().includes(normalized);
  });
}

function wireInternalLinks(basePath) {
  for (const anchor of articleRoot.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) {
      continue;
    }
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      continue;
    }
    if (href.startsWith("/C:/")) {
      continue;
    }
    if (href.endsWith(".md") || href.includes(".md#")) {
      const resolved = resolveMarkdownPath(basePath, href);
      anchor.setAttribute("href", `#${encodeHash(resolved)}`);
    }
  }
}

function parseMarkdownDocument(raw, filePath) {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  let index = 0;
  let title = "";

  if (lines[0] === "---") {
    index = 1;
    for (; index < lines.length; index += 1) {
      const line = lines[index];
      if (line === "---") {
        index += 1;
        break;
      }
      const separator = line.indexOf(":");
      if (separator === -1) {
        continue;
      }
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (key === "title") {
        title = value.replace(/^"|"$/g, "");
      }
    }
  }

  const body = lines.slice(index);
  return { title, html: renderMarkdownBody(body, filePath) };
}

function renderMarkdownBody(lines, filePath) {
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      html.push(`<pre><code class="language-${escapeHtml(language)}">${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.slice(level).trim();
      html.push(`<h${level}>${renderInline(text, filePath)}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }
      html.push(`<blockquote>${quoteLines.map((part) => renderInline(part, filePath)).join("<br>")}</blockquote>`);
      continue;
    }

    if (/^\|.*\|$/.test(line) && i + 1 < lines.length && /^\|[\s:-|]+\|$/.test(lines[i + 1])) {
      const tableLines = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      html.push(renderTable(tableLines, filePath));
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item, filePath)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${renderInline(item, filePath)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|> |[-*]\s+|\d+\.\s+|```|\|.*\|$)/.test(lines[i])) {
      paragraph.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(" "), filePath)}</p>`);
  }

  return html.join("\n");
}

function renderTable(lines, filePath) {
  const rows = lines.map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
  const header = rows[0];
  const body = rows.slice(2);
  const headHtml = `<thead><tr>${header.map((cell) => `<th>${renderInline(cell, filePath)}</th>`).join("")}</tr></thead>`;
  const bodyHtml = `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell, filePath)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return `<table>${headHtml}${bodyHtml}</table>`;
}

function renderInline(text, filePath) {
  let value = escapeHtml(text);
  value = value.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = escapeAttribute(href);
    return `<a href="${safeHref}">${escapeHtml(label)}</a>`;
  });
  value = value.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, target, _full, alias) => {
    const resolved = resolveMarkdownPath(filePath, target.endsWith(".md") ? target : `${target}.md`);
    return `<a href="#${encodeHash(resolved)}">${escapeHtml(alias || target)}</a>`;
  });
  return value;
}

function resolveMarkdownPath(basePath, href) {
  const [rawTarget] = href.split("#");
  const baseParts = basePath.split("/");
  baseParts.pop();

  for (const part of rawTarget.split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      baseParts.pop();
      continue;
    }
    baseParts.push(part);
  }

  return baseParts.join("/");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function escapeAttribute(value) {
  return value.replace(/\"/g, "&quot;");
}

function groupBy(items, selector) {
  const map = new Map();
  for (const item of items) {
    const key = selector(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
}

function encodeHash(value) {
  return encodeURIComponent(value);
}

function decodeHash(value) {
  return decodeURIComponent(value);
}

function loadTocOpenState() {
  try {
    const raw = localStorage.getItem(TOC_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTocOpenState() {
  try {
    localStorage.setItem(TOC_STATE_KEY, JSON.stringify(tocOpenState));
  } catch {
    // ignore storage failures in local preview mode
  }
}

function resolveRepoUrl(relativePath) {
  return new URL(relativePath, repoBaseUrl).toString();
}

async function loadBooks() {
  try {
    return await fetchJson(resolveRepoUrl("site/books.json"));
  } catch (error) {
    if (EMBEDDED_BOOKS.length) {
      return cloneValue(EMBEDDED_BOOKS);
    }
    throw error;
  }
}

async function loadCatalog(relativePath) {
  try {
    return await fetchJson(resolveRepoUrl(relativePath));
  } catch (error) {
    const fallback = EMBEDDED_CATALOGS[relativePath];
    if (fallback) {
      return cloneValue(fallback);
    }
    throw error;
  }
}

async function loadDocument(relativePath) {
  try {
    return await fetchText(resolveRepoUrl(relativePath));
  } catch (error) {
    if (Object.prototype.hasOwnProperty.call(EMBEDDED_DOCUMENTS, relativePath)) {
      return EMBEDDED_DOCUMENTS[relativePath];
    }
    throw error;
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}
