/* The risk scale: how risky the work behind a note was, from 0 (nothing changed) to 6 (done and can't be undone).
   The single definition: the site, the notes, check.sh and the chalk-up, harden and milestone skills all read it.
   A grade is the riskiest step taken, not the outcome: a force push that went fine is still a 5.
   Each grade has a tile in risk-tiles.svg (risk-tiles.svg#t0 … #t6): the ground in its colour, cracking in the next.

   Your own scale: copy this object into site/risk-local.js (gitignored) and change names, meanings or the tiles file;
   it replaces this one wherever it loads. Keep 7 grades, numbered 0–6, so existing notes keep their meaning.

   Grades   name = the colour, as said aloud · means = when a step gets this grade
   tiles    the SVG file, from site/ */

window.CHALK_RISK = {
  tiles: "risk-tiles.svg",
  grades: [
    { name: "blue",     means: "Read only: nothing changed, and nothing sensitive read (no secrets, personal or customer data)" },
    { name: "green",    means: "New or changed files of our own, local and easy to undo" },
    { name: "sungold",  means: "Shared rules or config that later sessions follow: CLAUDE.md, AGENTS.md, skills, hooks, indexes" },
    { name: "orange",   means: "Beside someone else's work or in a customer's folder; many files at once; reading secrets, personal or customer data" },
    { name: "red",      means: "Outward or hard to undo: commits, pushes, publishing, deploys and DNS others rely on, another machine, " +
                               "opening access (ports, security groups, IAM, public buckets, sharing links)" },
    { name: "darkred",  means: "Can destroy work or rewrite the past: history rewrites, force pushes, reset --hard, deleting data, credentials" },
    { name: "bedrock",  means: "Done and can't be undone: data lost with no backup, a secret or personal or customer data made public" },
  ],
};
