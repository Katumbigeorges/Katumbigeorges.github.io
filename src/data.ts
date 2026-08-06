// ── Single source of truth for site content. Edit here. ─────────────────────

/**
 * The site's own origin, with no trailing slash. Everything that needs an
 * absolute URL derives from this — vite.config.ts (RSS), the per-page <Head>
 * tags, and the sitemap. Moving to a custom domain should be a one-line change
 * here plus the two files in public/ that cannot import TypeScript
 * (robots.txt and security.txt).
 */
export const SITE_URL = "https://katumbigeorges.github.io";

/** Shared social-card metadata; per-page <Head> blocks override title/description. */
export const siteMeta = {
  title: "Georges Katumbi — Security Researcher · Red Team · CTF",
  description:
    "Georges Katumbi (Moonw4lk) — security researcher and CTF player working on offensive security, cryptography, reverse engineering, and LLM-agent security.",
  social:
    "Offensive security, cryptography, reverse engineering, and LLM-agent security. Team Moonw4lk.",
};

export const profile = {
  name: "Georges Katumbi",
  handle: "moonw4lk",
  roles: [
    "Security Researcher",
    "Red Teamer",
    "CTF Player",
    "Reverse Engineer",
    "LLM-Agent Security",
  ],
  tagline:
    "I break things to understand them — ciphers, binaries, and the systems around AI.",
  location: "Kigali, Rwanda",
  availability: "Open to security research & red-team collaborations",
};

export const socials = {
  github: "https://github.com/Katumbigeorges",
  linkedin: "https://www.linkedin.com/in/georgeskatumbi",
  email: "georgeskatumbi90@gmail.com",
};

// Repositories the site links to in its own right. `site` is this site's source —
// the footer's "source" link means *this*, not the profile page.
export const repos = {
  site: "https://github.com/Katumbigeorges/Katumbigeorges.github.io",
};

// Collaborators, credited where their work appears. Their accounts are theirs,
// not alternate identities of mine — keep them out of `socials` and JSON-LD.
export const collaborators = {
  amos: { name: "Amos Akogbe", handle: "w4lk3r04", url: "https://github.com/w4lk3r04" },
};

/**
 * Single source of truth for the page sections.
 * Nav, the terminal's `goto`, and its help text all read this — keeping
 * three hand-maintained copies in sync is what broke `goto writeups`.
 */
export const SECTIONS = [
  { id: "whoami", label: "whoami" },
  { id: "ops", label: "ops" },
  { id: "writeups", label: "writeups" },
  { id: "projects", label: "projects" },
  { id: "arsenal", label: "arsenal" },
  { id: "research", label: "research" },
  { id: "contact", label: "contact" },
] as const;

export const SECTION_IDS = ["home", ...SECTIONS.map((s) => s.id)];

// whoami — short, honest, first person.
export const whoami: string[] = [
  "Security researcher and CTF player who is most at home where cryptography, reverse engineering, and exploitation meet code.",
  "I compete with Team Moonw4lk, write my own solve scripts, and publish full write-ups afterwards so the reasoning is reproducible — not just the flag.",
  "Alongside offensive work I research the security of AI systems: LLM agents, adversarial ML, and honest evaluation of both.",
];

// Animated stat counters (HTB Cyber Apocalypse 2026 certificate).
export const ctfStats = [
  { label: "Team ranking", value: 689, suffix: "th", of: "of 6,744 teams" },
  { label: "Challenges solved", value: 30, suffix: "/136", of: "crypto · rev · coding · web" },
  { label: "Total points", value: 21325, suffix: "", of: "5-day event" },
];

export type Competition = {
  name: string;
  event: string;
  date: string;
  result: string;
  blurb: string;
  tags: string[];
  links: { label: string; url: string }[];
};

