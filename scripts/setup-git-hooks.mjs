import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const gitDir = resolve(repoRoot, ".git");
const hooksDir = resolve(repoRoot, ".githooks");

if (!existsSync(gitDir) || !existsSync(hooksDir)) {
  process.exit(0);
}

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
} catch {
  process.exit(0);
}
