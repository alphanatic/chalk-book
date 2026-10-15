/* The chalk-book catalogue: every project and note the site lists.
   memory-dump adds one note entry per new note. Loaded as a script (not fetched as JSON)
   so index.html also works when opened straight from disk.

   Projects  name, palette colour, optional status and modules (the planned roadmap)
   Notes     id = file name without .html · project = key into CHALK_PROJECTS · n = number in the project
             module = roadmap module it belongs to (optional) · context = a short tag for the eyebrow when there is
             no module (optional) · date = YYYY-MM-DD */

window.CHALK_PROJECTS = {
  "tinker-town": {
    name: "Project Tinker Town", color: "lav", status: "in progress",
    summary: "Self-paced AWS Linux sysadmin lab in eu-north-1, run as a one-week crash course.",
    modules: [
      { n: 1, title: "EC2 / SSH hardening",     status: "done" },
      { n: 2, title: "Storage / LVM",           status: "done" },
      { n: 3, title: "VPC networking",          status: "in progress" },
      { n: 4, title: "Web services (Nginx)",    status: "planned" },
      { n: 5, title: "Ansible automation",      status: "planned" },
      { n: 6, title: "Terraform + CloudWatch",  status: "planned" },
      { n: 7, title: "Troubleshooting drills",  status: "planned" },
    ],
  },
  "pokedex": { name: "Pokédex",    color: "sky" },
  "claude-code": { name: "Claude Code", color: "coral" },
  "javascript": { name: "JavaScript", color: "mint" },
  "meta":    { name: "Chalk Book", color: "butter" },
};

