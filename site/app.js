/* Chalk Book site — search + notes menu (left), recently viewed (right), roadmap, viewer and Save as PDF.
   No build step, no libraries. */

// <chalk-wordmark></chalk-wordmark>: the site's name, written once and used wherever it appears.
// Home's heading is the one exception: <chalk-wordmark second="Board"> reads Chalk Board, the portfolio's name
customElements.define("chalk-wordmark", class extends HTMLElement {
  connectedCallback() {
    const second = this.getAttribute("second") || "Book";
    if (!this.childElementCount) this.innerHTML = `<span class="chalk">Chalk</span> <span class="book">${second}</span>`;
    this.setAttribute("aria-label", `Chalk ${second}`);
  }
});

(() => {
  const $ = id => document.getElementById(id);
  const menuList = $("menu-list"), menuFoot = $("menu-foot"), findList = $("find-list"),
        recentList = $("recent-list"), recentFoot = $("recent-foot"), search = $("search"),
        frame = $("frame"), home = $("home"), current = $("current"), menuBtn = $("menu-btn"),
        exportBtn = $("export-btn"), exportMenu = $("export-menu"), menuSort = $("menu-sort");
  const projects = { ...window.CHALK_PROJECTS };
  const notes = window.CHALK_NOTES.map(n => ({ ...n, file: `notes/${n.id}.html` }));
  const narrow = matchMedia("(max-width: 760px)");
  const text = window.CHALK_TEXT || {};     // plain text of each note, from site/build-index.mjs
  const local = new Set(window.CHALK_LOCAL || []);   // notes git ignores: a red Git watermark
  const markOf = n => n.pending ? "butter" : local.has(n.id) ? "ignored" : "";   // "" is green: on GitHub
  const MIN_QUERY = 2;
  // The site's own pages, opened from the footer; anything else in the address is a note id
  const PAGES = {
    // The private progress pages (.handoffs/ is gitignored), shown in the viewer. Their footer
    // buttons show only where the page exists, so a hosted copy has none
    backlog: { title: "Backlog", file: ".handoffs/backlog.html", private: true },
    complete: { title: "Complete Tasks", file: ".handoffs/complete-tasks.html", private: true },
    linux: { title: "Linux", file: ".handoffs/linux.html", private: true },
    contact: { title: "Contact", file: "site/pages/contact.html" },
  };
  // The bottom bar, in order: a site page by its PAGES key ("" is Home), or an outside link.
  // A private link is the owner's own shortcut: it shows only where the private Backlog page exists
  const FOOTER = [
    { page: "", label: "Home" },
    { page: "backlog" },
    { page: "complete" },
    { page: "linux" },
    { page: "contact" },
    { label: "GitHub", href: "https://github.com/alphanatic/chalk-book" },
    { label: "claude.ai", href: "https://claude.ai/new#settings/usage", private: true },
    { label: "benchlm.ai", href: "https://benchlm.ai/", private: true },
    { label: "AWS", href: "https://eu-north-1.console.aws.amazon.com/ec2/home?region=eu-north-1#", private: true },
  ];
  // The Export menu, in order: label, palette colour, glyph (SVG paths) and what choosing it does
  const EXPORTS = [
    { label: "Save as PDF", color: "mint", run: () => save(),
      icon: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M12 11v6m-3-3 3 3 3-3"/>' },
  ];
  // The portfolio under Home's name: the sites served next to the chalk book, left to right, each a tile with its icon
  // and name, shown only where it is served: a water droplet for the lkgexp menu, a Poké Ball for the Pokéggdex.
  // Served locally, each is its npm dev server (npm run dev in its own project folder; the Pokéggdex's is ~/Projects/pokeggdex)
  const onLocalhost = ["localhost", "127.0.0.1"].includes(location.hostname);
  const APPS = [
    { kind: "drop", label: "lkgexp", href: onLocalhost ? "http://localhost:5173/menu.html" : "/lkgexp/menu.html",
      title: "Open the lkgexp menu",
      icon: '<svg viewBox="0 0 20 26" aria-hidden="true"><path class="body" d="M10 1C10 1 2 11 2 17a8 8 0 0 0 16 0C18 11 10 1 10 1Z"/>' +
        '<path class="shine" d="M6 17a4 4 0 0 0 4 4"/></svg>' },
    { kind: "game", label: "Pokéggdex", href: onLocalhost ? "http://localhost:5173/pokeggdex/" : "/pokeggdex/", title: "Play the Pokéggdex",
      icon: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="shell" cx="50" cy="50" r="45"/>' +
        '<path class="cap" d="M7.5 50a42.5 42.5 0 0 1 85 0z"/><line class="band" x1="5" y1="50" x2="95" y2="50"/>' +
        '<circle class="knob" cx="50" cy="50" r="13"/></svg>' },
  ];
  // The GitHub marks at the left end of the bottom bar, left to right, each with its count of notes
  const HOME_MARKS = [
    { kind: "", title: "on GitHub" },
    { kind: "butter", title: "pending: public or private not decided" },
    { kind: "ignored", title: "private" },
  ];
  // The menu's sort buttons, in order, each lit in its chalk colour when chosen: projects and their notes by name, or by catalogue order and number.
  // The colours are the user's choice and unrelated to the Git marks' meaning.
  // Swedish collation, so å, ä and ö come after z. 01–99 is the default until another is chosen;
  // the choice is kept in this browser
  const byName = new Intl.Collator("sv", { numeric: true, sensitivity: "base" }).compare;
  const SORTS = [
    { key: "az", label: "A–Ö", color: "butter", title: "A to Ö", projects: (a, b) => byName(a.name, b.name), notes: (a, b) => byName(a.title, b.title) },
    { key: "number", label: "01–99", color: "mint", title: "Catalogue order, notes by number", projects: () => 0, notes: (a, b) => a.n - b.n },
    { key: "za", label: "Ö–A", color: "coral", title: "Ö to A", projects: (a, b) => byName(b.name, a.name), notes: (a, b) => byName(b.title, a.title) },
  ];
  const SORT_KEY = "chalk.sort";
  let sort = SORTS.find(s => { try { return s.key === localStorage.getItem(SORT_KEY); } catch { return false; } }) || SORTS.find(s => s.key === "number");
  const HISTORY_KEY = "chalk.history", HISTORY_MAX = 10;
  // Every note opened in this browser, newest first: the rail shows the last few of each project
  const OPENED_KEY = "chalk.opened", OPENED_MAX = 60, RAIL_RECENT = 3;
  // Menu projects opened with their dot; the rest start folded
  const FOLD_KEY = "chalk.open-projects";
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
  // The GitHub mark as a watermark on the right of a menu tile; the title slides under it. Green for notes in git,
  // red on red for notes git ignores (private), yellow on yellow for pending notes: public or private not decided yet.
  // Drawn as a cat-coloured disc, the mark's ring-coloured shape on top, then a ring stroke so the circle closes
  // under the cat's body too.
  const GITHUB_PATH = "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1 -5.45 7.59c-.4 .08 -.55 -.17 -.55 -.38 0 -.27 .01 -1.13 .01 -2.2 0 -.75 -.25 -1.23 -.54 -1.48 1.78 -.2 3.65 -.88 3.65 -3.95 0 -.88 -.31 -1.59 -.82 -2.15 .08 -.2 .36 -1.02 -.08 -2.12 0 0 -.67 -.22 -2.2 .82 -.64 -.18 -1.32 -.27 -2 -.27 -.68 0 -1.36 .09 -2 .27 -1.53 -1.03 -2.2 -.82 -2.2 -.82 -.44 1.1 -.16 1.92 -.08 2.12 -.51 .56 -.82 1.28 -.82 2.15 0 3.06 1.86 3.75 3.64 3.95 -.23 .2 -.44 .55 -.51 1.07 -.46 .21 -1.61 .55 -2.33 -.66 -.15 -.24 -.6 -.83 -1.23 -.82 -.67 .01 -.27 .38 .01 .53 .34 .19 .73 .9 .82 1.13 .16 .45 .68 1.31 2.69 .94 0 .67 .01 1.3 .01 1.49 0 .21 -.15 .45 -.55 .37A7.995 7.995 0 0 1 0 8c0 -4.42 3.58 -8 8 -8Z";
  function gitMark(kind = "") {
    const mark = el("span", `git ${kind}`.trim());
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

  const readOpen = () => { try { return new Set(JSON.parse(localStorage.getItem(FOLD_KEY)) || []); } catch { return new Set(); } };
  // The project's dot as a button: a plus when folded, a minus when open, both cut out of the dot
  function foldButton(group, key, name) {
    const b = el("button", "fold");
    const set = open => {
      group.classList.toggle("open", open);
      b.setAttribute("aria-expanded", open);
      b.setAttribute("aria-label", `${open ? "Hide" : "Show"} ${name} notes`);
      b.title = open ? "Fold" : "Unfold";
    };
    set(readOpen().has(key));
    // On the rail the dot is a plain ball: it opens the menu with the project unfolded and centred.
    // In the open menu it folds and unfolds
    b.addEventListener("click", () => {
      const open = readOpen(), now = !menuOpen() || !open.has(key);
      if (now) open.add(key); else open.delete(key);
      try { localStorage.setItem(FOLD_KEY, JSON.stringify([...open])); } catch {}
      set(now);
      if (now && !menuOpen()) {
        setMenu(true);
        keep(MENU_KEY, true);
        centre(group);
      }
    });
    return b;
  }

  // Scroll the menu so a project sits in its middle, or starts at its top when taller than the menu
  function centre(group) {
    const pane = group.closest(".panel-body"), p = pane.getBoundingClientRect(), g = group.getBoundingClientRect();
    pane.scrollTo({ top: pane.scrollTop + g.top - p.top - Math.max(0, (p.height - g.height) / 2), behavior: "smooth" });
  }

  // ── Left: every note, grouped by project, with roadmaps, in the chosen sort order ──
  function renderMenu() {
    menuList.replaceChildren();
    for (const [key, p] of Object.entries(projects).sort(([, a], [, b]) => sort.projects(a, b))) {
      const items = notes.filter(n => n.project === key).sort(sort.notes);
      const todo = (p.modules || []).filter(m => m.status !== "done");
      if (!items.length && !todo.length) continue;

      const group = el("section", "group foldable");
      paint(group, p.color);
      const h = heading(p.name, items.length);
      h.prepend(foldButton(group, key, p.name));
      group.append(h);
      if (items.length) {
        // Notes carrying the green GitHub mark, out of every note in the project
        const shared = items.filter(n => !markOf(n)).length;
        const prog = el("div", "progress");
        prog.append(el("span", "label", `${shared} of ${items.length} notes on GitHub`));
        const bar = el("div", "bar"), fill = el("i");
        fill.style.width = `${(shared / items.length) * 100}%`;
        bar.append(fill); prog.append(bar); group.append(prog);
      }
      for (const n of items) {
        const b = noteButton(n, false);
        b.append(gitMark(markOf(n)));
        group.append(b);
      }
      for (const m of todo) group.append(plannedRow(m));
      menuList.append(group);
    }
    markRailRecent();
  }

  // On the rail, each project shows only its notes opened last in this browser, at most RAIL_RECENT
  // Until a note is opened with this list in place, start from Recently viewed
  const readOpened = () => { try { return JSON.parse(localStorage.getItem(OPENED_KEY) ?? localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } };
  function markRailRecent() {
    const opened = readOpened();
    for (const b of menuList.querySelectorAll("button.file[data-id]")) {
      const p = projectOf(b.dataset.id);
      const rank = opened.filter(id => projectOf(id) === p).indexOf(b.dataset.id);
      b.classList.toggle("rail-recent", rank >= 0 && rank < RAIL_RECENT);
    }
  }

  // ── Left, while typing: search inside every note. Results replace the menu;
  //    each matching note shows once, with its number of hits ──
  function renderSearch() {
    const q = search.value.trim().replace(/\s+/g, " ");
    const searching = q.length >= MIN_QUERY;
    menuList.hidden = menuSort.hidden = searching;
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

  // ── Right: recently viewed notes, newest first, kept in this browser only.
  //    One per project: the last note opened in it ──
  const projectOf = id => notes.find(n => n.id === id)?.project;
  function readHistory() {
    let ids;
    try { ids = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { ids = []; }
    const seen = new Set();
    return ids.filter(id => { const p = projectOf(id); return p && !seen.has(p) && seen.add(p); });
  }
  function remember(id) {
    const ids = [id, ...readHistory().filter(x => projectOf(x) !== projectOf(id))].slice(0, HISTORY_MAX);
    const opened = [id, ...readOpened().filter(x => x !== id)].slice(0, OPENED_MAX);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(ids));
      localStorage.setItem(OPENED_KEY, JSON.stringify(opened));
    } catch {}
    markRailRecent();
  }
  function renderRecent() {
    const recent = readHistory().map(id => notes.find(n => n.id === id));
    recentList.replaceChildren();
    if (recent.length) {
      const group = el("section", "group");
      group.append(heading("Recently viewed", recent.length));
      // Each tile carries its project's name in a chip on its top edge
      for (const n of recent) {
        const b = noteButton(n, true);
        b.append(el("span", "proj", projects[n.project]?.name));
        group.append(b);
      }
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

  // Removes a footer button whose page isn't there. Served over http, ask the server; opened from disk,
  // the browser can't check files, and the private pages are there anyway, so the button stays
  // onDisk: what to do when opened from disk, where nothing can be checked (true keeps it)
  function dropIfMissing(li, file, onDisk = true) {
    if (location.protocol === "file:") { if (!onDisk) li.remove(); return; }
    // no-cors so another local server can be checked too: it answers with an opaque response when it's up
    fetch(file, { method: "HEAD", mode: "no-cors" })
      .then(r => { if (!r.ok && r.type !== "opaque") li.remove(); }).catch(() => li.remove());
  }

  // ── Bottom bar, Export menu and menu sort: one button per entry ──────
  menuSort.replaceChildren(...SORTS.map(s => {
    const b = el("button", "sort-btn", s.label);
    b.type = "button";
    b.title = s.title;
    paint(b, s.color);
    b.setAttribute("aria-pressed", s === sort);
    b.addEventListener("click", () => {
      sort = s;
      try { localStorage.setItem(SORT_KEY, s.key); } catch {}
      for (const x of menuSort.children) x.setAttribute("aria-pressed", x === b);
      renderMenu();
    });
    return b;
  }));
  $("footer-links").replaceChildren(...FOOTER.map(f => {
    const a = el("a", "main-footer-btn", f.label ?? PAGES[f.page].title);
    if (f.href) Object.assign(a, { href: f.href, target: "_blank", rel: "noopener" });
    else { a.href = `#${f.page}`; a.dataset.page = f.page; }
    const li = el("li");
    li.append(a);
    if (PAGES[f.page]?.private) dropIfMissing(li, PAGES[f.page].file);
    else if (f.private) dropIfMissing(li, PAGES.backlog.file);
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
  // Away from Home, the button goes Home and opens the list there
  recentBtn.addEventListener("click", () => {
    if (body.classList.contains("no-recent")) { location.hash = ""; setRecent(true); }
    else setRecent(!recentOpen());
  });
  $("search-rail").addEventListener("click", openSearch);
  $("scrim").addEventListener("click", () => setMenu(false));
  frame.addEventListener("load", sendHighlight);
  exportBtn.addEventListener("click", e => { e.stopPropagation(); setExport(exportMenu.hidden); });
  document.addEventListener("click", e => { if (!exportMenu.hidden && !e.target.closest(".export")) setExport(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !exportMenu.hidden) { setExport(false); exportBtn.focus(); } });
  // The CloudM badge opens and closes its credit card, the same way
  const cloudm = $("cloudm"), cloudmBtn = $("cloudm-btn"), cloudmCard = $("cloudm-card");
  const setCloudm = open => {
    cloudmCard.hidden = !open;
    cloudmBtn.setAttribute("aria-expanded", open);
    cloudm.classList.toggle("open", open);
  };
  cloudmBtn.addEventListener("click", () => setCloudm(cloudmCard.hidden));
  document.addEventListener("click", e => { if (!cloudmCard.hidden && !cloudm.contains(e.target)) setCloudm(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !cloudmCard.hidden) { setCloudm(false); cloudmBtn.focus(); } });

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
  $("footer-marks").replaceChildren(...HOME_MARKS.map(m => {
    const n = window.CHALK_NOTES.filter(x => markOf(x) === m.kind).length, item = el("span", "footer-mark", n);
    item.title = `${n} notes ${m.title}`;
    item.prepend(gitMark(m.kind));
    return item;
  }));
  const apps = APPS.map(a => {
    const link = el("a", `home-app ${a.kind}`);
    Object.assign(link, { href: a.href, target: "_blank", rel: "noopener", title: a.title });
    link.innerHTML = a.icon;
    link.append(el("span", "name", a.label));
    return link;
  });
  $("home-apps").replaceChildren(...apps);
  apps.forEach((link, i) => dropIfMissing(link, APPS[i].href, false));
  $("home-stats").replaceChildren(...lines.flatMap((l, i) => i ? [el("br"), l] : [l]));

  resetMenu();
  setRecent(false);
  renderMenu();
  renderSearch();
  show(decodeURIComponent(location.hash.slice(1)));
})();
