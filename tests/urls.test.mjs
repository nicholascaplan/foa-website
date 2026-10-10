import assert from "node:assert/strict";
import test from "node:test";
import { joinBase } from "../src/lib/urls.ts";

test("paths are unchanged when the site is served from the domain root", () => {
  assert.equal(joinBase("/", "/whats-on/"), "/whats-on/");
  assert.equal(joinBase("/", "/assets/logo.png"), "/assets/logo.png");
});

test("paths are prefixed when the site is served from a sub-path", () => {
  assert.equal(joinBase("/foa-website/", "/whats-on/"), "/foa-website/whats-on/");
  assert.equal(joinBase("/foa-website", "/whats-on/"), "/foa-website/whats-on/");
});

test("the home route resolves to a valid URL at the root and at a sub-path", () => {
  assert.equal(joinBase("/", "/"), "/");
  assert.equal(joinBase("/foa-website/", "/"), "/foa-website/");
});

test("an empty path at the root still resolves to the root", () => {
  assert.equal(joinBase("/", ""), "/");
});

test("exactly one slash separates the base and the path", () => {
  assert.doesNotMatch(joinBase("/foa-website/", "/events/"), /\/\//);
});
