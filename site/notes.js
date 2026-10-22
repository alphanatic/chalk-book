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
      { n: 3, title: "VPC networking",          status: "done" },
      { n: 4, title: "Web services (Nginx)",    status: "in progress" },
      { n: 5, title: "Ansible automation",      status: "unplanned" },
      { n: 6, title: "Terraform + CloudWatch",  status: "unplanned" },
      { n: 7, title: "Troubleshooting drills",  status: "unplanned" },
    ],
  },
  "pokedex": { name: "Pokédex",    color: "coral" },
  "claude-code": { name: "Claude Code", color: "coral" },
  "javascript": { name: "JavaScript", color: "mint" },
  "arch-linux": { name: "Arch Linux", color: "peri" },
  "anthropic": { name: "Anthropic", color: "peach" },
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
    id: "tinker-town-08-ssh-known-hosts", project: "tinker-town", n: 8, module: 3, date: "2026-10-17",
    title: "SSH Access & Known Hosts",
    summary: "Elastic IP attached, host-key fingerprint checked against the EC2 system log, ssh web alias with HostKeyAlias.",
    skills: ["ssh", "known_hosts", "host key", "fingerprint", "elastic ip", "ec2 system log", "pem", "ssh config", "HostKeyAlias", "IdentitiesOnly", "ssh-keygen -F", "ssh -G", "chmod"],
  },
  {
    id: "tinker-town-09-server-first-setup", project: "tinker-town", n: 9, module: 4, date: "2026-10-17",
    title: "Server First Setup",
    summary: "Hostname kept past cloud-init, apt upgrade to a new kernel and reboot, 1 GB swap; a doubled fstab line fixed.",
    skills: ["hostnamectl", "/etc/hosts", "cloud-init", "preserve_hostname", "apt", "apt upgrade", "needrestart", "kernel", "reboot-required", "uname", "swap", "fallocate", "mkswap", "swapon", "fstab", "findmnt", "swappiness", "sysctl", "sed", "kitty-terminfo", "xterm-kitty"],
  },
  {
    id: "tinker-town-10-ssh-hardening-ufw", project: "tinker-town", n: 10, module: 4, date: "2026-10-17",
    title: "SSH Hardening & UFW",
    summary: "sshd drop-in 01-hardening.conf checked with sshd -T before and after, UFW with 22, 80 and 443, a fallback session throughout.",
    skills: ["sshd", "sshd_config.d", "drop-in", "sshd -t", "sshd -T", "PermitRootLogin", "MaxAuthTries", "X11Forwarding", "printf", "tee", "ufw", "firewall", "fallback session", "security"],
  },
  {
    id: "tinker-town-11-nginx-first-site", project: "tinker-town", n: 11, module: 4, date: "2026-10-17",
    title: "Nginx First Site",
    summary: "nginx with its own web root, site config and log folder, default site unlinked; live on the Elastic IP.",
    skills: ["nginx", "sites-available", "sites-enabled", "server block", "default_server", "try_files", "nginx -t", "reload", "ln -s", "heredoc", "curl", "access log", "web server"],
  },
  {
    id: "tinker-town-12-free-plan-cost-check", project: "tinker-town", n: 12, module: 4, date: "2026-10-17",
    title: "Free Plan Cost Check",
    summary: "Credits, burn rate and runway on the AWS Free plan; Cost Explorer by usage type traced the spend to a NAT gateway and idle IPs.",
    skills: ["AWS Free plan", "credits", "billing", "Cost Explorer", "usage type", "EC2 - Other", "NAT gateway", "PublicIPv4:IdleAddress", "Elastic IP", "AWS Budgets", "budget credits", "Explore AWS", "delete VPC", "volume tag", "cost cleanup"],
  },
  {
    id: "tinker-town-13-deploy-user-react-app", project: "tinker-town", n: 13, module: 4, date: "2026-10-18",
    title: "Deploy User & React App",
    summary: "svc-deploy with its own key and no sudo, a web-deploy alias, Vite base and rsync of dist/, nginx location per app; pokeggdex live at /pokeggdex/.",
    skills: ["svc-deploy", "deploy user", "useradd", "install -d", "/dev/stdin", "authorized_keys", "ssh-keygen", "HostKeyAlias", "rsync", "--delete", "Vite", "base", "npm run build", "dist", "React", "nginx location", "return 301", "trailing slash", "curl", "pacman"],
  },
  {
    id: "pokedex-00-pokeggdex-at-a-glance", project: "pokedex", n: 0, context: "Cover", date: "2026-10-20",
    title: "Pokéggdex at a Glance",
    summary: "The project's cover: the anime pokeggdex in a pixel-art S.S. Anne cabin, how to run and ship it, its parts, its story, and pastel Pokéball marks.",
    skills: ["pokeggdex", "pokédex", "react", "vite", "pokéapi", "sprites", "crystal", "s.s. anne", "pixel art", "easter eggs", "rsync", "npm run dev", "npm run build", "pokéball", "svg", "use href", "bulbasaur", "charmander", "squirtle", "staryu", "exeggcute"],
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
    id: "meta-08-session-log-analysis", project: "meta", n: 8, context: "Analysis", date: "2026-10-17",
    title: "Session Logs & Rule History",
    summary: "Analysed session archives, classified identity evidence, and traced rule changes without treating repeated snapshots as independent events.",
    skills: ["jsonl", "python", "pathlib", "json", "collections.counter", "rg", "privacy", "provenance", "session history", "codex"],
  },
  {
    id: "meta-09-codex-draft-intake", project: "meta", n: 9, context: "Git", date: "2026-10-17",
    title: "Codex Draft Intake",
    summary: "Checked changes since the last commit, found a Codex draft in the root, moved it into notes/ and fixed a pre-commit catch.",
    skills: ["git status", "git diff", "git restore", "git push", "find", "bfs", "stat", "getfattr", "setsid", "dolphin", "brave", "codex", "check.sh", "pre-commit", "auto-memory", "zsh"],
  },
  {
    id: "meta-10-github-actions-ci", project: "meta", n: 10, context: "GitHub", date: "2026-10-19",
    title: "GitHub Actions CI",
    summary: "A workflow reruns check.sh on GitHub after each push, actions pinned to commits; how it differs from the pre-commit hook.",
    skills: ["github actions", "ci", "continuous integration", "workflow", "yaml", "check.yml", "actions/checkout", "actions/setup-node", "gh api", "gh run", "pdftotext", "poppler-utils", "pre-commit", "check.sh", "git clone"],
  },
  {
    id: "meta-11-licence-alias-rule", project: "meta", n: 11, context: "Sharing", date: "2026-10-19",
    title: "Licence & Alias Rule",
    summary: "Public repo kept, dual LICENSE (CC BY-NC 4.0 notes, MIT code), and a For humans / For AI rule giving each new clone its own alias.",
    skills: ["license", "licence", "mit", "cc by-nc 4.0", "creative commons", "copyright", "gh repo view", "alias", "adm-kiwi", "privacy", "check.sh", "readme", "tr", "bash redirect"],
  },
  {
    id: "meta-12-github-mark-watermark", project: "meta", n: 12, context: "Site", date: "2026-10-19",
    title: "GitHub Mark Watermark",
    summary: "The menu's Git diamond became the GitHub mark in a closed ring, coloured from the palette; grey-on-grey planned for unpushed notes.",
    skills: ["svg", "github", "octicons", "mark-github", "css", "site-theme.css", "chalk-pastel.css", "palette", "opacity", "rsvg-convert", "brave --headless", "screenshot", "magick", "zsh", "bash", "build-index.mjs", "git check-ignore", "origin/main"],
  },
  {
    id: "meta-13-menu-fold-button", project: "meta", n: 13, context: "Site", date: "2026-10-20",
    title: "Menu Fold Button & Red Private Mark",
    summary: "Each project's dot folds its notes, with a plus or minus cut through it; private notes get a red GitHub mark.",
    skills: ["fold", "collapse", "menu", "button", "css mask", "mask-image", "svg mask", "data uri", "evenodd", "localStorage", "aria-expanded", "github mark", "gitignore", "coral", "opacity", "recently viewed", "location.hash", "brave --headless", "timeout", "user-data-dir"],
  },
  {
    id: "meta-14-menu-sort-pending-notes", project: "meta", n: 14, context: "Site", date: "2026-10-20",
    title: "Menu Sort & Pending Notes",
    summary: "A–Ö, Ö–A and 01–99 sort chips, remembered; bigger rail dots that open and centre; Home Git counts; new notes wait yellow until made public or private.",
    skills: ["sort", "intl.collator", "localeCompare", "swedish", "å ä ö", "localStorage", "aria-pressed", "rail", "fold", "scrollTo", "flex gap", "font-size 0", "github mark", "pending", "notes-local.js", "build-index.mjs", "check.sh", "git ls-files", "pre-commit", "gitignore"],
  },
  {
    id: "meta-15-private-footer-web-deploy", project: "meta", n: 15, context: "Site", date: "2026-10-20",
    title: "Private Footer Links & Web Deploy",
    summary: "Five design questions decided from screenshots; personal footer links shown only on the owner's copy; guide caught up on pending notes; web server synced from HEAD.",
    skills: ["footer", "private links", "FOOTER", "dropIfMissing", "sort colours", "pending", "CLAUDE.md", "guide", "git archive", "tar", "rsync --delete", "rsync --checksum", "web deploy", "/var/www/web", "headless brave", "devtools protocol", "cdp", "remote-debugging-port", "Page.captureScreenshot", "Runtime.evaluate", "localStorage", "websocket", "node"],
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
    id: "claude-code-03-memory-access-map", project: "claude-code", n: 3, date: "2026-10-17",
    title: "Memory & Access Map",
    summary: "Auto-memory per folder versus the global CLAUDE.md, nano opened via kitty, and a map of every path Claude can reach.",
    skills: ["claude code", "memory", "MEMORY.md", "claude.md", "permissions", "filesystem", "nano", "kitty", "setsid", "pgrep", "tree", "find", "id", "zsh", "access map"],
  },
  {
    id: "claude-code-04-always-on-context", project: "claude-code", n: 4, date: "2026-10-17",
    title: "Always-On Context & Handoff Cap",
    summary: "What /usage means by always-on context, which files ride along with every prompt, and keeping only the 3 newest handoffs.",
    skills: ["claude code", "/usage", "always-on context", "tokens", "context window", "claude.md", "MEMORY.md", "handoff", "archive", "wc", "sed", "mv", "/clear", "/compact", "zsh"],
  },
  {
    id: "claude-code-05-vault-bucket", project: "claude-code", n: 5, context: "Obsidian", date: "2026-10-18",
    title: "Vault Bucket & Layout",
    summary: "The bucket became a folder in the Obsidian vault with a one-line skill; vault files sorted by topic and named seed, branch or root.",
    skills: ["claude code", "skills", "obsidian", "vault", "bucket", "inbox", "runbook", "naming", "perl", "find", "xargs", "grep", "mv", "cp -a", "rm", "zsh"],
  },
  {
    id: "claude-code-06-print-screen-skill", project: "claude-code", n: 6, context: "Skills", date: "2026-10-19",
    title: "Print Screen Skill",
    summary: "\"print screen\" captures a monitor to the clipboard for Claude to read; numbering monitors; handing sudo prompts to the user.",
    skills: ["claude code", "skills", "SKILL.md", "screenshot", "print screen", "grim", "wl-copy", "wl-paste", "hyprctl monitors", "jq", "kitty", "hyprland", "hl.dsp.exec_cmd", "monitor", "clipboard", "sudo -n"],
  },
  {
    id: "claude-code-07-obsidian-ide-connection", project: "claude-code", n: 7, context: "Obsidian", date: "2026-10-22",
    title: "Obsidian IDE Connection",
    summary: "Claude Code IDE plugin + /ide connects the CLI to Obsidian; native install on Arch; ZDOTDIR hid ~/.zshrc; the npm copy removed.",
    skills: ["claude code", "obsidian", "plugin", "claude code ide", "/ide", "claude --ide", "mcp", "websocket", "lock file", "~/.claude/ide", "jq", "install.sh", "curl", "npm", "npm view", "npm config", "npm uninstall", "allowScripts", "postinstall", "zsh", "ZDOTDIR", "whence", "sed -i", "find -empty", "parse error", "arch linux"],
  },
  {
    id: "javascript-01-footer-vs-tabs", project: "javascript", n: 1, date: "2026-10-13",
    title: "Footer Links & Tabs",
    summary: "Same .map() pattern, different job: tabs set state with onClick, the footer navigates via the URL hash.",
    skills: ["javascript", "react", "map", "keys", "useeffect", "hashchange", "aria-current", "jsx", "eslint", "npm", "npx"],
  },
  {
    id: "anthropic-01-cloud-local-skills", project: "anthropic", n: 1, date: "2026-10-18",
    title: "Cloud & Local Skills",
    summary: "Where each skill lives, what the claude.ai sync does and doesn't do, and a memory-dump that finds the repo on GitHub.",
    skills: ["claude code", "claude.ai", "skills", "SKILL.md", "sync", "manifest.json", "anthropic-skills", "memory-dump", "github", "raw.githubusercontent.com", "public repo", "backup", "ls", "node", "git ls-files", "git rev-parse", "gh repo view", "zip", "unzip", "curl", "zsh"],
  },
  {
    id: "00-chalk-book-guide", project: "meta", n: 0, date: "2026-10-11",
    title: "Chalk Book Guide",
    summary: "Purpose, structure and conventions of the chalk book. Read-only copy of CLAUDE.md.",
    skills: ["guide", "conventions", "naming", "design"],
  },
];
