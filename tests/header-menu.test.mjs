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
  const windowListeners = new Map();
  const menu = {
    hidden: true,
    inert: true,
    classList: {
      toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
      contains: (name) => classes.has(name),
    },
    getBoundingClientRect() { return { width: 300, height: 500 }; },
    setAttribute() {},
    addEventListener() {},
  };
  const openButton = { setAttribute() {}, addEventListener() {}, focus: () => focus.push("open") };
  const closeButton = {
    addEventListener() {},
    getBoundingClientRect() {
      assert.equal(menu.hidden, false);
      assert.equal(menu.inert, false);
      assert.equal(classes.has("is-open"), true);
      return { width: 40, height: 40 };
    },
    focus: () => focus.push("close"),
  };
  const window = {
    addEventListener(type, listener) { windowListeners.set(type, listener); },
  };
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
    window,
    requestAnimationFrame: (callback) => frames.push(callback),
    getComputedStyle: () => ({ visibility: classes.has("is-open") ? "visible" : "hidden" }),
  });
  vm.runInContext(script, context);
  return {
    menu,
    focus,
    frames,
    setMenu: (open) => vm.runInContext(`setMenu(${open})`, context),
    dispatchWindow: (type) => windowListeners.get(type)?.(),
  };
}

test("menu reveals and renders the close button before focusing without a queued frame", () => {
  const { menu, focus, frames, setMenu } = harness();
  setMenu(true);
  assert.equal(menu.inert, false);
  assert.equal(menu.hidden, false);
  assert.equal(frames.length, 0);
  assert.deepEqual(focus, ["close"]);
});

test("closing hides and inerts the menu with no deferred focus to steal focus back", () => {
  const { menu, focus, frames, setMenu } = harness();
  setMenu(true);
  setMenu(false);
  assert.equal(menu.inert, true);
  assert.equal(menu.hidden, true);
  assert.equal(frames.length, 0);
  assert.deepEqual(focus, ["close", "open"]);
});

test("repeated menu opening and closing returns focus without queuing callbacks", () => {
  const { menu, focus, frames, setMenu } = harness();
  setMenu(true);
  setMenu(false);
  setMenu(true);
  setMenu(false);

  assert.equal(menu.inert, true);
  assert.equal(menu.hidden, true);
  assert.equal(frames.length, 0);
  assert.deepEqual(focus, ["close", "open", "close", "open"]);
});
