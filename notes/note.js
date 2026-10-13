/* Runs inside every note. Lets the chalk-book site open the print dialog (Save as PDF)
   and highlight search hits. Messages are used because, opened from disk, the site
   isn't allowed to reach into the note directly. */
addEventListener("message", e => {
  if (e.data === "chalk:print") print();
  else if (e.data && e.data.type === "chalk:highlight") highlight(e.data.q || "");
});

// Marks every case-insensitive occurrence of q, even when it spans several elements,
// then scrolls the first one into view
function highlight(q) {
  for (const m of document.querySelectorAll("mark.chalk-hit")) m.replaceWith(...m.childNodes);
  document.body.normalize();
  if (!q.trim()) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement.closest("script, style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const nodes = [];
  let text = "";
  for (let n; (n = walker.nextNode());) { nodes.push({ n, start: text.length, len: n.data.length }); text += n.data; }

  const hay = text.toLowerCase(), needle = q.toLowerCase(), hits = [];
  for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + needle.length)) hits.push(i);

  // Wrap from the last hit backwards, so the offsets of earlier hits stay valid
  for (let h = hits.length - 1; h >= 0; h--) {
    const s = hits[h], e = s + needle.length;
    for (let k = nodes.length - 1; k >= 0; k--) {
      const { n, start, len } = nodes[k];
      if (start + len <= s || start >= e) continue;
      const range = document.createRange();
      range.setStart(n, Math.max(s, start) - start);
      range.setEnd(n, Math.min(e, start + len) - start);
      const mark = document.createElement("mark");
      mark.className = "chalk-hit";
      range.surroundContents(mark);
    }
  }
  document.querySelector("mark.chalk-hit")?.scrollIntoView({ block: "center" });
}

/* Chalk markup: a note's compact source, turned into the note's HTML here, in the browser (no build step).
   A note holds <script type=text/chalk>…</script>, then <body> with ../site/notes.js and this file.
   The header (title, eyebrow, page footer) is made from the note's entry in site/notes.js.
     first lines                 line 1 = subtitle, then summary paragraphs (blank line between), up to the first heading;
                                 a raw <span class="eyebrow"> or <h1> line first replaces the made one
     ## Title {class}            section; the five standard titles get their id and colour by themselves
     ### Remote · Title {class}  step heading with a tag chip ({class} only for an unusual tag); starts a keep group
     #### Bug · name             bug card: then "cause: …" and "fix: …" lines; what follows goes in the card
     {keep}                      the next heading or element starts a group that never splits across pages
     ---                         ends the open group or bug card early (otherwise the next heading ends it)
     ```type[ wide][: label]     local, remote, output, concept or config. "  # …" after a command is a comment,
                                 lined up for you; spaces other than two keep the block exactly as written.
                                 Config lines "code  »  note" make an annotated block; a blank line there is a gap
     ```html                     raw HTML, up to the closing ```
     - item                      ✓ checklist; under "Best practices", "- **Title** text" makes a card
     1. item                     numbered steps, in the colour of the ### tag above them
     >{class} Label · text       callout; {class} only when the label isn't Gotcha, Concept, Best practice, Key rule, Naming note
     | a | b                     table, first row = header; \| is a literal pipe; end with | if the last cell is empty
     Part of …                   closing line
     inline: `code` **bold** *italic* [[note-id]] [[note-id|text]] [text](url) <span class="…">, <br>, <s>, <kbd>
   A list item, callout, cause or fix continues on lines indented by two spaces. */
const SECTIONS = { "What we covered": ["covered", "best"], "Full command sequence": ["steps", "local"],
  "Bugs hit & fixed": ["bugs", "gotcha"], "Where things live": ["paths", "paths"], "Best practices": ["practices", "best"] };