export const competitions: Competition[] = [
  {
    name: "HTB Cyber Apocalypse 2026 — The Salt Crown",
    event: "Hack The Box · global CTF",
    date: "Jul 2026",
    result: "689th / 6,744 · 30/136 solved · 21,325 pts",
    blurb:
      "Five days across crypto, reverse engineering, algorithmic coding and web with Team Moonw4lk (3 players). Highlights: a low-data key recovery on 2-round AES, an Adler-32 / CRC-32 collision forge, and a 2^32-seed brute on a Godot/Mono APK. Full write-ups and runnable solve scripts are public.",
    tags: ["Cryptography", "Reversing", "Coding", "Web"],
    links: [
      { label: "Write-ups & solvers", url: "https://github.com/Katumbigeorges/htb-cyber-apocalypse-2026" },
    ],
  },
  {
    name: "Sherlock — CyberGym benchmark",
    event: "AgentBeats · Berkeley RDI",
    date: "Apr–May 2026",
    result: "Top 3 of 22 · 2nd best attacker (Team X-Detector)",
    blurb:
      "Team project with Amos Akogbe (@w4lk3r04). An A2A agent that reproduces real OSS-Fuzz vulnerabilities: given a bug description and pre-patch code, it generates a proof-of-concept exploit. Containerised and scored unattended through the AgentBeats gateway.",
    tags: ["AI Security", "LLM Agents", "Vuln Research"],
    links: [
      { label: "Attacker agent (@w4lk3r04)", url: "https://github.com/w4lk3r04/Sherlock-purple-agent" },
    ],
  },
];

export type SkillGroup = { title: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    title: "Offensive",
    items: ["CTF", "Exploit dev", "Reverse engineering", "Crypto attacks", "Web exploitation", "Binary analysis"],
  },
  {
    title: "AI security",
    items: ["LLM-agent security", "Adversarial ML", "PoC generation", "Robust evaluation", "A2A protocol"],
  },
  {
    title: "Languages",
    items: ["Python", "C", "TypeScript", "JavaScript", "Bash", "Java"],
  },
  {
    title: "Tooling",
    items: ["pwntools", "fpylll / SageMath", "Ghidra", "monodis", "Docker", "Linux", "Git / CI"],
  },
];

export type Project = {
  title: string;
  brief: string;
  details: string;
  tags: string[];
  repo?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Sherlock — LLM agent for CyberGym",
    brief: "An A2A agent that generates PoC exploits for real vulnerabilities.",
    details:
      "Team project with Amos Akogbe (@w4lk3r04), built for the CyberGym benchmark (AgentBeats / Berkeley RDI). Receives a vulnerability description and pre-patch code, returns a proof-of-concept exploit; deployed as a container and scored with no human in the loop. Team X-Detector — Top 3 of 22, 2nd best attacker.",
    tags: ["AI Security", "LLM", "A2A", "Docker"],
    repo: "https://github.com/w4lk3r04/Sherlock-purple-agent",
    featured: true,
  },
  {
    title: "Spam classifier (IDS lab)",
    brief: "ML text classifier separating spam from legitimate messages.",
    details:
      "Preprocessing and feature extraction over a labelled dataset, comparing classifiers on precision/recall rather than raw accuracy — the signal an intrusion-detection pipeline actually needs.",
    tags: ["Machine Learning", "NLP", "Security"],
    repo: "https://github.com/Katumbigeorges/ids-lab04-spam-classifier",
  },
  {
    title: "Age & gender detection",
    brief: "Deep-learning models predicting age and gender from face images.",
    details:
      "A computer-vision project training and evaluating CNN models on face imagery, wired into a reproducible notebook workflow.",
    tags: ["Deep Learning", "Computer Vision"],
    repo: "https://github.com/Katumbigeorges/Age-and-Gender-Detection-Using-Deep-Learning",
  },
  {
    title: "Linux From Scratch",
    brief: "Building a Linux system from source, component by component.",
    details:
      "A hands-on pass through compiling toolchain, kernel and userland from source — the systems grounding that makes exploitation and reversing make sense.",
    tags: ["Linux", "Systems"],
    repo: "https://github.com/Katumbigeorges/Linux-From-Scratch",
  },
];

/**
 * Write-ups are grouped by the capability they demonstrate, not by the event
 * they came from. A list ordered by date reads as an attendance record; the
 * same list grouped by technique reads as a map of what you can actually do.
 */
export type Theme =
  | "Cryptanalysis"
  | "Applied crypto & RSA"
  | "Reverse engineering"
  | "Web exploitation"
  | "Algorithms";

export type Writeup = {
  title: string;
  theme: Theme;
  category: "crypto" | "reversing" | "coding" | "web";
  difficulty?: string;
  idea: string;
  slug: string; // path inside the writeups repo
};

export const THEME_ORDER: Theme[] = [
  "Cryptanalysis",
  "Applied crypto & RSA",
  "Reverse engineering",
  "Web exploitation",
  "Algorithms",
];

export const THEME_BLURB: Record<Theme, string> = {
  Cryptanalysis: "Breaking primitives by attacking their structure rather than brute force.",
  "Applied crypto & RSA": "Recovering keys from partial information and malformed parameters.",
  "Reverse engineering": "Recovering behaviour from compiled artefacts.",
  "Web exploitation": "Chaining authorisation flaws into full access.",
  Algorithms: "Modelling the problem so the hard part becomes a known algorithm.",
};

