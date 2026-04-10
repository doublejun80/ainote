import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateStorefrontPages } from "./lib/storefront-renderer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputRoot = path.resolve(repoRoot, process.argv[2] || "dist/web");

generateStorefrontPages({ repoRoot, outputRoot: repoRoot });

const directoriesToCopy = [
  "books",
  "library",
  "reader",
  "site",
  "manuscript"
];

const filesToCopy = [
  "index.html",
  "styles.css",
  "home.js",
  "book-detail.js",
  "README.md",
  path.join("docs", "book-outline.md")
];

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

for (const directory of directoriesToCopy) {
  copyDirectory(path.join(repoRoot, directory), path.join(outputRoot, directory));
}

for (const file of filesToCopy) {
  copyFile(path.join(repoRoot, file), path.join(outputRoot, file));
}

generateStorefrontPages({ repoRoot, outputRoot });

writePrebuiltDataModule();

console.log(`Built web reader bundle at ${path.relative(repoRoot, outputRoot)}`);

function copyDirectory(sourceDir, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
      continue;
    }

    copyFile(sourcePath, destinationPath);
  }
}

function copyFile(sourcePath, destinationPath) {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

function writePrebuiltDataModule() {
  const books = JSON.parse(fs.readFileSync(path.join(repoRoot, "site", "books.json"), "utf8"));
  const catalogs = {};
  const documents = {};

  for (const book of books) {
    if (book.catalogPath) {
      const catalogPath = path.join(repoRoot, book.catalogPath);
      if (fs.existsSync(catalogPath)) {
        catalogs[toPosix(book.catalogPath)] = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
      }
    }

    if (!book.contentRoot) {
      continue;
    }

    const bookRoot = path.join(repoRoot, book.contentRoot);
    if (!fs.existsSync(bookRoot)) {
      continue;
    }

    collectMarkdownFiles(bookRoot, documents);
  }

  const moduleSource = [
    `export const EMBEDDED_BOOKS = ${JSON.stringify(books, null, 2)};`,
    "",
    `export const EMBEDDED_CATALOGS = ${JSON.stringify(catalogs, null, 2)};`,
    "",
    `export const EMBEDDED_DOCUMENTS = ${JSON.stringify(documents, null, 2)};`,
    ""
  ].join("\n");

  fs.writeFileSync(path.join(outputRoot, "site", "prebuilt-data.js"), moduleSource, "utf8");
}

function collectMarkdownFiles(sourceDir, documents) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(sourcePath, documents);
      continue;
    }

    if (!entry.name.endsWith(".md")) {
      continue;
    }

    const key = toPosix(path.relative(repoRoot, sourcePath));
    documents[key] = fs.readFileSync(sourcePath, "utf8");
  }
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
