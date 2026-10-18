import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const repository = "nicholascaplan/foa-website";

export function isDocumentationPath(path) {
  if (typeof path !== "string" || /[\\\x00-\x1f\x7f]/.test(path)) return false;
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) return false;
  if (parts.at(-1).toLowerCase() === "agents.md") return false;
  return path === "README.md" || (path.startsWith("docs/") && path.endsWith(".md"));
}

export function validateDocumentationPullRequest(pr, files) {
  if (pr.state !== "OPEN" || pr.isDraft !== false || pr.isCrossRepository !== false || pr.baseRefName !== "main") {
    throw new Error("Only open, non-draft, same-repository PRs targeting main are eligible.");
  }
  if (!/^[a-f0-9]{40}$/.test(pr.headRefOid)) throw new Error("Missing valid head commit.");
  if (!Number.isInteger(pr.changedFiles) || pr.changedFiles < 1 || pr.changedFiles > 3000 || files.length !== pr.changedFiles) {
    throw new Error("Incomplete or empty changed-file list; refusing auto-merge.");
  }
  const statuses = new Set(["added", "modified", "removed", "renamed", "copied", "changed", "unchanged"]);
  for (const file of files) {
    if (!statuses.has(file.status) || !isDocumentationPath(file.filename)
      || ((file.status === "renamed" || file.status === "copied") && !file.previous_filename)
      || (file.previous_filename && !isDocumentationPath(file.previous_filename))) {
      throw new Error(`Not documentation-only: ${file.filename}`);
    }
  }
  return pr.headRefOid;
}

export function enableDocumentationAutoMerge(number, gh = (args) => execFileSync("gh", args, { encoding: "utf8" })) {
  if (!/^[1-9]\d*$/.test(String(number))) throw new Error("Usage: node scripts/docs-auto-merge.mjs <PR number>");
  const fields = "state,isDraft,isCrossRepository,baseRefName,headRefOid,changedFiles";
  const readPR = () => JSON.parse(gh(["pr", "view", String(number), "--repo", repository, "--json", fields]));
  const pr = readPR();
  const pages = JSON.parse(gh(["api", `repos/${repository}/pulls/${number}/files?per_page=100`, "--paginate", "--slurp"]));
  const sha = validateDocumentationPullRequest(pr, pages.flat());
  const latest = readPR();
  if (latest.headRefOid !== sha || latest.changedFiles !== pr.changedFiles) throw new Error("PR changed during validation; retry.");
  validateDocumentationPullRequest(latest, pages.flat());
  return gh(["pr", "merge", String(number), "--repo", repository, "--auto", "--squash", "--match-head-commit", sha]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(enableDocumentationAutoMerge(process.argv[2]));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
