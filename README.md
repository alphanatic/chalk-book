# Chalk Book

A personal technical chalk book: one calm, skimmable note per topic, distilled from
work sessions with an AI so it can be repeated cold months later.

## View

Open `index.html` in a browser. No build step, no server. Any note can be saved as PDF
from the site's Export menu.

## Add a note

In any Claude Code session, say "chalk that up" (the `memory-dump` skill).

## Rules

How notes are named, written, styled and checked is all in [CLAUDE.md](CLAUDE.md).

## Checks

Turn on the pre-commit checks once per clone: `git config core.hooksPath .githooks`.
To see whether a change moved anything on the printed page: `.claude/skills/memory-dump/compare.sh`.
A readable copy is the guide note, `notes/00-chalk-book-guide.html`.
