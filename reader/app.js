const tocRoot = document.querySelector("#toc");
const articleRoot = document.querySelector("#article");
const searchInput = document.querySelector("#search-input");
const currentLabel = document.querySelector("#current-label");
const currentMeta = document.querySelector("#current-meta");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");

const entryIndex = [];
let allEntries = [];
let currentEntry = null;

await bootstrap();

async function bootstrap() {
  const catalog = await fetchJson("/manuscript/catalog.json");
  allEntries = buildEntries(catalog);
  renderToc(allEntries);
  window.addEventListener("hashchange", handleLocationChange);
  searchInput.addEventListener("input", handleSearch);
  prevButton.addEventListener("click", () => navigateByOffset(-1));
  nextButton.addEventListener("click", () => navigateByOffset(1));

  if (!location.hash) {
    location.hash = encodeHash("manuscript/index.md");
    return;
  }

  await handleLocationChange();
}

function buildEntries(catalog) {
  const entries = [
    { section: "시작", title: "AI 노트", path: "manuscript/index.md" },
    { section: "시작", title: "프롤로그", path: "manuscript/prologue/index.md" }
  ];

  for (const chapter of catalog) {
    const chapterDir = `manuscript/${chapter.dir}`;
    entries.push({
      section: `${chapter.number}장`,
      title: `${chapter.number}장. ${chapter.title}`,
      path: `${chapterDir}/index.md`
    });

    for (const section of chapter.sections) {
      entries.push({
        section: `${chapter.number}장`,
        title: section.title,
        path: `${chapterDir}/${section.file}`
      });
    }
  }

  entries.push({ section: "부록", title: "부록", path: "manuscript/appendix/index.md" });
  entries.push({ section: "부록", title: "부록. 핵심 용어집", path: "manuscript/appendix/glossary.md" });
  entries.push({ section: "부록", title: "부록. 참고 자료와 검증 원칙", path: "manuscript/appendix/source-guide.md" });

  entries.forEach((entry, index) => {
    entry.index = index;
    entryIndex.push(entry);
  });

  return entries;
}

function renderToc(entries) {
  const activePath = decodeHash(location.hash.slice(1) || "manuscript/index.md");
  const grouped = groupBy(entries, (entry) => entry.section);
  tocRoot.innerHTML = "";

  for (const [sectionTitle, sectionEntries] of grouped.entries()) {
    const wrap = document.createElement("section");
    wrap.className = "toc-section";

    const title = document.createElement("h2");
    title.className = "toc-section-title";
    title.textContent = sectionTitle;
    wrap.appendChild(title);

    const list = document.createElement("ul");
    list.className = "toc-list";

    for (const entry of sectionEntries) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "toc-link";
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
  const path = decodeHash(location.hash.slice(1) || "manuscript/index.md");
  const entry = allEntries.find((item) => item.path === path) || allEntries[0];
  currentEntry = entry;
  renderToc(filteredEntries(searchInput.value));
  await loadArticle(entry.path);
  updatePager();
}

async function loadArticle(path) {
  const raw = await fetchText(`/${path}`);
  const parsed = parseMarkdownDocument(raw, path);
  currentLabel.textContent = parsed.title || currentEntry.title;
  currentMeta.textContent = `${currentEntry.section} 로컬 원고 미리보기`;
  articleRoot.innerHTML = parsed.html;
  wireInternalLinks(path);
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
  return allEntries.filter((entry) => entry.title.toLowerCase().includes(normalized));
}

function wireInternalLinks(basePath) {
  for (const anchor of articleRoot.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
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
