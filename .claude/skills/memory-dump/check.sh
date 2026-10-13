#!/usr/bin/env bash
# Check the chalk book before a commit: placeholders, colours, privacy, admin names, catalogue.
# Prints "file:line  reason" for each problem and exits non-zero if there is any.
# Usage: check.sh [--render]    (--render also renders notes changed since the last commit)
set -euo pipefail

root=$(cd "$(dirname "$0")/../../.." && pwd)
cd "$root"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail() { echo "  $1"; echo x >> "$tmp/problems"; }   # counted in a file: report runs in a pipe

# Prints each "file:line:match" from grep as a failure with a reason
report() { local why=$1; while IFS= read -r hit; do fail "$hit  $why"; done; }

# Text files that are committed, plus the text of every committed PDF (extracted to a temp folder)
mapfile -t text_files < <(git ls-files -- '*.html' '*.js' '*.md' '*.css' '*.sh' '*.json' | grep -v '^site/search-index.js$')
mkdir "$tmp/pdf"
pdf_texts=()
while IFS= read -r pdf; do
  out="$tmp/pdf/${pdf//\//__}.txt"
  pdftotext -layout "$pdf" "$out"
  pdf_texts+=("$out")
done < <(git ls-files -- '*.pdf')
scan=("${text_files[@]}" "${pdf_texts[@]}")

# Shows a PDF's extracted text as the PDF's own path
unmap() { sed -E "s|^$tmp/pdf/([^:]*)\.txt:|\1:|; s|__|/|g"; }

echo "1. Search index"
node site/build-index.mjs >/dev/null && echo "  rebuilt"

echo "2. Placeholders"
grep -nH '{{' notes/*.html | report "leftover {{…}} placeholder" || true

echo "3. Colours"
grep -nHE '(style="[^"]*|:\s*)#[0-9a-fA-F]{3,6}\b' notes/*.html notes/*.css | report "hard-coded hex colour" || true

echo "4. Access"
grep -nHoE 'BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}' "${scan[@]}" | unmap | report "secret (key or token)" || true

echo "5. Location"
grep -nHoE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' "${scan[@]}" | unmap \
  | grep -vE ':(0\.0\.0\.0|10\.[0-9.]+|127\.[0-9.]+|192\.168\.[0-9.]+|172\.(1[6-9]|2[0-9]|3[01])\.[0-9.]+)$' \
  | report "public IP: use <instance-ip> or <my-ip>" || true
grep -nHoE '(^|[^0-9a-fA-F-])[0-9]{12}([^0-9a-fA-F-]|$)' "${scan[@]}" | unmap | sed -E 's/:[^0-9]?([0-9]{12})[^0-9]?$/:\1/' | report "12-digit number: account ID?" || true
grep -nHoE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "${scan[@]}" | unmap \
  | grep -vE ':(git@github\.com|noreply@anthropic\.com)$' | report "email address" || true

echo "6. Admin accounts"
grep -nHoiE '\badm(in)?[-_.](&lt;|<)?[a-z0-9]+(&gt;|>)?|\b[a-z0-9]+[-_]admin\b' "${scan[@]}" | unmap \
  | grep -vE ':adm-kiwi$' | report "admin account must be written adm-kiwi" || true

echo "7. Private block list"
blocklist="${XDG_CONFIG_HOME:-$HOME/.config}/chalk-book/blocklist"
if [ -s "$blocklist" ]; then
  grep -nHoiwFf <(grep -v '^\s*\(#\|$\)' "$blocklist") "${scan[@]}" site/search-index.js | unmap \
    | sort -u | report "word from the private block list" || true
else
  echo "  skipped (no $blocklist)"
fi

echo "8. Catalogue"
node - <<'EOF' | report "catalogue" || true
const fs = require("fs");
global.window = {};
require(process.cwd() + "/site/notes.js");
const ids = window.CHALK_NOTES.map(n => n.id);
const files = fs.readdirSync("notes").filter(f => f.endsWith(".html")).map(f => f.slice(0, -5));
for (const f of files) if (!ids.includes(f)) console.log(`notes/${f}.html: no entry in CHALK_NOTES`);
for (const n of window.CHALK_NOTES) {
  if (!files.includes(n.id)) console.log(`site/notes.js: ${n.id} has no file in notes/`);
  if (ids.indexOf(n.id) !== ids.lastIndexOf(n.id)) console.log(`site/notes.js: ${n.id} listed twice`);
  const m = n.id.match(/^(?:([a-z0-9-]+?)-)?(\d{2})-/);
  if (m && +m[2] !== n.n) console.log(`site/notes.js: ${n.id} has n: ${n.n}, file says ${m[2]}`);
  if (m && m[1] && m[1] !== n.project) console.log(`site/notes.js: ${n.id} has project: ${n.project}`);
  if (!window.CHALK_PROJECTS[n.project]) console.log(`site/notes.js: ${n.id} uses unknown project ${n.project}`);
}
EOF

echo "9. Viewport"
grep -L 'name="viewport"' notes/*.html | sed 's/$/:1/' | report "no viewport tag: phones show it zoomed out" || true

if [ "${1:-}" = "--render" ]; then
  echo "10. Render"
  changed=$( { git diff --name-only HEAD -- 'notes/*.html'; git ls-files --others --exclude-standard -- 'notes/*.html'; } | sort -u)
  [ -n "$changed" ] || echo "  no changed notes"
  for f in $changed; do
    [ -f "$f" ] && "$root/.claude/skills/memory-dump/render.sh" "$f" "$tmp" | sed 's/^/  /'
  done
fi

problems=0; [ -f "$tmp/problems" ] && problems=$(wc -l < "$tmp/problems")
echo
if [ "$problems" -eq 0 ]; then echo "✓ all checks passed"; else echo "✗ $problems problem(s)"; exit 1; fi
