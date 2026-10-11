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
