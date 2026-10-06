import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/scripts/fireworks-experience.ts", import.meta.url), "utf8");
const script = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

// Exercise the real initializer and cancellation logic without needing a browser
// launch. Browser tests separately cover CSS, viewport detection and interaction.
function experience({ narrow = false, touch = false, reduced = false } = {}) {
  const media = { narrow, touch, reduced };
  const queries = [];
  const frames = new Map();
  const timers = new Map();
  const resizeObservers = [];
  let id = 0;
  let contexts = 0;
  let burstTargets = 0;
  const context = { setTransform() {}, clearRect() {} };
  const canvas = () => ({ width: 0, height: 0, getContext() { contexts += 1; return context; }, getBoundingClientRect: () => ({ width: 1000, height: 900 }) });
  const sky = canvas();
  const flameCanvases = [];
  const hosts = [0, 1].map(() => ({ append: (element) => flameCanvases.push(element) }));
  let paused = true;
  const stage = {
    classList: { add() {} },
    style: { removeProperty() {} },
    toggleAttribute(_name, value) { paused = value; },
    querySelector: (selector) => selector === "[data-fw-sky]" ? sky : null,
    querySelectorAll: (selector) => selector === ".fw-torch__flames" ? hosts : [{ dataset: { fwBurst: "small" } }],
  };
  const matchMedia = (query) => {
    const listeners = [];
    const matches = () => query.includes("prefers-reduced-motion") ? media.reduced : query.includes("any-pointer") ? media.narrow || media.touch : media.narrow;
    const result = { get matches() { return matches(); }, addEventListener: (_event, listener) => listeners.push(listener) };
    queries.push({ matches, listeners });
    return result;
  };
  runInNewContext(script, {
    document: { hidden: false, querySelector: () => stage, createElement: canvas, addEventListener() {} },
    window: { setTimeout(callback) { const key = ++id; timers.set(key, callback); return key; }, clearTimeout: (key) => timers.delete(key) },
    matchMedia,
    devicePixelRatio: 3,
    requestAnimationFrame(callback) { const key = ++id; frames.set(key, callback); return key; },
    cancelAnimationFrame: (key) => frames.delete(key),
    ResizeObserver: class { constructor(callback) { resizeObservers.push(callback); } observe() {} },
    IntersectionObserver: class { observe() { burstTargets += 1; } disconnect() { burstTargets = 0; } },
  });
  return {
    sky,
    flameCanvases,
    get paused() { return paused; },
    get contexts() { return contexts; },
    get frames() { return frames.size; },
    get timers() { return timers.size; },
    get burstTargets() { return burstTargets; },
    change(next) {
      const previous = queries.map(({ matches }) => matches());
      Object.assign(media, next);
      queries.forEach(({ matches, listeners }, index) => {
        if (matches() !== previous[index]) listeners.forEach((listener) => listener());
      });
    },
    resize() { resizeObservers.forEach((callback) => callback()); },
    launchOpening() {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach((callback) => callback());
    },
  };
}

function assertIdle(view) {
  assert.equal(view.paused, true);
  assert.equal(view.frames, 0);
  assert.equal(view.timers, 0);
  assert.equal(view.burstTargets, 0);
  assert.equal(view.sky.width, 0);
  assert.equal(view.sky.height, 0);
}

test("narrow, touch-landscape and reduced-motion visits never initialise canvas work", () => {
  for (const settings of [{ narrow: true }, { touch: true }, { reduced: true }]) {
    const view = experience(settings);
    assertIdle(view);
    assert.equal(view.contexts, 0);
    assert.equal(view.flameCanvases.length, 0);
  }
});

test("touch devices stay idle through orientation and motion-preference changes", () => {
  const view = experience({ touch: true, narrow: true });
  for (const next of [{ narrow: false }, { reduced: true }, { reduced: false }, { narrow: true }]) {
    view.change(next);
    view.resize();
    view.launchOpening();
    assertIdle(view);
    assert.equal(view.contexts, 0);
  }
});

test("desktop-to-static transitions cancel both drawing loops, bursts and canvas allocation", () => {
  for (const next of [{ narrow: true }, { touch: true }, { reduced: true }]) {
    const view = experience();
    assert.equal(view.paused, false);
    assert.equal(view.contexts, 3);
    assert.equal(view.flameCanvases.length, 2);
    assert.equal(view.frames, 1);
    view.launchOpening();
    assert.equal(view.frames, 2);
    view.change(next);
    assertIdle(view);
    view.resize();
    assertIdle(view);
    view.change({ narrow: false, touch: false, reduced: false });
    assert.equal(view.paused, false);
    assert.equal(view.contexts, 3);
    assert.equal(view.flameCanvases.length, 2);
    assert.ok(view.sky.width > 0);
    assert.equal(view.frames, 1);
  }
});
