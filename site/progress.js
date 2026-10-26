// Backlog and Complete Tasks: legends, platform filter and sortable overview, shared by the private pages in .handoffs/

// ── Sets of buttons and labels, in order. The pages hold only empty containers; one element per entry is made here ──
// Legend chips by key: [kind of chip, label]. Each page's .legend names its keys in data-chips; "|" is a separator
const CHIPS = {
  critical: ["chip", "Critical"], important: ["chip", "Important"], less: ["chip", "Less critical"], token: ["chip", "Token"],
  open: ["chip", "Open"], decision: ["chip", "Needs your decision"], draft: ["chip", "Draft"], done: ["chip", "Done"],
  parked: ["chip", "Parked"], suggested: ["chip", "AI suggestion"],
  desktop: ["plat", "Desktop"], mobile: ["plat", "Mobile"], everywhere: ["plat", "Everywhere"],
  change: ["kind", "Change"], test: ["kind", "Test"], design: ["kind", "Design"],
};
// Platform filter buttons: [value, label]
const FILTERS = [["all", "All"], ["desktop", "Desktop"], ["mobile", "Mobile"], ["everywhere", "Everywhere"]];
// Overview columns: [sort key, header]. How each key sorts is in key, further down
const COLUMNS = [["n", "#"], ["item", "Item"], ["rank", "Rank"], ["platform", "Platform"], ["kind", "Kind"],
  ["status", "Status"], ["created", "Created"]];

const make = (tag, cls, text) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, text ? { textContent: text } : {});
function chipFor(key) {
  if (key === "|") return make("span", "sep");
  const [type, label] = CHIPS[key];
  if (type === "kind") return make("span", "kind", label);
  const span = make("span", `${type} ${key}`);
  if (type === "plat") span.innerHTML = `<svg><use href="#i-${key}"/></svg>`;
  span.append(label);
  return span;
}
document.querySelectorAll(".legend[data-chips]").forEach(l => l.append(...l.dataset.chips.split(" ").map(chipFor)));
document.querySelector(".filter").append(...FILTERS.map(([value, label]) => {
  const b = make("button", "", label);
  b.type = "button";
  b.dataset.show = value;
  b.setAttribute("aria-pressed", value === "all");
  return b;
}));
const headRow = document.querySelector(".scroll table").insertRow(0);
headRow.append(...COLUMNS.map(([key, label]) => { const th = make("th", "", label); th.dataset.sort = key; return th; }));

// Platform filter: shows matching items and overview rows; hides a tier heading when none of its items remain
const buttons = document.querySelectorAll(".filter button");
function show(p) {
  buttons.forEach(b => b.setAttribute("aria-pressed", b.dataset.show === p));
  document.querySelectorAll("[data-platform]").forEach(el => el.hidden = p !== "all" && el.dataset.platform !== p);
  document.querySelectorAll("main > h2:not(:first-of-type)").forEach(h => {
    let el = h.nextElementSibling, any = false;
    for (; el && el.tagName !== "H2"; el = el.nextElementSibling) if (el.matches("article") && !el.hidden) any = true;
    h.hidden = !any;
  });
}
buttons.forEach(b => b.addEventListener("click", () => show(b.dataset.show)));

// Sortable overview. Each header names how its column sorts; ties keep the page's own order
const ORDER = {
  rank: ["critical", "important", "less", "token"],
  status: ["decision", "open", "draft", "done", "parked"],
  platform: ["desktop", "mobile", "everywhere"],
};
const table = document.querySelector(".scroll table");

// Parked items stay in their rank's place; each Parked chip takes its item's rank colour
document.querySelectorAll(".chip.parked").forEach(c => {
  const tier = c.closest("article")?.dataset.tier ?? ORDER.rank.find(t => c.closest("tr")?.querySelector(`.chip.${t}`));
  if (tier) c.classList.add(tier);
});
const head = table.rows[0];
const rows = [...table.rows].slice(1);
rows.forEach((r, i) => r.dataset.order = i);
const chip = (r, col, list) => list.findIndex(c => r.cells[col].querySelector(`.${c}`));
const key = {
  n:        r => { const t = r.cells[0].textContent; return t.startsWith("L") ? -1000 + +t.slice(1) : +t; },
  item:     r => r.cells[1].textContent.trim().toLowerCase(),
  rank:     r => chip(r, 2, ORDER.rank),
  platform: r => ORDER.platform.indexOf(r.dataset.platform),
  kind:     r => r.cells[4].textContent.trim().toLowerCase(),
  status:   r => chip(r, 5, ORDER.status),
  created:  r => r.dataset.created,
};
function sortBy(th) {
  const dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
  head.querySelectorAll("th").forEach(h => h.removeAttribute("aria-sort"));
  th.setAttribute("aria-sort", dir);
  const k = key[th.dataset.sort], sign = dir === "ascending" ? 1 : -1;
  rows.sort((a, b) => {
    const x = k(a), y = k(b);
    return sign * (x < y ? -1 : x > y ? 1 : 0) || a.dataset.order - b.dataset.order;
  });
  rows.forEach(r => r.parentNode.append(r));
}
head.querySelectorAll("th[data-sort]").forEach(th => {
  th.tabIndex = 0;
  th.addEventListener("click", () => sortBy(th));
  th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortBy(th); } });
});
