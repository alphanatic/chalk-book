/* Chalk Book site — search + notes menu (left), recently viewed (right), roadmap, viewer and Save as PDF.
   No build step, no libraries. */

// <chalk-wordmark></chalk-wordmark>: the site's name, written once and used wherever it appears
customElements.define("chalk-wordmark", class extends HTMLElement {
  connectedCallback() {
    if (!this.childElementCount) this.innerHTML = '<span class="chalk">Chalk</span> <span class="book">Book</span>';
    this.setAttribute("aria-label", "Chalk Book");
  }
});

(() => {
  const $ = id => document.getElementById(id);
  const menuList = $("menu-list"), menuFoot = $("menu-foot"), findList = $("find-list"),
        recentList = $("recent-list"), recentFoot = $("recent-foot"), search = $("search"),
        frame = $("frame"), home = $("home"), current = $("current"), menuBtn = $("menu-btn"),
        exportBtn = $("export-btn"), exportMenu = $("export-menu");
  const projects = { ...window.CHALK_PROJECTS };
  const notes = window.CHALK_NOTES.map(n => ({ ...n, file: `notes/${n.id}.html` }));
  const narrow = matchMedia("(max-width: 760px)");
  const text = window.CHALK_TEXT || {};     // plain text of each note, from site/build-index.mjs
  const MIN_QUERY = 2;
  const HISTORY_KEY = "chalk.history", HISTORY_MAX = 10;

  // ?filler=40 adds placeholder notes, to test how the panels behave when full
  const filler = Number(new URLSearchParams(location.search).get("filler")) || 0;
  if (filler) {
    projects.filler = { name: "Test filler", color: "peach" };
    for (let i = 1; i <= filler; i++)
      notes.push({ id: `filler-${i}`, project: "filler", n: i, title: `Placeholder note ${i}`,
        summary: "Test entry for panel scrolling.", skills: [], file: "" });
  }

  // What search looks at, lowercased once: the note's full text, plus its catalogue details
  const moduleTitle = n => projects[n.project]?.modules?.find(m => m.n === n.module)?.title;
  for (const n of notes) {
    n.body = (text[n.id] || "").toLowerCase();
    n.meta = [n.title, n.summary, n.date, projects[n.project]?.name, n.module && `module ${n.module}`,
      moduleTitle(n), ...(n.skills || [])].join(" · ").toLowerCase();
  }
  const count = (hay, needle) => { let c = 0; for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) c++; return c; };

  let currentId = null;
  let highlightQ = "";     // text the open note should highlight; empty when opened from the menu

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const pad = n => String(n).padStart(2, "0");
  const paint = (node, color) => {
    for (const part of ["", "-bg", "-ink", "-chip"]) node.style.setProperty(`--c${part}`, `var(--${color}${part})`);
  };
  const heading = (label, n) => { const h = el("h2", null, label); h.title = label; h.append(el("span", "count", n)); return h; };

  // One clickable note tile; the tooltip carries the title too, for the collapsed rail.
  // From search, it also carries the query, so the note opens with every hit highlighted.
  function noteButton(n, showProject, query = "", hits = 0) {
    const b = el("button", "file");
    b.type = "button";
    b.dataset.id = n.id;
    const mod = moduleTitle(n);
    b.title = [showProject ? `${projects[n.project]?.name} · ${n.title}` : n.title, n.summary,
      mod && `Module ${n.module} · ${mod}`, n.date].filter(Boolean).join("\n");
    b.append(el("span", "num", pad(n.n)), el("span", "t", n.title));
    if (hits) b.append(el("span", "hits", `${hits}×`));
    if (showProject) paint(b, projects[n.project]?.color);
    if (n.id === currentId) b.setAttribute("aria-current", "page");
    b.addEventListener("click", () => {
      highlightQ = query;
      if (location.hash.slice(1) === n.id) sendHighlight(); else location.hash = n.id;
    });
    return b;
  }
  function plannedRow(m) {
    const row = el("div", `file planned${m.status === "in progress" ? " active" : ""}`);
    row.title = `Module ${m.n} · ${m.title} · ${m.status}`;
    row.append(el("span", "num", `M${m.n}`), el("span", "t", m.title), el("span", "state", m.status));
    return row;
  }

  // ── Left: every note, grouped by project, with roadmaps ──
  function renderMenu() {
    menuList.replaceChildren();
    for (const [key, p] of Object.entries(projects)) {
      const items = notes.filter(n => n.project === key).sort((a, b) => a.n - b.n);
      const todo = (p.modules || []).filter(m => m.status !== "done");
      if (!items.length && !todo.length) continue;

      const group = el("section", "group");
      paint(group, p.color);
      group.append(heading(p.name, items.length));
      if (p.modules) {
        const done = p.modules.filter(m => m.status === "done").length;
        const prog = el("div", "progress", `${done} of ${p.modules.length} modules done`);
        const bar = el("div", "bar"), fill = el("i");
        fill.style.width = `${(done / p.modules.length) * 100}%`;
        bar.append(fill); prog.append(bar); group.append(prog);
      }
      for (const n of items) group.append(noteButton(n, false));
      for (const m of todo) group.append(plannedRow(m));
      menuList.append(group);
    }
  }

  // ── Left, while typing: search inside every note. Results replace the menu;
  //    each matching note shows once, with its number of hits ──
  function renderSearch() {
    const q = search.value.trim().replace(/\s+/g, " ");
    const searching = q.length >= MIN_QUERY;
    menuList.hidden = searching;
    findList.hidden = !searching;
    findList.replaceChildren();
    if (!searching) {
      menuFoot.textContent = q ? "Keep typing…" : `${notes.length} notes`;
      return;
    }
    const needle = q.toLowerCase();
    const found = notes
      .map(n => ({ n, hits: count(n.body, needle), meta: n.meta.includes(needle) }))
      .filter(r => r.hits || r.meta)
      .sort((a, b) => b.hits - a.hits || a.n.project.localeCompare(b.n.project) || a.n.n - b.n.n);
    if (found.length) {
      const group = el("section", "group");
      group.append(heading("Results", found.length));
      for (const { n, hits } of found) group.append(noteButton(n, true, q, hits));
      findList.append(group);
    }
    const total = found.reduce((t, r) => t + r.hits, 0);
    menuFoot.textContent = found.length
      ? `${total} hit${total === 1 ? "" : "s"} in ${found.length} of ${notes.length} notes` : "No notes match.";
  }

  // ── Right: recently viewed notes, newest first, kept in this browser only ──
  const readHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } };
  function remember(id) {
    const ids = [id, ...readHistory().filter(x => x !== id)].slice(0, HISTORY_MAX);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(ids)); } catch {}
  }
  function renderRecent() {
    const recent = readHistory().map(id => notes.find(n => n.id === id)).filter(Boolean);
    recentList.replaceChildren();
    if (recent.length) {
      const group = el("section", "group");
      group.append(heading("Recently viewed", recent.length));
      for (const n of recent) group.append(noteButton(n, true));
      recentList.append(group);
    }
    recentFoot.textContent = recent.length ? "Newest first" : "Notes you open show up here.";
  }

  // ── Menu. Starts as a rail; the menu button opens it beside the note and closes it again.
  //    body classes: left-collapsed = closed · rail = showing the rail layout ──
  const menuEl = $("menu"), recentEl = $("recent");
  const body = document.body;
  const menuOpen = () => !body.classList.contains("left-collapsed");
  function syncMenu() {
    if (menuOpen()) body.classList.remove("rail");             // full content at once; the slide reveals it
    else if (menuEl.getBoundingClientRect().width <= 60) body.classList.add("rail");
  }
  function setMenu(open) {
    body.classList.toggle("left-collapsed", !open);
    menuBtn.setAttribute("aria-expanded", open);
    syncMenu();
  }
  // Switch to the rail layout only once the slide has closed, so the text clips away instead of jumping
  menuEl.addEventListener("transitionend", e => { if (e.target === menuEl) syncMenu(); });
  const resetMenu = () => setMenu(false);
  function openSearch() {
    if (!menuOpen()) setMenu(true);
    search.focus();
  }

  // ── Recently viewed. A rail; hovering slides it open over the note, leaving slides it straight back ──
  function syncRecent() {
    if (body.classList.contains("recent-peek")) body.classList.remove("recent-rail");
    else if (recentEl.getBoundingClientRect().width <= 60) body.classList.add("recent-rail");
  }
  recentEl.addEventListener("mouseenter", () => { body.classList.add("recent-peek"); syncRecent(); });
  recentEl.addEventListener("mouseleave", () => { body.classList.remove("recent-peek"); syncRecent(); });
  recentEl.addEventListener("transitionend", e => { if (e.target === recentEl) syncRecent(); });

  // ── Viewer ───────────────────────────────────────────────
  function show(id) {
    const n = notes.find(x => x.id === id && x.file);
    currentId = n ? n.id : null;

    if (n) {
      if (frame.dataset.src !== n.file) { frame.src = n.file; frame.dataset.src = n.file; }
      frame.hidden = false;
      home.hidden = true;
      current.textContent = `${projects[n.project]?.name} · ${pad(n.n)} ${n.title}`;
      exportBtn.disabled = false;
      document.title = `${n.title} · Chalk Book`;
      remember(n.id);
    } else {
      frame.hidden = true;
      home.hidden = false;
      current.textContent = "";
      exportBtn.disabled = true;
      setExport(false);
      document.title = "Chalk Book";
    }
    renderRecent();
    for (const b of document.querySelectorAll("button.file[data-id]"))
      b.toggleAttribute("aria-current", b.dataset.id === currentId);
    if (narrow.matches) setMenu(false);
  }

  // Ask the open note to highlight the search text (or clear it). Sent again on every load,
  // because the note only exists once its page has loaded.
  function sendHighlight() {
    if (currentId) frame.contentWindow?.postMessage({ type: "chalk:highlight", q: highlightQ }, "*");
  }

  // ── Export menu: opens below its button; closes on choosing, Esc or a click elsewhere ──
  function setExport(open) {
    exportMenu.hidden = !open;
    exportBtn.setAttribute("aria-expanded", open);
    if (open) exportMenu.querySelector(".export-item")?.focus();
  }

  // Served over http, the note shares our origin and can be printed directly. Opened from disk,
  // every file is its own origin, so we ask the note to open its own print dialog instead.
  function save() {
    if (!currentId) return;
    try { frame.contentWindow.print(); }
    catch { frame.contentWindow.postMessage("chalk:print", "*"); }
  }

  // ── Wiring ───────────────────────────────────────────────
  menuBtn.addEventListener("click", () => setMenu(!menuOpen()));
  $("search-rail").addEventListener("click", openSearch);
  $("scrim").addEventListener("click", () => setMenu(false));
  frame.addEventListener("load", sendHighlight);
  exportBtn.addEventListener("click", e => { e.stopPropagation(); setExport(exportMenu.hidden); });
  $("save-pdf").addEventListener("click", () => { setExport(false); save(); });
  document.addEventListener("click", e => { if (!exportMenu.hidden && !e.target.closest(".export")) setExport(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !exportMenu.hidden) { setExport(false); exportBtn.focus(); } });

  narrow.addEventListener("change", resetMenu);

  search.addEventListener("input", renderSearch);
  search.addEventListener("keydown", e => {
    if (e.key === "Escape") { search.value = ""; renderSearch(); search.blur(); }
    if (e.key === "Enter") findList.querySelector("button.file")?.click();
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || document.activeElement === search) return;
    e.preventDefault();
    openSearch();
  });
  addEventListener("hashchange", () => show(decodeURIComponent(location.hash.slice(1))));

  const real = window.CHALK_NOTES.length, projCount = Object.keys(window.CHALK_PROJECTS).length;
  const lines = [`${real} notes across ${projCount} projects.`];
  for (const p of Object.values(window.CHALK_PROJECTS)) if (p.modules) {
    const done = p.modules.filter(m => m.status === "done").length;
    const next = p.modules.find(m => m.status !== "done");
    lines.push(`${p.name}: ${done} of ${p.modules.length} modules done${next ? ` · next: ${next.title}` : ""}.`);
  }
  $("home-stats").replaceChildren(...lines.flatMap((l, i) => i ? [el("br"), l] : [l]));

  resetMenu();
  renderMenu();
  renderSearch();
  show(decodeURIComponent(location.hash.slice(1)));
})();
