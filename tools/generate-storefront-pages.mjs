import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateStorefrontPages } from "./lib/storefront-renderer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputRoot = path.resolve(repoRoot, process.argv[2] || ".");

generateStorefrontPages({ repoRoot, outputRoot });
console.log(`Generated storefront pages in ${path.relative(repoRoot, outputRoot) || "."}`);
