import assert from "node:assert/strict";
import test from "node:test";
import { renderInline } from "../src/lib/inline.ts";

test("HTML in content is escaped", () => {
  const html = renderInline(`<script>alert("x")</script> & more`);
  assert.doesNotMatch(html, /<script/);
  assert.equal(html, "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; more");
});

test("external links open safely in a new tab and announce it", () => {
  const html = renderInline("[Donate](https://example.org/give)");
  assert.match(html, /href="https:\/\/example\.org\/give"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /\(opens in a new tab\)/);
  assert.match(html, />Donate<span class="external-link-icon" aria-hidden="true">/);
});

test("mailto links are plain links", () => {
  const html = renderInline("[Email us](mailto:hello@example.org)");
  assert.match(html, /href="mailto:hello@example\.org"/);
  assert.doesNotMatch(html, /target=/);
});

test("only http, https and mailto links are linkified", () => {
  for (const href of ["javascript:alert(1)", "data:text/html,x", "/relative", "ftp://example.org"]) {
    const html = renderInline(`[x](${href})`);
    assert.doesNotMatch(html, /<a /, href);
  }
});

test("a quote in a link target cannot break out of the attribute", () => {
  const html = renderInline(`[x](https://example.org/"onmouseover="alert(1))`);
  assert.doesNotMatch(html, /onmouseover="/);
});

test("bold and italic are rendered, including inside link text", () => {
  assert.equal(renderInline("**bold** and *italic*"), "<strong>bold</strong> and <em>italic</em>");
  assert.match(renderInline("[**Go**](https://example.org)"), /<strong>Go<\/strong>/);
});

test("plain text is unchanged", () => {
  assert.equal(renderInline("Doors open at 3:25pm."), "Doors open at 3:25pm.");
});
