#!/usr/bin/env bash
# Render a chalk-book note to an A4 PDF: notes/<name>.html → <name>.pdf
# Usage: render.sh notes/<name>.html [out-dir]    (out-dir defaults to the project root)
set -euo pipefail

src=$(realpath "$1")
root=$(dirname "$(dirname "$src")")
outdir=$(realpath "${2:-$root}")
out="$outdir/$(basename "${src%.html}").pdf"

browser=$(command -v brave || command -v chromium || command -v google-chrome-stable || command -v google-chrome || true)
[ -n "$browser" ] || { echo "No Chromium-based browser found (brave, chromium, google-chrome)." >&2; exit 1; }

# A persistent profile: Brave's very first launch on a new profile hangs in headless
# mode, every later launch is instant. So keep one profile and retry once if needed.
profile="${XDG_CACHE_HOME:-$HOME/.cache}/chalk-book-render"
mkdir -p "$profile"

print() {
  rm -f "$out"
  timeout "$1" "$browser" --headless --disable-gpu --no-first-run --no-pdf-header-footer \
    --virtual-time-budget=5000 --user-data-dir="$profile" \
    --print-to-pdf="$out" "file://$src" >/dev/null 2>&1 || true
  [ -s "$out" ]
}

print 30 || print 60 || { echo "Rendering failed: $src" >&2; exit 1; }

echo "$out ($(pdfinfo "$out" | awk '/^Pages/ {print $2}') pages)"