const TAGS = { local: "local", remote: "remote", concept: "concept", config: "config", "config file": "config", "aws console": "console" };
const CALLOUTS = { gotcha: "gotcha", concept: "concept", "best practice": "best", "key rule": "config", "naming note": "paths" };

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(s, notes) {
  const code = [];
  s = esc(s.replace(/`([^`]+)`/g, (m, c) => `\u0000${code.push(c) - 1}\u0000`))
    .replace(/&lt;(\/?(?:span|br|s|kbd|sup|sub)(?: class="[\w -]+")?)&gt;/g, "<$1>")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/(^|[^\w*])\*([^*\s](?:[^*]*[^*\s])?)\*(?![\w*])/g, "$1<i>$2</i>")
    .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, text) => {
      const n = notes.find(x => x.id === id);
      return `<a href="../index.html#${id}" target="_top">${text ?? (n ? esc(`${String(n.n).padStart(2, "0")} ${n.title}`) : id)}</a>`;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, k) => `<code>${esc(code[k])}</code>`);
}

// One code block. Comments line up 4 spaces after the longest command, or 2 when a line would pass 100 characters
function codeBlock(info, lines) {
  const [, type, flags = "", label] = info.match(/^(\w+)((?: \w+)*)(?:: (.*))?$/);
  const head = `<div class="block ${type}`, file = label ? `<div class="file">${esc(label)}</div>` : "";
  if (lines.some(l => /\s{2,}»(\s|$)/.test(l))) {
    const rows = lines.map(l => {
      if (!l.trim()) return '<div class="gap"></div>';
      const [code, note = ""] = l.split(/\s{2,}»\s*/);
      return `<div class="row"><pre>${esc(code)}</pre><span>${esc(note)}</span></div>`;
    });
    return `${head} annotated${flags}">${file}${rows.join("")}</div>`;
  }
  const parts = lines.map(l => l.match(/^(.*?\S)(\s{2,})(#.*)$/)?.slice(1) ?? [l, "", null]);
  const lit = parts.filter(p => p[2] !== null), width = Math.max(0, ...lit.map(p => p[0].length));
  const asWritten = lit.some(p => p[1] !== "  ");
  const gap = width + 4 + Math.max(0, ...lit.map(p => p[2].length)) > 100 ? 2 : 4;
  const pre = parts.map(([code, sp, c]) => c === null ? esc(code)
    : `${esc(code)}${asWritten ? sp : " ".repeat(width - code.length + gap)}<span class="cmt">${esc(c)}</span>`).join("\n");
  return `${head}${flags}">${file}<pre>${pre}</pre></div>`;
}

function renderChalk(src) {
  const id = decodeURIComponent(location.pathname.split("/").pop()).replace(/\.html$/, "");
  const notes = window.CHALK_NOTES || [], entry = notes.find(n => n.id === id);
  const project = entry && (window.CHALK_PROJECTS || {})[entry.project];
  const nn = entry ? String(entry.n).padStart(2, "0") : "";
  const md = s => inline(s, notes);

  const L = src.replace(/^\s*\n|\s+$/g, "").split("\n");
  let i = 0;
  const more = () => { let t = ""; while (i < L.length && /^  \S/.test(L[i])) t += " " + L[i++].trim(); return t; };

  // Header: optional raw replacements, the subtitle, then summary paragraphs, up to the first heading
  const own = {};
  for (let m; i < L.length && (m = L[i].match(/^<(span class="eyebrow"|h1)/)); i++) own[m[1].split(" ")[0]] = L[i];
  const intro = [L[i] && !/^#/.test(L[i]) ? L[i++] : ""];
  for (let p = ""; i <= L.length; i++) {
    if (i === L.length || /^#/.test(L[i]) || !L[i].trim()) { if (p) intro.push(p); p = ""; if (i === L.length || /^#/.test(L[i])) break; }
    else p += (p ? "\n" : "") + L[i];
  }
  const title = entry ? entry.title : id;
  const eyebrow = entry ? `<span class="eyebrow">${esc([project?.name, nn, entry.module ? `Module ${entry.module}` : entry.context, entry.date]
    .filter(Boolean).join(" · "))}</span>` : "";
  let out = `<header class="hero">${own.span ?? eyebrow}${own.h1 ?? `<h1>${esc(title)}</h1>`}`
    + (intro[0] ? `<p class="sub">${md(intro[0])}</p>` : "") + intro.slice(1).map(p => `<p>${md(p)}</p>`).join("")
    + "</header>";

  let body = "", section = "", tag = "", keepNext = false;    // tag: the palette class of the last ### tag
  const open = [], close = () => { while (open.length) body += open.pop(); };
  const group = (start, end) => { close(); body += start; open.push(end); keepNext = false; };
  const startKeep = () => { if (keepNext) group('<div class="keep">', "</div>"); };
  while (i < L.length) {
    const l = L[i];
    let m;
    if (!l.trim()) { i++; continue; }
    if (l === "{keep}") { i++; keepNext = true; continue; }
    if (l === "---") { i++; close(); continue; }
    if ((m = l.match(/^## (.+?)(?: \{(\w+)\})?$/))) {
      i++; close(); startKeep();
      const [sid, cls] = SECTIONS[m[1]] || ["", "concept"];
      section = sid; tag = "";
      body += `<h2${sid ? ` id="${sid}"` : ""} class="${m[2] || cls}">${md(m[1])}</h2>`;
      continue;
    }
    if ((m = l.match(/^### (.+?)(?: \{(\w+)\})?$/))) {
      i++; group('<div class="keep">', "</div>");
      const t = m[1].match(/^(.+?) · (.+)$/);
      tag = (t && (m[2] || TAGS[t[1].toLowerCase()])) || "";
      body += tag ? `<h3><span class="tag ${tag}">${esc(t[1])}</span>${md(t[2])}</h3>` : `<h3>${md(m[1])}</h3>`;
      continue;
    }
    if ((m = l.match(/^#### (.+)$/))) {
      i++; tag = ""; group('<div class="bug">', "</div>");
      body += `<h4>${md(m[1])}</h4>`;
      let dl = "";
      while (i < L.length && (m = L[i].match(/^(cause|fix): (.*)$/))) { i++; dl += `<dt class="${m[1]}">${m[1].toUpperCase()}</dt><dd>${md(m[2] + more())}</dd>`; }
      if (dl) body += `<dl>${dl}</dl>`;
      continue;
    }
    if (/^Part of /.test(l)) { i++; close(); body += `<p class="part-of">${md(l)}</p>`; continue; }
    startKeep();
    if ((m = l.match(/^```(.+)$/))) {
      const lines = [];
      for (i++; i < L.length && L[i] !== "```"; i++) lines.push(L[i]);
      i++;
      body += m[1] === "html" ? lines.join("\n") : codeBlock(m[1], lines);
    } else if (/^- /.test(l)) {
      const items = [];
      while (i < L.length && /^- /.test(L[i])) { const t = L[i++].slice(2); items.push(t + more()); }
      const cards = section === "practices" && items.every(t => /^\*\*.+?\*\* /.test(t));
      body += cards
        ? `<div class="cards">${items.map(t => t.match(/^\*\*(.+?)\*\* (.*)$/)).map(([, b, t]) => `<div><b>${md(b)}</b>${md(t)}</div>`).join("")}</div>`
        : `<ul class="check">${items.map(t => `<li>${md(t)}</li>`).join("")}</ul>`;
    } else if (/^\d+\. /.test(l)) {
      const items = [];
      while (i < L.length && /^\d+\. /.test(L[i])) { const t = L[i++].replace(/^\d+\. /, ""); items.push(t + more()); }
      body += `<ul class="steps${tag ? ` ${tag}` : ""}">${items.map(t => `<li>${md(t)}</li>`).join("")}</ul>`;
    } else if ((m = l.match(/^>(?:\{(\w+)\})? (.+?) · (.*)$/))) {
      i++;
      const text = m[3] + more();
      body += `<div class="callout ${m[1] || CALLOUTS[m[2].toLowerCase()] || "concept"}"><b>${md(m[2])} ·</b> ${md(text)}</div>`;
    } else if (/^\|/.test(l)) {
      const rows = [];
      while (i < L.length && /^\|/.test(L[i])) rows.push(L[i++].replace(/^\||\|\s*$/g, "").split(/(?<!\\)\|/).map(c => md(c.trim().replace(/\\\|/g, "|"))));
      body += `<table>${rows.map((r, k) => `<tr>${r.map(c => k ? `<td>${c}</td>` : `<th>${c}</th>`).join("")}</tr>`).join("")}</table>`;
    } else {
      let p = "";
      while (i < L.length && L[i].trim() && !/^(#|```|- |\d+\. |>|\||\{keep\}$|---$|Part of )/.test(L[i])) p += (p ? "\n" : "") + L[i++];
      body += `<p>${md(p)}</p>`;
    }
  }
  close();

  // Page title, footer on printed pages, stylesheets, then the page itself
  const name = document.title || (entry ? `${(project?.name || "").replace(/^Project /, "")} ${nn} — ${title}` : title);
  document.title = name;
  // Shared stylesheets first, so a note's own <style> rules still win
  document.head.prepend(...["../chalk-pastel.css", "note-layout.css"].map(href =>
    Object.assign(document.createElement("link"), { rel: "stylesheet", href })));
  document.head.append(Object.assign(document.createElement("style"), {
    textContent: `@page { @bottom-center { content: "${name.replace(/["\\]/g, "\\$&")} · " counter(page) " / " counter(pages); } }` }));
  const page = document.createElement("template");
  page.innerHTML = out + body;
  document.body.prepend(page.content);
}
const chalkSource = document.querySelector('script[type="text/chalk"]');
if (chalkSource) renderChalk(chalkSource.textContent);

// Title colours: after the yellow eyebrow chip, the title's words take blue → pink → green → yellow in turn.
// Every "&" is purple chalk (lavender); other symbols stay white. A title that sets its own colours (e.g. the guide's Chalk Book name) is left alone.
const TITLE_COLOURS = ["sky", "pink", "mint", "butter"];
function colourTitle() {
  const h1 = document.querySelector(".hero h1");
  if (!h1 || h1.querySelector("[class^='wm-']")) return;
  const words = h1.textContent.trim().split(/\s+/);
  let i = 0;
  h1.replaceChildren(...words.flatMap((w, k) => {
    const span = document.createElement("span");
    span.textContent = w;
    if (w === "&") span.className = "tc-lav";
    else if (/[\p{L}\p{N}]/u.test(w)) span.className = `tc-${TITLE_COLOURS[i++ % TITLE_COLOURS.length]}`;
    return k ? [" ", span] : [span];
  }));
}
colourTitle();
