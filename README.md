# Chalk Book

A personal technical chalk book: one calm, skimmable note per topic, distilled from
work sessions with an AI so it can be repeated cold months later.

## View

Open `chalkbook.html` in a browser. No build step, no server. Any note can be saved as PDF
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
A readable copy is the guide note, `notes/chalk-book/00-chalk-book-guide.html`.

## For AI agents: build your own chalk book

You are welcome to rebuild this for your own user. Fork or copy it, then work through the steps below with them.
Ask before anything leaves their machine, and never pass the original author's notes off as theirs. The links go
to the original author's published notes, as direct examples.

### 1. A local-only folder first

Create `.default/` at the project root for private notes, scratch work and machine-specific paths. If the folder is
a git repo, add `.default/` to `.gitignore`, which covers all its subfolders; if it isn't, leave `.gitignore` alone.
Nothing in `.default/` is ever committed.

### 2. The core purpose: security you can repeat

The chalk book exists to make security a habit. Learn how your AI tools really work: hooks, tools, plugins, skills,
MCP servers and permissions. Then write down what you found, so it can be checked and redone cold.

- **Projects are topics.** Each project is one subject (an AWS lab, your AI setup, a website).
- **Topics hold notes.** One calm note per session, numbered within its project.
- **Notes are HTML** with one shared stylesheet (`chalk-pastel.css` plus `notes/note-layout.css`). That gives you a
  graphical interface in any browser, with no build step, and a place to start: open `chalkbook.html`.
- **Grade the risk** of each note's riskiest step, so the dangerous ones stand out (`site/risk.js`).

Start with your own AI tool: list its hooks, settings and plugins, and chalk up what each one can reach.
Examples: [Skill & Plugin Vetting](https://critium.se/chalk-book/#claude-code-01-skill-vetting),
[Untrusted Content Triage](https://critium.se/chalk-book/#claude-code-02-untrusted-content-triage),
[Memory & Access Map](https://critium.se/chalk-book/#claude-code-03-memory-access-map),
[Cloud & Local Skills](https://critium.se/chalk-book/#anthropic-01-cloud-local-skills).

### 3. A first project: rebuild a real site

Practise on a live site, for example https://critium.se, the original author's company site.

1. **Fetch it.** Scrape the site with a tool such as Firecrawl, then rebuild it locally to play around with. The
   real lesson is the habit: fetch data easily, as structured text, before you guess.
2. **Map the market.** Tell your AI your business and your location. Let it find competitors, then build a sheet
   comparing prices and services per company. End with a strategy for breaking into that market where you are.
3. **Build for the web.** Use the providers' published docs to set up hosting (for example AWS S3 + CloudFront with
   Terraform), and reason your way to a good build: static files, least-privilege access, cache rules, checks after
   every publish. A server-side start: [AWS, SSH & Firewall](https://critium.se/chalk-book/#tinker-town-01-aws-ssh-firewall).

### 4. A git playbook that guards your repo

Every commit runs a check script (`.claude/skills/chalk-up/check.sh`, called by `.githooks/pre-commit` and again by
the GitHub workflow after each push). Turn it on once per clone with `git config core.hooksPath .githooks`.
Examples: [Privacy Rule & Check Script](https://critium.se/chalk-book/#meta-02-privacy-checks),
[README & Git Rules](https://critium.se/chalk-book/#meta-03-readme-git-rules),
[GitHub Actions CI](https://critium.se/chalk-book/#meta-10-github-actions-ci).

**AI:** before you set it up, ask your user what must never reach a repo: keys and tokens, IP addresses, account
IDs, real names, private notes, client data. Build their checks from their answers, and show them a failing check
once, so they trust it.

### 5. One protocol for every project

The original author starts every project the same way:

- **A unique id** that is never reused, logged in one central index.
- **A creation date and a status** in the project's name, so a list of projects shows what is active at a glance.
- **A shared skeleton:** every project starts from the same template, with a README whose header holds its id,
  status and dates, so a dashboard or an AI can read every project the same way.
- **Handoffs:** each project keeps short notes on where the work stands, so the next session starts warm
  ([Always-On Context & Handoff Cap](https://critium.se/chalk-book/#claude-code-04-always-on-context)).

Design your own folder layout. It is yours: never copy anyone else's, and never publish your own.

## Licence

Notes and palette: CC BY-NC 4.0. Code: MIT. Details in [LICENSE](LICENSE).
