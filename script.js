/* UI state is ephemeral; reloading starts a fresh synthetic demo. */
"use strict";
const $ = (selector) => document.querySelector(selector);
const menuButton = $(".menu-button");
const menu = $("#site-nav");
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "เปิดเมนู");
  menu.classList.remove("open");
}
menuButton.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.setAttribute("aria-label", opening ? "ปิดเมนู" : "เปิดเมนู");
  menu.classList.toggle("open", opening);
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);
$("#year").textContent = new Date().getFullYear();

const { scenarios, methods, transform, insight, format, initialPlan } =
  window.SafeDemo;
let current = "business";
let selected = "client";
let exposedColumns = [];
let exposureIndex = -1;
const plans = Object.fromEntries(
  Object.entries(scenarios).map(([key, scenario]) => [key, initialPlan(key)]),
);
const history = { business: [], people: [] };
function remember() {
  history[current].push({ ...plans[current] });
}
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function setMobileView(view) {
  $(".comparison").dataset.mobileView = view;
  $(".before-panel").hidden = view !== "before";
  $(".after-panel").hidden = view !== "after";
  document
    .querySelectorAll("[data-view]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.view === view)),
    );
}
document
  .querySelectorAll("[data-view]")
  .forEach((button) =>
    button.addEventListener("click", () => setMobileView(button.dataset.view)),
  );
