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
  const local = new Set(window.CHALK_LOCAL || []);   // notes git ignores: no Git watermark
  const MIN_QUERY = 2;
  // The site's own pages, opened from the footer; anything else in the address is a note id
  const PAGES = {
    // The private progress pages (.progress/ is gitignored), shown in the viewer
    backlog: { title: "Backlog", file: ".progress/backlog.html" },
    complete: { title: "Complete Tasks", file: ".progress/complete-tasks.html" },
    linux: { title: "Linux", file: ".progress/linux.html" },
    contact: { title: "Contact", file: "site/pages/contact.html" },
  };
  // The bottom bar, in order: a site page by its PAGES key ("" is Home), or an outside link
  const FOOTER = [
    { page: "", label: "Home" },
    { page: "backlog" },
    { page: "complete" },
    { page: "linux" },
    { page: "contact" },
    { label: "GitHub", href: "https://github.com/alphanatic/chalk-book" },
    { label: "claude.ai", href: "https://claude.ai/new#settings/usage" },
    { label: "benchlm.ai", href: "https://benchlm.ai/" },
    { label: "aws or", href: "https://eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#" },
  ];
  // The Export menu, in order: label, palette colour, glyph (SVG paths) and what choosing it does
  const EXPORTS = [
    { label: "Save as PDF", color: "mint", run: () => save(),
      icon: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M12 11v6m-3-3 3 3 3-3"/>' },
  ];
  const HISTORY_KEY = "chalk.history", HISTORY_MAX = 10;
  // Side panels on wide screens: "closed" once closed there, open otherwise
  const MENU_KEY = "chalk.menu";
  const wanted = key => { try { return localStorage.getItem(key) !== "closed"; } catch { return true; } };
  const keep = (key, open) => { if (!narrow.matches) try { localStorage.setItem(key, open ? "open" : "closed"); } catch {} };

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
  // The GitHub mark as a watermark on the right of a menu tile; the title slides under it.
  // Drawn as a cat-coloured disc, the mark's ring-coloured shape on top, then a ring stroke so the circle closes
  // under the cat's body too.
  const GITHUB_PATH = "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1 -5.45 7.59c-.4 .08 -.55 -.17 -.55 -.38 0 -.27 .01 -1.13 .01 -2.2 0 -.75 -.25 -1.23 -.54 -1.48 1.78 -.2 3.65 -.88 3.65 -3.95 0 -.88 -.31 -1.59 -.82 -2.15 .08 -.2 .36 -1.02 -.08 -2.12 0 0 -.67 -.22 -2.2 .82 -.64 -.18 -1.32 -.27 -2 -.27 -.68 0 -1.36 .09 -2 .27 -1.53 -1.03 -2.2 -.82 -2.2 -.82 -.44 1.1 -.16 1.92 -.08 2.12 -.51 .56 -.82 1.28 -.82 2.15 0 3.06 1.86 3.75 3.64 3.95 -.23 .2 -.44 .55 -.51 1.07 -.46 .21 -1.61 .55 -2.33 -.66 -.15 -.24 -.6 -.83 -1.23 -.82 -.67 .01 -.27 .38 .01 .53 .34 .19 .73 .9 .82 1.13 .16 .45 .68 1.31 2.69 .94 0 .67 .01 1.3 .01 1.49 0 .21 -.15 .45 -.55 .37A7.995 7.995 0 0 1 0 8c0 -4.42 3.58 -8 8 -8Z";
  function gitMark() {
    const mark = el("span", "git");
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = `<svg viewBox="0 0 16 16"><circle class="cat" cx="8" cy="8" r="7.5"/>` +
      `<path class="ring" d="${GITHUB_PATH}"/><circle class="edge" cx="8" cy="8" r="7.45"/></svg>`;
    return mark;
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
      for (const n of items) {
        const b = noteButton(n, false);
        if (!local.has(n.id)) b.append(gitMark());
        group.append(b);
      }
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
  const menuEl = $("nav-menu"), recentEl = $("recent");
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
  // Wide screens open the menu unless it was last closed there; phones always start closed
  const resetMenu = () => setMenu(!narrow.matches && wanted(MENU_KEY));
  function openSearch() {
    if (!menuOpen()) setMenu(true);
    search.focus();
  }

  // ── Recently viewed. Hidden until its button opens it, and only on Home ──
  const recentBtn = $("recent-btn");
  const recentOpen = () => body.classList.contains("recent-open");
  function setRecent(open) {
    body.classList.toggle("recent-open", open);
    recentBtn.setAttribute("aria-expanded", open);
  }

  // ── Viewer ───────────────────────────────────────────────
  function show(id) {
    const page = PAGES[id];
    const n = page ? null : notes.find(x => x.id === id && x.file);
    body.classList.toggle("no-recent", !!(page || n));   // Recently viewed belongs to Home only
    if (page || n) setRecent(false);
    currentId = n ? n.id : null;
    for (const a of document.querySelectorAll(".main-footer-btn"))
      a.toggleAttribute("aria-current", a.dataset.page === (page ? id : n ? "-" : ""));

    if (page) {
      if (frame.dataset.src !== page.file) { frame.src = page.file; frame.dataset.src = page.file; }
      frame.hidden = false;
      home.hidden = true;
      current.textContent = page.title;
      exportBtn.disabled = true;
      setExport(false);
      document.title = `${page.title} · Chalk Book`;
    } else if (n) {
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

  // ── Bottom bar and Export menu: one button per entry ──────
  $("footer-links").replaceChildren(...FOOTER.map(f => {
    const a = el("a", "main-footer-btn", f.label ?? PAGES[f.page].title);
    if (f.href) Object.assign(a, { href: f.href, target: "_blank", rel: "noopener" });
    else { a.href = `#${f.page}`; a.dataset.page = f.page; }
    const li = el("li");
    li.append(a);
    return li;
  }));
  exportMenu.replaceChildren(...EXPORTS.map(x => {
    const b = el("button", `export-item ${x.color}`);
    b.type = "button";
    b.setAttribute("role", "menuitem");
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${x.icon}</svg>`;
    b.append(x.label);
    b.addEventListener("click", () => { setExport(false); x.run(); });
    return b;
  }));

  // ── Wiring ───────────────────────────────────────────────
  menuBtn.addEventListener("click", () => {
    const open = !menuOpen();
    setMenu(open);
    keep(MENU_KEY, open);
  });
  recentBtn.addEventListener("click", () => setRecent(!recentOpen()));
  $("search-rail").addEventListener("click", openSearch);
  $("scrim").addEventListener("click", () => setMenu(false));
  frame.addEventListener("load", sendHighlight);
  exportBtn.addEventListener("click", e => { e.stopPropagation(); setExport(exportMenu.hidden); });
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
  setRecent(false);
  renderMenu();
  renderSearch();
  show(decodeURIComponent(location.hash.slice(1)));
})();