const WRITEUPS_REPO = "https://github.com/Katumbigeorges/htb-cyber-apocalypse-2026/tree/main";

// Publication date for the write-up set (end of HTB Cyber Apocalypse 2026).
export const WRITEUP_DATE = "2026-07-29T12:00:00Z";

export const writeups: Writeup[] = [
  {
    title: "Ancient Artifacts",
    theme: "Cryptanalysis",
    category: "crypto",
    difficulty: "Hard",
    idea: "Adler-32 is invertible — forge a simultaneous Adler-32 + CRC-32 collision.",
    slug: "crypto/ancient-artifacts",
  },
  {
    title: "Ashbyte Arcade",
    theme: "Cryptanalysis",
    category: "crypto",
    difficulty: "Medium",
    idea: "2-round AES broken with a low-data known-plaintext key recovery.",
    slug: "crypto/ashbyte-arcade",
  },
  {
    title: "Fractured Seal",
    theme: "Applied crypto & RSA",
    category: "crypto",
    idea: "Redacted PEM leaks the top 576 bits of p → Coppersmith finishes the factorisation.",
    slug: "crypto/fractured-seal",
  },
  {
    title: "The Ashen Field",
    theme: "Cryptanalysis",
    category: "crypto",
    idea: "Frobenius linearises an HFE public key down to a GF(2) linear system.",
    slug: "crypto/the-ashen-field",
  },
  {
    title: "False Witness",
    theme: "Applied crypto & RSA",
    category: "crypto",
    difficulty: "Very Easy",
    idea: "Attacker-chosen generator collapses the DH subgroup to {1, p−1}.",
    slug: "crypto/false-witness",
  },
  {
    title: "SaltCrown",
    theme: "Reverse engineering",
    category: "reversing",
    idea: "Godot/Mono APK — the flag derives from one 32-bit seed, so brute-force all 2^32.",
    slug: "reversing/saltcrown",
  },
  {
    title: "CrownSpire Bellworks",
    theme: "Web exploitation",
    category: "web",
    idea: "Privilege chain: standing → proctor confusion → Keeper access.",
    slug: "web/crownspire-bellworks",
  },
  {
    title: "Rumour Spine",
    theme: "Algorithms",
    category: "coding",
    difficulty: "Hard",
    idea: "Minimum vertex cut = max-flow after splitting every node in two.",
    slug: "coding/rumour-spine",
  },
  {
    title: "Vow Engine",
    theme: "Algorithms",
    category: "coding",
    idea: "XOR linear basis over the cycle space of each component.",
    slug: "coding/vow-engine",
  },
  {
    title: "Ash Record",
    theme: "Algorithms",
    category: "coding",
    idea: "Greedy DP over timestamp-sorted residues.",
    slug: "coding/ash-record",
  },
];

export const writeupsRepoUrl = WRITEUPS_REPO;

/**
 * Write-ups are published here first; the repo is where the runnable solvers
 * live. `writeupPath` is the canonical location — keep the trailing slash, it
 * is what the build emits and what the canonical tags claim.
 */
export const writeupPath = (w: Writeup) => `/writeups/${w.slug}/`;
export const writeupAbsUrl = (w: Writeup) => `${SITE_URL}${writeupPath(w)}`;

/** The same challenge in the write-ups repo — source, solve scripts, inputs. */
export const writeupRepoUrl = (w: Writeup) => `${WRITEUPS_REPO}/${w.slug}`;

export const researchAreas = [
  {
    title: "LLM-agent security",
    body: "How autonomous agents fail under adversarial pressure — and how to generate proof-of-concept exploits that reproduce real vulnerabilities.",
    link: { label: "Sherlock agent (CyberGym)", url: "https://github.com/w4lk3r04/Sherlock-purple-agent" },
  },
  {
    title: "Adversarial ML",
    body: "Attacks and defences on learned systems, from evasion to poisoning, with an eye on what actually transfers to deployment.",
    link: { label: "ML for detection pipelines", url: "https://github.com/Katumbigeorges/ids-lab04-spam-classifier" },
  },
  {
    title: "Robust evaluation",
    body: "Measuring security claims honestly: blind baselines, reproducible harnesses, and results that survive scrutiny.",
    link: { label: "Reproducible CTF solvers", url: "https://github.com/Katumbigeorges/htb-cyber-apocalypse-2026" },
  },
];
