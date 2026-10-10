import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/components/Header.astro", import.meta.url), "utf8");
const script = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)[1], {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;

function harness() {
  const frames = [];
  const classes = new Set();
  const focus = [];
  const menu = {
    inert: true,
    classList: {
      toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
      contains: (name) => classes.has(name),
    },
    setAttribute() {},
    addEventListener() {},
  };
  const openButton = { setAttribute() {}, addEventListener() {}, focus: () => focus.push("open") };
  const closeButton = { addEventListener() {}, focus: () => focus.push("close") };
  const document = {
    querySelector: (selector) => ({
      "[data-mobile-menu]": menu,
      "[data-menu-toggle]": openButton,
      "[data-menu-close]": closeButton,
    })[selector] ?? null,
    body: { classList: { toggle() {} } },
    addEventListener() {},
  };
  const context = vm.createContext({
    document,
    window: {},
    requestAnimationFrame: (callback) => frames.push(callback),
    getComputedStyle: () => ({ visibility: classes.has("is-open") ? "visible" : "hidden" }),
  });
  vm.runInContext(script, context);
  return { menu, focus, frames, setMenu: (open) => vm.runInContext(`setMenu(${open})`, context) };
}

test("menu focus waits for a render frame after the panel is revealed", () => {
  const { menu, focus, frames, setMenu } = harness();
  setMenu(true);
  assert.equal(menu.inert, false);
  assert.deepEqual(focus, []);
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.deepEqual(focus, ["close"]);
});

test("closing before the queued frame prevents focus returning to the hidden panel", () => {
  const { menu, focus, frames, setMenu } = harness();
  setMenu(true);
  setMenu(false);
  assert.equal(menu.inert, true);
  frames.shift()();
  assert.deepEqual(focus, ["open"]);
});
