import { test } from "node:test";
import assert from "node:assert/strict";
import { isDocumentationPath, validateDocumentationPullRequest, enableDocumentationAutoMerge } from "../scripts/docs-auto-merge.mjs";

const sha = "a".repeat(40);
const pr = { state: "OPEN", isDraft: false, isCrossRepository: false, baseRefName: "main", headRefOid: sha, changedFiles: 1 };
const files = [{ filename: "docs/ACTIONS.md", status: "modified" }];

test("only ordinary documentation Markdown paths qualify", () => {
  for (const path of ["README.md", "docs/ACTIONS.md", "docs/nested/guide.md"]) assert.equal(isDocumentationPath(path), true, path);
  for (const path of ["AGENTS.md", "docs/AGENTS.md", "docs/nested/agents.md", "src/pages/index.astro", ".github/workflows/deploy.yml", "docs/image.svg", "docs/../package.json", "docs//guide.md", "docs/./guide.md", "docs\\guide.md", "docs/guide.md\n", "readme.md", null]) {
    assert.equal(isDocumentationPath(path), false, String(path));
  }
});

test("checks both sides of renames and rejects incomplete file lists", () => {
  assert.equal(validateDocumentationPullRequest(pr, files), sha);
  assert.equal(validateDocumentationPullRequest(pr, [{ filename: "docs/new.md", previous_filename: "docs/old.md", status: "renamed" }]), sha);
  for (const entries of [[], [{ filename: "docs/new.md", status: "renamed" }], [{ filename: "docs/new.md", previous_filename: "src/code.mjs", status: "renamed" }], [{ filename: "src/code.mjs", previous_filename: "docs/old.md", status: "renamed" }], [{ filename: "docs/new.md", status: "unknown" }]]) {
    assert.throws(() => validateDocumentationPullRequest(pr, entries));
  }
});

test("rejects draft, fork, closed, wrong-base and invalid metadata", () => {
  for (const change of [{ state: "MERGED" }, { isDraft: true }, { isDraft: undefined }, { isCrossRepository: true }, { isCrossRepository: undefined }, { baseRefName: "other" }, { headRefOid: "invalid" }, { changedFiles: 0 }, { changedFiles: 3001 }, { changedFiles: undefined }]) {
    assert.throws(() => validateDocumentationPullRequest({ ...pr, ...change }, files));
  }
});

test("uses native auto-merge with an exact head guard and no administrator bypass", () => {
  const calls = [];
  const replies = [pr, [files], pr];
  enableDocumentationAutoMerge(18, (args) => {
    calls.push(args);
    return replies.length ? JSON.stringify(replies.shift()) : "Auto-merge enabled";
  });
  assert.deepEqual(calls.at(-1), ["pr", "merge", "18", "--repo", "nicholascaplan/foa-website", "--auto", "--squash", "--match-head-commit", sha]);
});

test("never requests a merge when files or the head change during validation", () => {
  for (const replies of [[pr, [[{ filename: "src/code.mjs", status: "modified" }]]], [pr, [files], { ...pr, headRefOid: "b".repeat(40) }]]) {
    const calls = [];
    assert.throws(() => enableDocumentationAutoMerge(18, (args) => {
      calls.push(args);
      return JSON.stringify(replies.shift());
    }));
    assert.equal(calls.some((args) => args[0] === "pr" && args[1] === "merge"), false);
  }
  assert.throws(() => enableDocumentationAutoMerge("--admin"));
});
