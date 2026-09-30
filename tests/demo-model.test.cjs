const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  scenarios,
  transform,
  insight,
  initialPlan,
} = require("../dist/demo-model.js");

test("business totals are derived from transformed values", () => {
  const plan = { ...scenarios.business.defaults };
  assert.deepEqual(
    insight("business", plan).items.map((x) => x.value),
    [72080, 62160, 21940],
  );
  assert.equal(transform("business", plan).rows[0].client, "CLIENT-001");
  assert.equal(transform("business", plan).rows[3].client, "CLIENT-001");
});
test("same employee names do not merge identities", () => {
  const output = transform("people", scenarios.people.defaults);
  assert.equal(output.rows[0].name, "EMP-001");
  assert.equal(output.rows[3].name, "EMP-004");
  assert.equal("email" in output.rows[0], false);
  assert.deepEqual(
    insight("people", scenarios.people.defaults).items.map((x) => x.value),
    [(2 / 3) * 100, (1 / 3) * 100, 0],
  );
});
for (const [key, scenario] of Object.entries(scenarios)) {
  test(
    key + ": every allowed transformation behaves and never mutates source",
    () => {
      const before = JSON.stringify(scenario);
      for (const column of scenario.columns) {
        for (const method of column.methods) {
          const plan = { ...scenario.defaults, [column.key]: method };
          const output = transform(key, plan);
          if (method === "remove") {
            assert.equal(
              output.columns.some((c) => c.key === column.key),
              false,
            );
            assert.equal(column.key in output.rows[0], false);
          }
          if (method === "keep")
            assert.equal(
              output.rows[0][column.key],
              scenario.rows[0][column.key],
            );
          if (method === "mask")
            assert.equal(output.rows[0][column.key], "[ปิดบัง]");
          if (method === "generalize")
            assert.match(output.rows[0][column.key], /–/);
          assert.equal(
            insight(key, plan).available,
            !scenario.required.some(
              (c) =>
                plan[c] !== "keep" &&
                !(
                  ["category", "department"].includes(c) &&
                  plan[c] === "pseudonym"
                ),
            ),
          );
        }
      }
      assert.equal(JSON.stringify(scenario), before);
    },
  );
  test(key + ": removing every column leaves no hidden fields", () => {
    const plan = Object.fromEntries(
      scenario.columns.map((c) => [c.key, "remove"]),
    );
    assert.equal(transform(key, plan).columns.length, 0);
    assert.deepEqual(
      transform(key, plan).rows,
      scenario.rows.map(() => ({})),
    );
    assert.equal(insight(key, plan).available, false);
  });
}
test("invalid scenario and incompatible methods are rejected", () => {
  assert.throws(() => transform("bad", {}));
  assert.throws(() =>
    transform("business", {
      ...scenarios.business.defaults,
      client: "generalize",
    }),
  );
});
test("initial plans show all original values and each field supports codes", () => {
  for (const [key, scenario] of Object.entries(scenarios)) {
    const plan = initialPlan(key);
    assert.ok(Object.values(plan).every((x) => x === "keep"));
    assert.equal(transform(key, plan).columns.length, scenario.columns.length);
    for (const column of scenario.columns) {
      assert.ok(column.methods.includes("pseudonym"));
      const coded = transform(key, { ...plan, [column.key]: "pseudonym" });
      assert.match(coded.rows[0][column.key], /^[A-Z]+-001$/);
    }
  }
});
test("product codes follow products, not customers", () => {
  const output = transform("business", {
    ...initialPlan("business"),
    product: "pseudonym",
  });
  assert.equal(output.rows[0].product, "PRODUCT-001");
  assert.equal(output.rows[5].product, "PRODUCT-001");
  assert.notEqual(output.rows[0].product, output.rows[3].product);
});
test("coded grouping retains totals but coded measurements cannot be summed", () => {
  const plan = { ...initialPlan("business"), category: "pseudonym" };
  assert.deepEqual(
    insight("business", plan).items.map((x) => [x.name, x.value]),
    [
      ["GROUP-001", 72080],
      ["GROUP-002", 62160],
      ["GROUP-003", 21940],
    ],
  );
  assert.equal(
    insight("business", { ...plan, profit: "pseudonym" }).available,
    false,
  );
  const people = { ...initialPlan("people"), department: "pseudonym" };
  assert.equal(insight("people", people).items[0].name, "DEPT-001");
  assert.equal(
    insight("people", { ...people, status: "pseudonym" }).available,
    false,
  );
});
test("generalization has explicit, correct boundaries and units", () => {
  const plan = { ...scenarios.business.defaults, profit: "generalize" };
  assert.equal(transform("business", plan).rows[0].profit, "30,000–39,999 บาท");
  assert.equal(insight("business", plan).available, false);
  const people = { ...scenarios.people.defaults, tenure: "generalize" };
  assert.equal(transform("people", people).rows[0].tenure, "0–4 ปี");
  assert.equal(insight("people", people).available, true);
});

test("realistic business figures reconcile and gross profit is explicit", () => {
  assert.equal(scenarios.business.rows.length, 8);
  for (const row of scenarios.business.rows) {
    assert.equal(
      row.sales,
      Math.round(row.quantity * row.unitPrice * (1 - row.discount / 100)),
    );
    assert.equal(row.profit, row.sales - row.cost);
    assert.ok(row.product.length > 10);
  }
});
test("recommended plan removes pay and commercial calculation inputs", () => {
  const b = transform("business", scenarios.business.defaults);
  for (const key of ["quantity", "unitPrice", "discount", "sales", "cost"])
    assert.ok(!b.columns.some((c) => c.key === key));
  const p = transform("people", scenarios.people.defaults);
  for (const key of ["salary", "email", "position"])
    assert.ok(!p.columns.some((c) => c.key === key));
  assert.equal(scenarios.people.rows.length, 8);
  assert.ok(
    scenarios.people.rows.every((row) => row.email.endsWith("@example.com")),
  );
});
test("risk explanations only link to columns that exist", () => {
  for (const scenario of Object.values(scenarios)) {
    for (const risk of scenario.exposure) {
      assert.ok(
        risk.keys.every((key) =>
          scenario.columns.some((column) => column.key === key),
        ),
      );
    }
  }
});
