const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../dist/entry.js"), "utf8");

function entry(hash) {
  const calls = [], listeners = {};
  const window = {
    location: { hash, pathname: "/", search: "?campaign=demo" },
    history: { state: { existing: true }, scrollRestoration: "auto",
      replaceState(...args) { calls.push(["replace", ...args]); } },
    scrollTo(options) { calls.push(["scroll", options]); },
    addEventListener(name, handler, options) { listeners[name] = { handler, options }; },
  };
  vm.runInNewContext(source, { window });
  return { window, calls, listeners };
}
test("fresh legacy section links start at the hero without losing query or history state", () => {
  for (const hash of ["#demo", "#contact", "#safe-package"]) {
    const result = entry(hash);
    assert.equal(result.window.history.scrollRestoration, "manual");
    assert.equal(result.calls[0][3], "/?campaign=demo");
    assert.equal(result.calls[0][1].existing, true);
    result.listeners.pageshow.handler({ persisted: false });
    assert.equal(result.calls[1][1].top, 0);
    assert.equal(result.calls[1][1].behavior, "instant");
    assert.equal(result.listeners.pageshow.options.once, true);
  }
});
test("plain homepage does not rewrite its address", () => {
  assert.equal(entry("").calls.length, 0);
});
test("restoring a page from back-forward cache does not force the user to the top", () => {
  const result = entry("");
  result.listeners.pageshow.handler({ persisted: true });
  assert.equal(result.calls.length, 0);
});
