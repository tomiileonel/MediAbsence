import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function run(command, args, timeoutMs = 30_000) {
  try {
    execFileSync(command, args, {
      stdio: "ignore",
      cwd: repoRoot,
      timeout: timeoutMs,
      shell: true,
    });
    return true;
  } catch {
    return false;
  }
}

const checks = [];
checks.push(["git-diff", run("git", ["diff", "--check"])]);

if (existsSync(join(repoRoot, "package.json"))) {
  checks.push(["typecheck", run("npm", ["run", "typecheck"])]);
  checks.push(["lint", run("npm", ["run", "lint"])]);
  checks.push(["unit-tests", run("npm", ["run", "test"])]);
}

const failed = checks.filter(([, ok]) => !ok);

if (failed.length === 0) {
  console.log(JSON.stringify({ decision: "allow", reason: "Stop gate passed." }));
  process.exit(0);
}

console.log(
  JSON.stringify({
    decision: "block",
    reason: "Stop gate found failed local verification checks.",
    failed: failed.map(([name]) => name),
  }),
);
process.exit(2);
