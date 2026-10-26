# Chalk Book

A personal technical chalk book: one calm, skimmable note per topic, distilled from
work sessions with an AI so it can be repeated cold months later.

## View

Open `index.html` in a browser. No build step, no server. Any note can be saved as PDF
from the site's Export menu.

## Before your first note

Both parts belong together: one for you, one for the AI you work with.

- **For humans:** the notes so far are by the original author, as `critonite` and `kiwi`. Those names are theirs.
  Pick a nickname for privacy, or use your real name if you prefer. Your AI asks for it on the first session.
- **For AI:** follow "Your alias" in [CLAUDE.md](CLAUDE.md) §4: find or ask for the user's alias, save it to
  `~/.config/chalk-book/alias`, and never give anyone `critonite` or `kiwi`.

## Add a note

In any Claude Code session, say "chalk that up" (the `chalk-up` skill).

## Rules

How notes are named, written, styled and checked is all in [CLAUDE.md](CLAUDE.md).

## Checks

Turn on the pre-commit checks once per clone: `git config core.hooksPath .githooks`.
To see whether a change moved anything on the printed page: `.claude/skills/chalk-up/compare.sh`.
A readable copy is the guide note, `notes/00-chalk-book-guide.html`.

## Licence

Notes and palette: CC BY-NC 4.0. Code: MIT. Details in [LICENSE](LICENSE).
