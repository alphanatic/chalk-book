/* The chalk-book catalogue: every project and note the site lists.
   memory-dump adds one note entry per new note. Loaded as a script (not fetched as JSON)
   so index.html also works when opened straight from disk.

   Projects  name, palette colour, optional status and modules (the planned roadmap)
   Notes     id = file name without .html · project = key into CHALK_PROJECTS · n = number in the project
             module = roadmap module it belongs to (optional) · date = YYYY-MM-DD */

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
  "meta":    { name: "Chalk Book", color: "butter" },
};

window.CHALK_NOTES = [
  {
    id: "tinker-town-01-aws-ssh-firewall", project: "tinker-town", n: 1, module: 1, date: "2026-08-30",
    title: "AWS, SSH & Firewall",
    summary: "Free-tier Ubuntu EC2 in eu-north-1, key-only SSH from one IP, UFW firewall.",
    skills: ["aws", "ec2", "ssh", "ufw", "security groups", "sshd_config", "ed25519"],
  },
  {
    id: "tinker-town-02-linux-users-accounts", project: "tinker-town", n: 2, module: 1, date: "2026-08-30",
    title: "Linux Users & Accounts",
    summary: "Sudo admin account adm-kiwi and no-login service account svc-disk-report, least privilege.",
    skills: ["linux", "users", "groups", "sudo", "service accounts", "least privilege", "/etc/passwd"],
  },
  {
    id: "tinker-town-03-systemd-service", project: "tinker-town", n: 3, module: 1, date: "2026-08-30",
    title: "Systemd Service",
    summary: "Custom hello-loop.service from scratch; fixed shebang, permission and restart-limit bugs.",
    skills: ["systemd", "bash", "unit files", "logging", "troubleshooting"],
  },
  {
    id: "tinker-town-04-cron-logrotate", project: "tinker-town", n: 4, module: 1, date: "2026-08-30",
    title: "Cron & Logrotate",
    summary: "Scheduled disk report via cron, logrotate with compression and retention, run as a service account.",
    skills: ["cron", "logrotate", "bash", "permissions", "service accounts"],
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
    skills: ["aws", "ebs", "lvm", "fstab", "ext4", "filesystems", "mount"],
  },
  {
    id: "pokedex-01-git-manual-push", project: "pokedex", n: 1, date: "2026-10-11",
    title: "Git: Manual Commit & Push",
    summary: "Manual commit 44e0d5c in pokedex, git status, commit messages and trailers, .git/index with xxd.",
    skills: ["git", "github", "https", "personal access token", "xxd", "pacman"],
  },
  {
    id: "meta-01-site-build", project: "meta", n: 1, date: "2026-10-12",
    title: "Site & Workflow Build",
    summary: "Rename to Chalk Book, memory-dump pointer skill, HTML notes, dark static site with search, private pages, push.",
    skills: ["html", "css", "javascript", "static site", "postMessage", "file://", "search", "claude code skills", "git", "gitignore", "pymupdf"],
  },
  {
    id: "00-chalk-book-guide", project: "meta", n: 0, date: "2026-10-11",
    title: "Chalk Book Guide",
    summary: "Purpose, structure and conventions of the chalk book. Read-only copy of CLAUDE.md.",
    skills: ["guide", "conventions", "naming", "design"],
  },
];
