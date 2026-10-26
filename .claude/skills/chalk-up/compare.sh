#!/usr/bin/env bash
# Did a change move anything on the printed page? Renders each note as it is in a git commit (HEAD by default)
# and as it is now, then compares page count, every page's pixels and the PDF text.
# Prints one line per note and exits non-zero if any note differs. Needs a Chromium-based browser,
# pdftoppm and pdftotext (poppler) and compare (ImageMagick).
# Usage: compare.sh [--ref <commit>] [notes/<name>.html …]    (no notes: every note)
set -euo pipefail

root=$(cd "$(dirname "$0")/../../.." && pwd)
cd "$root"
render="$root/.claude/skills/chalk-up/render.sh"
ref=HEAD
if [ "${1:-}" = "--ref" ]; then ref=$2; shift 2; fi
command -v compare >/dev/null || { echo "compare (ImageMagick) not found" >&2; exit 1; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/then" "$tmp/out-then" "$tmp/out-now"
git archive "$ref" | tar -x -C "$tmp/then"      # the whole project as it was at $ref

notes=("$@")
[ ${#notes[@]} -gt 0 ] || mapfile -t notes < <(ls notes/*.html)

differ=0
for f in "${notes[@]}"; do
  n=$(basename "$f" .html)
  if [ ! -f "$tmp/then/notes/$n.html" ]; then echo "  $n: new since $ref"; continue; fi
  if [ ! -f "notes/$n.html" ]; then echo "  $n: removed"; differ=1; continue; fi
  "$render" "$tmp/then/notes/$n.html" "$tmp/out-then" >/dev/null
  "$render" "$root/notes/$n.html" "$tmp/out-now" >/dev/null
  for side in then now; do
    pdftoppm -r 70 -png "$tmp/out-$side/$n.pdf" "$tmp/out-$side/$n"
    pdftotext -layout "$tmp/out-$side/$n.pdf" "$tmp/out-$side/$n.txt"
  done
  pages_then=$(ls "$tmp/out-then/$n"-*.png | wc -l)
  pages_now=$(ls "$tmp/out-now/$n"-*.png | wc -l)
  changed=()
  for p in "$tmp/out-then/$n"-*.png; do
    q="$tmp/out-now/$(basename "$p")"
    [ -f "$q" ] || continue
    px=$(compare -metric AE "$p" "$q" /dev/null 2>&1 | cut -d' ' -f1 || true)
    [ "$px" = "0" ] || changed+=("p$(basename "$p" .png | sed 's/.*-//'): $px px")
  done
  text=$(diff "$tmp/out-then/$n.txt" "$tmp/out-now/$n.txt" | grep -c '^[<>]' || true)
  if [ "$pages_then" = "$pages_now" ] && [ ${#changed[@]} -eq 0 ] && [ "$text" = "0" ]; then
    echo "  $n: same ($pages_now pages)"
  else
    differ=1
    echo "  $n: DIFFERS  pages $pages_then → $pages_now  ${changed[*]:-}  text lines: $text"
  fi
done

echo
if [ "$differ" -eq 0 ]; then echo "✓ every note looks as it did at $ref"; else echo "✗ some notes differ from $ref"; exit 1; fi
