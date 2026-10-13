---
name: memory-dump
description: Turn a session of work (commands, configs, fixes, things learned) into a chalk-book note, a styled A4 HTML note in the chalk-pastel look, listed on the chalk-book site. Use when the user says "memory-dump", "dump this session", "log this", "make a note of this" or similar, or asks to add something to the chalk book.
---

# Memory dump

Distil a session of work into one or more chalk-book notes: skimmable, soft-looking pages
the user can revisit later on the chalk-book site, and save as PDF from there. The project rules
live in `CLAUDE.md`; this skill is the procedure. All paths below are relative to the chalk-book root.

Files this skill uses:

| File | Role |
|---|---|
| `CLAUDE.md` | The rules: naming, project list, note anatomy, writing style |
| `chalk-pastel.css` | The palette. The only source of colour in notes |
| `notes/note-layout.css` | Shared layout and components |
| `site/notes.js` | The catalogue the site lists: projects and notes |
| `template.html` (this folder) | The skeleton every note starts from |
| `render.sh` (this folder) | HTML → PDF, for checking pages |
| `check.sh` (this folder) | The checks every commit must pass: privacy, admin names, colours, catalogue |

## 1. Read the rules

- Read `CLAUDE.md` in full, including the project list.
- Read `chalk-pastel.css`. The user may have changed it since the last note. If a variable
  that `note-layout.css` uses has been renamed or removed, tell the user and fix the layout
  file to match; never edit `chalk-pastel.css` itself.
- Read `site/notes.js` to see the existing projects, their next note numbers and any roadmap modules.

## 2. Gather the material

The material is whatever the user points at: usually the current session, wherever it ran,
or pasted text, attached files, or a summary from another chat. Collect:

- what was built or solved, and why
- every command in the order it was run, local vs. remote
- config files as they finally ended up
- errors hit, their cause and the fix
- concepts explained along the way
- names and paths that were created
- the date the work happened

If something essential is missing (e.g. the final version of a config file), ask once,
briefly. Otherwise work with what is there.

## 3. Plan

- **Pick the project** from the project list in `CLAUDE.md`. A new project needs a short slug
  and a display name; ask the user, then add it to the list and to `CHALK_PROJECTS`.
- **Split by topic.** One topic per note. A session covering SSH and cron becomes two notes.
- **Name each note** `<project>-<NN>-<topic>.html`, continuing the project's numbering.
- **Pick the emphasis.** Is this **recurring** knowledge (make it a quick reference: patterns,
  tables) or **one-off** (make it a full recipe: every step, every flag)? Often both.
- Tell the user the plan in one line (note names and topics), then continue without waiting
  unless something is ambiguous.

## 4. Write

For each note:

1. `cp .claude/skills/memory-dump/template.html notes/<name>.html`
2. Write in chalk markup; the syntax is in the comment at the top of `notes/note.js`. Replace every `{{…}}`.
   The title, eyebrow, page footer and legend are made from the note's `site/notes.js` entry (§5) and its
   content, so the note has no header markup.
3. Keep the section order. Delete the examples the note doesn't use.
4. Follow the writing style in `CLAUDE.md`. The essentials:
   - every command has a comment after two spaces: `cmd  # what it does, and its flags`. `note.js` lines them up
   - config blocks contain no comments. Use annotated lines (`code  »  note`) or a table instead
   - real names, paths and error messages; keep the mistakes as bug cards
   - short sentences, calm tone, no emoji
5. **Colour only through palette classes** (`local`, `remote`, `config`, `concept`, `gotcha`, `best`, `paths`,
   `console`): as a block type, a tag, or `{class}`. No hex values.
6. **Follow the privacy rule** in `CLAUDE.md` §4: no access secrets, placeholders for anything that
   locates a host or account, nothing from the user's private life.
7. Each `###` step starts a group that stays on one page. Put `{keep}` before a section heading whose table or
   cards should stay with it, and `---` to end a group early.
8. Link related notes with `[[note-id]]`, or `[[note-id|text]]` for other link text.
9. Anything the markup can't say (a concept chain, a two-column layout) goes in a ```` ```html ```` block.

## 5. Add it to the site

Add one entry per note to `CHALK_NOTES` in `site/notes.js`: `id` (file name without `.html`),
`project`, `n`, `module` (if the project has a roadmap), `date`, `title`, a one-line `summary`
and `skills` (tools, topics and every distinctive command in the note: what people would search for). If the note finishes a roadmap module,
set that module's `status` to `"done"`.

Then rebuild the search index so the new text is searchable: `node site/build-index.mjs`.

## 6. Check

- Render each note to the scratchpad and look at every page:
  ```
  .claude/skills/memory-dump/render.sh notes/<name>.html <scratchpad>
  pdftoppm -r 70 -png <scratchpad>/<name>.pdf <scratchpad>/p
  ```
  Fix awkward breaks, overflowing or wrapping code lines (about 100 characters fit), near-empty pages.
- Run the checks; every problem must be fixed before committing:
  ```
  .claude/skills/memory-dump/check.sh
  ```
  It rebuilds the search index and checks placeholders, hex colours, secrets, public IPs, account IDs,
  emails, admin accounts (only `adm-kiwi`), the private block list and the catalogue, in notes and PDFs.
- After changing shared files (`note.js`, `note-layout.css`, `chalk-pastel.css`) or existing notes, run
  `.claude/skills/memory-dump/compare.sh`: every note it reports as different must be one you meant to change.
- Open `index.html#<name>` and confirm the note appears in the menu and displays.
- Re-render after every fix. PDFs are not kept; the site's Export → Save as PDF makes them on demand.

## 7. Hand over

List the new and changed files and confirm `check.sh` passed. Any git step (commit, push) follows the user's own
git preferences (their global `CLAUDE.md` or memory), as `CLAUDE.md` §7 says. If they have none, ask before any git action.

## 8. Follow-ups

- If the session changed a convention recorded in a **reference** note (e.g. naming
  conventions), say so. The reference should be updated too, but only with the user's go-ahead.
- Never edit, rename or delete existing notes unless asked.

## 9. Report

End with a short list: each new note as a link, its page count, and one line on what it covers.
