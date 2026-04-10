import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const homeDir = os.homedir();
const configPath = path.join(homeDir, ".cloudflared", "config.yml");
const hostname = "bookshelf.doublejun.digital";
const service = "http://127.0.0.1:18081";
const dryRun = process.argv.includes("--dry-run");

if (!fs.existsSync(configPath)) {
  console.error(`cloudflared config not found: ${configPath}`);
  process.exit(1);
}

const original = fs.readFileSync(configPath, "utf8");

const existingRulePattern = new RegExp(`(\\s*- hostname: ${escapeRegExp(hostname)}\\n\\s*service: )(.+)(\\n)`);

if (existingRulePattern.test(original)) {
  const next = original.replace(existingRulePattern, `$1${service}$3`);

  if (dryRun) {
    process.stdout.write(next);
    process.exit(0);
  }

  fs.writeFileSync(configPath, next, "utf8");
  console.log(`Updated ingress for ${hostname} -> ${service}`);
  process.exit(0);
}

const insertion = `  - hostname: ${hostname}\n    service: ${service}\n`;
let next = original;

if (original.includes("  - service: http_status:404")) {
  next = original.replace("  - service: http_status:404", `${insertion}  - service: http_status:404`);
} else if (/\ningress:\s*\n/.test(original)) {
  next = `${original.trimEnd()}\n${insertion}`;
} else {
  next = `${original.trimEnd()}\n\ningress:\n${insertion}`;
}

if (dryRun) {
  process.stdout.write(next);
  process.exit(0);
}

fs.writeFileSync(configPath, next, "utf8");
console.log(`Added ingress for ${hostname} -> ${service}`);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