window.CHALK_NOTES = [
  {
    id: "tinker-town-01-aws-ssh-firewall", project: "tinker-town", n: 1, module: 1, date: "2026-08-30",
    title: "AWS, SSH & Firewall",
    summary: "Free-tier Ubuntu EC2 in eu-north-1, key-only SSH from one IP, UFW firewall.",
    skills: ["aws", "ec2", "ssh", "ufw", "security groups", "sshd_config", "ed25519", "systemctl", "chmod"],
  },
  {
    id: "tinker-town-02-linux-users-accounts", project: "tinker-town", n: 2, module: 1, date: "2026-08-30",
    title: "Linux Users & Accounts",
    summary: "Sudo admin account adm-kiwi and no-login service account svc-disk-report, least privilege.",
    skills: ["linux", "users", "groups", "sudo", "service accounts", "least privilege", "/etc/passwd", "adduser", "useradd", "usermod", "deluser", "chown", "chmod", "id"],
  },
  {
    id: "tinker-town-03-systemd-service", project: "tinker-town", n: 3, module: 1, date: "2026-08-30",
    title: "Systemd Service",
    summary: "Custom hello-loop.service from scratch; fixed shebang, permission and restart-limit bugs.",
    skills: ["systemd", "bash", "unit files", "logging", "troubleshooting", "systemctl", "chmod", "chown"],
  },
  {
    id: "tinker-town-04-cron-logrotate", project: "tinker-town", n: 4, module: 1, date: "2026-08-30",
    title: "Cron & Logrotate",
    summary: "Scheduled disk report via cron, logrotate with compression and retention, run as a service account.",
    skills: ["cron", "logrotate", "bash", "permissions", "service accounts", "crontab", "chown", "chmod"],
  },
  {
    id: "tinker-town-05-naming-conventions", project: "tinker-town", n: 5, module: 1, date: "2026-08-30",
    title: "Naming Conventions",
    summary: "Reference: naming patterns for AWS resources, accounts, systemd units and log files.",
    skills: ["naming", "conventions", "reference", "aws", "cloud adoption framework"],
  },
  {
    id: "tinker-town-06-storage-filesystems", project: "tinker-town", n: 6, module: 2, date: "2026-08-30",
    title: "Storage & Filesystems",
    summary: "Second EBS volume mounted via fstab and grown live; full LVM stack built, grown and torn down.",
    skills: ["aws", "ebs", "lvm", "fstab", "ext4", "filesystems", "mount", "lsblk", "blkid", "mkfs.ext4", "df", "umount", "resize2fs", "pvcreate", "vgcreate", "lvcreate", "lvextend"],
  },
  {
    id: "tinker-town-07-vpc-networking", project: "tinker-town", n: 7, module: 3, date: "2026-10-14",
    title: "VPC Networking & EC2 Launch",
    summary: "Custom VPC by hand: subnet, internet gateway, route table, security group; t4g.micro Ubuntu arm64 with an ED25519 .pem key.",
    skills: ["aws", "vpc", "subnet", "internet gateway", "route table", "security groups", "ec2", "key pair", "ed25519", "pem", "t4g", "graviton", "arm64", "imdsv2", "gp3", "elastic ip", "tags", "cost", "naming", "chmod", "mv"],
  },
  {
    id: "pokedex-01-git-manual-push", project: "pokedex", n: 1, context: "Git", date: "2026-10-11",
    title: "Git: Manual Commit & Push",
    summary: "Manual commit 44e0d5c in pokedex, git status, commit messages and trailers, .git/index with xxd.",
    skills: ["git", "github", "https", "personal access token", "xxd", "pacman", "pass"],
  },
  {
    id: "pokedex-02-project-story", project: "pokedex", n: 2, date: "2026-10-13",
    title: "Project Story & Private Notes",
    summary: "personal-notes/ renamed to .prog/ via .git/info/exclude; story.md tells the original intent and six direction changes.",
    skills: ["git", ".git/info/exclude", "sed", "grep", "markdown", "project history"],
  },
  {
    id: "meta-01-site-build", project: "meta", n: 1, date: "2026-10-12",
    title: "Site & Workflow Build",
    summary: "Rename to Chalk Book, memory-dump pointer skill, HTML notes, dark static site with search, private pages, push.",
    skills: ["html", "css", "javascript", "static site", "postMessage", "file://", "search", "claude code skills", "git", "gitignore", "pymupdf", "node", "gh", "pdftoppm", "pgrep"],
  },
  {
    id: "meta-02-privacy-checks", project: "meta", n: 2, date: "2026-10-12",
    title: "Privacy Rule & Check Script",
    summary: "Privacy rule in CLAUDE.md, every admin account masked as adm-kiwi, check.sh enforces it before each commit.",
    skills: ["privacy", "check.sh", "bash", "grep", "pymupdf", "pdf", "git", "secrets", "claude code", "python3", "diff"],
  },
  {
    id: "meta-03-readme-git-rules", project: "meta", n: 3, date: "2026-10-13",
    title: "README & Git Rules",
    summary: "README.md that points to CLAUDE.md; git rules follow each user's own preferences; amend, then push.",
    skills: ["git", "readme", "commit messages", "git commit --amend", "git stash", "claude code", "claude.md", "node", "pdftotext"],
  },
  {
    id: "meta-04-claude-md-cleanup", project: "meta", n: 4, date: "2026-10-13",
    title: "CLAUDE.md Cleanup",
    summary: "Read-only audit, then CLAUDE.md cut 17% to rules only; stale facts fixed and the guide synced.",
    skills: ["claude.md", "documentation", "wc", "grep", "ugrep", "audit", "claude code", "node", "python3"],
  },
  {
    id: "meta-05-complete-tasks-page", project: "meta", n: 5, date: "2026-10-13",
    title: "Complete Tasks Page",
    summary: "Complete Tasks rebuilt in the backlog's look, done items only; legacy items renamed; natural sort.",
    skills: ["html", "css", "sed", "intl.collator", "sorting", "headless browser", "zsh", "backlog", "brave", "grep", "python3"],
  },
  {
    id: "meta-06-token-usage", project: "meta", n: 6, date: "2026-10-13",
    title: "Token Usage & Search Ladder",
    summary: "Section ids on every note, command names in the catalogue, a four-step search ladder in CLAUDE.md; grep -P fix.",
    skills: ["tokens", "search", "claude.md", "grep", "ugrep", "grep -P", "sed", "wc", "node", "zsh", "html ids", "preferences"],
  },
  {
    id: "meta-07-chalk-markup", project: "meta", n: 7, date: "2026-10-13",
    title: "Chalk Markup Notes",
    summary: "Notes rewritten as Markdown-like chalk markup that note.js renders; all 18 converted, every page pixel-identical, −34%.",
    skills: ["chalk markup", "markdown", "html", "javascript", "renderer", "note.js", "node", "converter", "imagemagick", "compare", "pdftotext", "pdftoppm", "regression testing", "build-index", "template", "tokens"],
  },
  {
    id: "claude-code-01-skill-vetting", project: "claude-code", n: 1, date: "2026-10-13",
    title: "Skill & Plugin Vetting",
    summary: "Quarantine, SkillSpector scan, human review, then install at local scope or delete; a CLAUDE.md rule and ask gate.",
    skills: ["claude code", "skills", "plugins", "skillspector", "prompt injection", "ai safety", "supply chain", "docker", "uv", "pacman", "reflector"],
  },
  {
    id: "claude-code-02-untrusted-content-triage", project: "claude-code", n: 2, date: "2026-10-13",
    title: "Untrusted Content Triage",
    summary: "Claim versus reach: green proceeds, amber asks, red is refused and logged; a CLAUDE.md layer plus deny/ask rules.",
    skills: ["claude code", "prompt injection", "ai safety", "claude.md", "settings.json", "permissions", "sandbox", "grep", "unicode"],
  },
  {
    id: "javascript-01-footer-vs-tabs", project: "javascript", n: 1, date: "2026-10-13",
    title: "Footer Links & Tabs",
    summary: "Same .map() pattern, different job: tabs set state with onClick, the footer navigates via the URL hash.",
    skills: ["javascript", "react", "map", "keys", "useeffect", "hashchange", "aria-current", "jsx", "eslint", "npm", "npx"],
  },
  {
    id: "00-chalk-book-guide", project: "meta", n: 0, date: "2026-10-11",
    title: "Chalk Book Guide",
    summary: "Purpose, structure and conventions of the chalk book. Read-only copy of CLAUDE.md.",
    skills: ["guide", "conventions", "naming", "design"],
  },
];
