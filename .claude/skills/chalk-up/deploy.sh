#!/usr/bin/env bash
# Publish the committed site to the web server, then check that it is live.
# Only files in HEAD go up (git archive), so private notes, notes-local.js and .progress/ never can.
# --chmod sets folders 755 and files 644 on the server, whatever the temp folder's mode: on 2026-10-22 a
# 700 folder from mktemp -d made /var/www/web/ unreadable for nginx, and the site answered 403.
# Usage: deploy.sh [-n | --check]    (-n: dry run, list what would change · --check: only the live checks)
set -euo pipefail

root=$(cd "$(dirname "$0")/../../.." && pwd)
cd "$root"
host=web-deploy
dest=/var/www/web
mode=${1:-deploy}

# Folder and file modes on the server, then HTTP status from outside, for a few files nginx must serve
check() {
  local bad url p code failed=0
  bad=$(ssh -T "$host" "find $dest \( -type d ! -perm 755 \) -o \( -type f ! -perm 644 \)")
  if [[ -n $bad ]]; then echo "FAIL  wrong mode (want folders 755, files 644):"; echo "$bad" | head; failed=1; fi
  url="http://$(ssh -G "$host" 2>/dev/null | awk '$1 == "hostname" { print $2 }')"
  for p in / /index.html /site/app.js /notes/note.js; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url$p")
    if [[ $code == 200 ]]; then echo "ok    $code  $p"; else echo "FAIL  $code  $p"; failed=1; fi
  done
  return $failed
}

if [[ $mode == --check ]]; then check; exit; fi

[[ -z $(git status --porcelain) ]] || echo "Uncommitted changes stay local: only HEAD $(git rev-parse --short HEAD) goes up."
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
git archive HEAD index.html chalk-pastel.css LICENSE site notes | tar -x -C "$tmp"
if [[ -e $tmp/site/notes-local.js || -e $tmp/site/search-local.js ]]; then
  echo "FAIL  a private catalogue file is committed; nothing was sent"; exit 1
fi

opts=(-az --delete --chmod=D755,F644)
if [[ $mode == -n ]]; then rsync "${opts[@]}" -n -i "$tmp"/ "$host:$dest/"; exit; fi
rsync "${opts[@]}" "$tmp"/ "$host:$dest/"
left=$(rsync "${opts[@]}" -c -n -i "$tmp"/ "$host:$dest/" | wc -l)   # -c checksum: nothing left to send
if [[ $left != 0 ]]; then echo "FAIL  $left differences left after the sync"; exit 1; fi
check && echo "Deployed $(git rev-parse --short HEAD)."