function renderTable(target, columns, rows, after) {
  const host = $(target),
    scroll = host.scrollLeft,
    top = host.scrollTop;
  host.replaceChildren();
  if (!columns.length) {
    host.append(
      el(
        "p",
        "ตัดทุกคอลัมน์แล้ว ไม่มีข้อมูลเหลือสำหรับวิเคราะห์ ลองเก็บคอลัมน์ที่จำเป็นหรือกดเริ่มใหม่",
        "empty-table",
      ),
    );
    return;
  }
  const table = el("table");
  table.append(
    el(
      "caption",
      (after ? "ข้อมูลหลังเตรียม: " : "ข้อมูลต้นฉบับ: ") +
        scenarios[current].label,
      "sr-only",
    ),
  );
  const head = el("thead"),
    headRow = el("tr"),
    body = el("tbody");
  for (const column of columns) {
    const th = el("th");
    th.scope = "col";
    if (column.key === selected) th.classList.add("selected-cell");
    if (!after && exposedColumns.includes(column.key))
      th.classList.add("risk-cell");
    const button = el("button", column.label);
    button.type = "button";
    button.setAttribute("aria-label", "เลือกคอลัมน์ " + column.label);
    button.addEventListener("click", () => {
      selected = column.key;
      render();
      $("#method-buttons [aria-pressed='true']").focus();
    });
    th.append(button);
    headRow.append(th);
  }
  head.append(headRow);
  rows.forEach((row) => {
    const tr = el("tr");
    columns.forEach((column) => {
      const td = el("td", format(row[column.key]));
      if (column.key === selected) td.classList.add("selected-cell");
      if (!after && exposedColumns.includes(column.key))
        td.classList.add("risk-cell");
      if (after && plans[current][column.key] !== "keep")
        td.classList.add("changed");
      tr.append(td);
    });
    body.append(tr);
  });
  table.append(head, body);
  host.append(table);
  host.scrollLeft = scroll;
  host.scrollTop = top;
}
function renderExposure() {
  const scenario = scenarios[current];
  $("#demo-filename").textContent = scenario.filename;
  $("#demo-file-note").textContent = scenario.fileNote;
  const list = $("#exposure-list");
  list.replaceChildren();
  scenario.exposure.forEach((item, index) => {
    const li = el("li"),
      title = el("h4", item.title),
      body = el("p", item.detail),
      button = el("button", "ดูคอลัมน์ที่เกี่ยวข้อง ↗", "exposure-button");
    button.type = "button";
    button.setAttribute("aria-pressed", String(exposureIndex === index));
    button.addEventListener("click", () => {
      exposureIndex = index;
      exposedColumns = item.keys;
      setMobileView("before");
      renderTable("#before-table", scenario.columns, scenario.rows, false);
      list
        .querySelectorAll("button")
        .forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
      $("#exposure-status").textContent =
        "เน้นคอลัมน์ในตารางต้นฉบับ: " +
        item.keys
          .map((key) => scenario.columns.find((c) => c.key === key).label)
          .join(" · ") +
        " — ยังไม่ได้เปลี่ยนข้อมูล";
    });
    li.append(title, body, button);
    list.append(li);
  });
}
$("#exposure-story").addEventListener("toggle", () => {
  if (!$("#exposure-story").open) {
    exposedColumns = [];
    exposureIndex = -1;
    $("#exposure-status").textContent = "";
    renderExposure();
    renderTable(
      "#before-table",
      scenarios[current].columns,
      scenarios[current].rows,
      false,
    );
  }
});
function renderInsight() {
  const result = insight(current, plans[current]),
    box = $(".insight-box"),
    chart = $("#insight-chart");
  chart.replaceChildren();
  box.classList.toggle("is-limited", !result.available);
  if (!result.available) {
    $("#insight-title").textContent = "ข้อมูลที่เหลือยังตอบคำถามนี้ไม่ได้";
    $("#insight-description").textContent =
      "ต้องใช้ข้อมูลเดิมในคอลัมน์ " +
      result.missing.join(" และ ") +
      " เพื่อคำนวณให้ได้ตัวเลขที่ถูกต้อง ลองเลือกเก็บข้อมูลเดิม หรือเปลี่ยนคำถามให้เหมาะกับข้อมูลที่เหลือ";
    chart.append(
      el(
        "p",
        "ไม่มีกราฟ เพราะข้อมูลที่จำเป็นถูกเปลี่ยนหรือตัดออก",
        "chart-note",
      ),
    );
    return;
  }
  $("#insight-title").textContent =
    current === "business"
      ? "ยังเปรียบเทียบกำไรแต่ละกลุ่มสินค้าได้"
      : "ยังดูสัดส่วนการลาออกตามแผนกได้";
  $("#insight-description").textContent =
    current === "business"
      ? "กราฟใช้กลุ่มสินค้าและกำไรขั้นต้นจากตารางหลังปรับ ไม่ต้องใช้ชื่อลูกค้า แต่ยังเห็นกำไรต่อรายการ จึงต้องตรวจว่าเปิดเผยรายละเอียดระดับนี้ได้หรือไม่"
      : "กราฟใช้เพียงแผนกและสถานะจากตารางหลังปรับ ไม่ต้องใช้ชื่อหรือเงินเดือน ข้อมูลสมมติมีจำนวนน้อย ใช้อธิบายวิธีทำงาน ไม่ใช่สรุปแนวโน้มจริง";
  const maximum =
    current === "business"
      ? Math.max(...result.items.map((item) => item.value), 1)
      : 100;
  result.items.forEach((item) => {
    const row = el("div", undefined, "chart-row");
    const track = el("div", undefined, "chart-track"),
      bar = el("div", undefined, "chart-bar");
    bar.style.width = (item.value / maximum) * 100 + "%";
    track.setAttribute("aria-hidden", "true");
    track.append(bar);
    const value =
      current === "business"
        ? format(item.value) + " ฿"
        : format(Math.round(item.value * 10) / 10) + "%";
    row.append(el("span", item.name), track, el("span", value, "chart-value"));
    chart.append(row);
  });
  chart.append(
    el(
      "p",
      current === "business"
        ? "รวมกำไรขั้นต้นจาก " + scenarios[current].rows.length + " รายการสมมติ"
        : result.items
            .map(
              (item) =>
                item.name +
                ": ลาออก " +
                item.left +
                " จาก " +
                item.count +
                " คน",
            )
            .join(" · "),
      "chart-note",
    ),
  );
}
function render() {
  const scenario = scenarios[current],
    plan = plans[current];
  $("#demo-question").textContent = scenario.question;
  const picker = $("#column-buttons");
  picker.replaceChildren();
  scenario.columns.forEach((column) => {
    const button = el("button", column.label);
    button.type = "button";
    button.dataset.column = column.key;
    button.setAttribute("aria-pressed", String(column.key === selected));
    button.append(el("small", methods[plan[column.key]].label));
    button.addEventListener("click", () => {
      selected = column.key;
      render();
      // Rebuilding the picker must not lose keyboard focus.
      document
        .querySelector('[data-column="' + selected + '"]')
        .focus({ preventScroll: true });
    });
    picker.append(button);
  });
  const column = scenario.columns.find((item) => item.key === selected);
  $("#selected-column").textContent = column.label;
  $("#column-context").textContent = column.context;
  const choices = $("#method-buttons");
  choices.replaceChildren(
    ...column.methods.map((key) => {
      const button = el("button", methods[key].label);
      button.type = "button";
      button.dataset.method = key;
      button.setAttribute("aria-pressed", String(plan[selected] === key));
      button.addEventListener("click", () => {
        if (plans[current][selected] !== key) {
          remember();
          plans[current][selected] = key;
        }
        setMobileView("after");
        render();
        document
          .querySelector('[data-method="' + key + '"]')
          .focus({ preventScroll: true });
        if (!reducedMotion.matches && $("#field-preview").animate) {
          $("#field-preview").animate([{ opacity: 0.4 }, { opacity: 1 }], {
            duration: 240,
          });
        }
      });
      return button;
    }),
  );
  $("#method-description").textContent = methods[plan[selected]].description;
  const output = transform(current, plan);
  renderFieldPreview(column, output);
  const removedHost = $("#removed-columns");
  removedHost.replaceChildren();
  scenario.columns
    .filter((c) => plan[c.key] === "remove")
    .forEach((c) => {
      const button = el("button", "คืนคอลัมน์: " + c.label);
      button.type = "button";
      button.addEventListener("click", () => {
        remember();
        plans[current][c.key] = "keep";
        selected = c.key;
        setMobileView("after");
        render();
        $("#method-buttons [aria-pressed='true']").focus();
      });
      removedHost.append(button);
    });
  $("#undo-demo").disabled = !history[current].length;
  renderTable("#before-table", scenario.columns, scenario.rows, false);
  renderTable("#after-table", output.columns, output.rows, true);
  renderInsight();
  const changed = scenario.columns.filter(
    (item) => plan[item.key] !== "keep",
  ).length;
  const removed = scenario.columns.filter(
    (item) => plan[item.key] === "remove",
  ).length;
  $("#change-summary").textContent =
    "ปรับแล้ว " +
    changed +
    " จาก " +
    scenario.columns.length +
    " คอลัมน์ · ตัดออก " +
    removed +
    " คอลัมน์ · ยังต้องตรวจทานก่อนใช้จริง";
}
function renderFieldPreview(column, output) {
  const host = $("#field-preview"),
    method = plans[current][selected];
  host.replaceChildren();
  const heading = el("div", undefined, "preview-head");
  heading.append(el("span", "ต้นฉบับ"), el("span", "หลังปรับ"));
  host.append(heading);
  scenarios[current].rows.slice(0, 3).forEach((row, i) => {
    const pair = el("div", undefined, "preview-pair");
    pair.append(
      el("span", format(row[selected])),
      el("span", "→", "preview-arrow"),
      el(
        "strong",
        method === "remove"
          ? "ตัดออกจากผลลัพธ์"
          : format(output.rows[i][selected]),
      ),
    );
    host.append(pair);
  });
  let feedback =
    method === "keep"
      ? "ยังเป็นข้อมูลเดิม ลองเลือกวิธีด้านบนเพื่อดูความเปลี่ยนแปลง"
      : column.label + ": " + methods[method].label + "แล้ว";
  if (method === "pseudonym") {
    feedback = column.identity
      ? "ใช้รหัสต้นทางแยกแต่ละคนหรือลูกค้า แม้ชื่อเหมือนกันก็ไม่รวมเป็นรายเดียว"
      : column.band
        ? "ตัวเลขถูกแทนด้วยรหัสแล้ว จึงใช้บวกยอดหรือหาค่าเฉลี่ยไม่ได้"
        : "ค่าเดิมที่ซ้ำกันได้รหัสเดียวกัน จึงยังแยกกลุ่มได้โดยไม่แสดงชื่อเดิม";
  }
  $("#field-feedback").textContent = feedback;
  $(".instant-preview").dataset.changed = String(method !== "keep");
}
function chooseScenario(key) {
  if (!scenarios[key]) return;
  current = key;
  exposedColumns = [];
  exposureIndex = -1;
  $("#exposure-status").textContent = "";
  renderExposure();
  selected = scenarios[key].columns[0].key;
  document.querySelectorAll("[data-scenario]").forEach((button) => {
    const active = button.dataset.scenario === key;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  $("#demo-panel").setAttribute("aria-labelledby", "tab-" + key);
  setMobileView("after");
  render();
}
document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", () =>
    chooseScenario(button.dataset.scenario),
  );
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const key =
      event.key === "Home"
        ? "business"
        : event.key === "End"
          ? "people"
          : current === "business"
            ? "people"
            : "business";
    chooseScenario(key);
    $("#tab-" + key).focus();
  });
});
document
  .querySelectorAll("[data-scenario-link]")
  .forEach((link) =>
    link.addEventListener("click", () =>
      chooseScenario(link.dataset.scenarioLink),
    ),
  );
$("#recommend-demo").addEventListener("click", () => {
  remember();
  plans[current] = { ...scenarios[current].defaults };
  setMobileView("after");
  render();
  $("#change-summary").textContent =
    "ใช้วิธีแนะนำแล้ว · " + $("#change-summary").textContent;
});
$("#undo-demo").addEventListener("click", () => {
  if (!history[current].length) return;
  plans[current] = history[current].pop();
  setMobileView("after");
  render();
  if ($("#undo-demo").disabled)
    $("#recommend-demo").focus({ preventScroll: true });
});
$("#reset-demo").addEventListener("click", () => {
  remember();
  plans[current] = initialPlan(current);
  exposedColumns = [];
  exposureIndex = -1;
  $("#exposure-status").textContent = "";
  renderExposure();
  selected = scenarios[current].columns[0].key;
  setMobileView("after");
  render();
  $("#change-summary").textContent =
    "เริ่มใหม่แล้ว ทุกคอลัมน์กลับเป็นข้อมูลต้นฉบับของ" +
    scenarios[current].label;
});
renderExposure();
setMobileView("after");
render();
$("#interactive-demo").hidden = false;
