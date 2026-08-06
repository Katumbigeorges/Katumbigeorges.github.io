# katumbigeorges.github.io

Personal site for **Georges Katumbi** (Moonw4lk) — security research, CTF, and
AI-security work. Dark hacker aesthetic, single-page, with an interactive
terminal as the signature mechanic.

## Stack

React + Vite + TypeScript + TailwindCSS. No backend, no external requests
(fonts are self-hosted). Deployed to GitHub Pages via GitHub Actions
(`.github/workflows/deploy.yml`).

## Features

- **Interactive terminal** — `>_ terminal` in the nav, or `` Ctrl+` `` /
  `Ctrl/Cmd+K`. Real command parser with tab completion and history:
  `help`, `neofetch`, `writeups`-style navigation via `goto`, `theme`, …
- **Theme engine** — `theme phosphor|amber|ice|blood` re-skins the whole
  site through CSS custom properties (persisted).
- **Secrets layer** — hidden flags tracked with achievement toasts; run
  `secrets` in the terminal for hints. No spoilers here.
- Depth-layered matrix rain (pauses off-screen), scramble/typewriter hero,
  scroll reveals, spotlight + focus-and-dim card hovers — all honoring
  `prefers-reduced-motion`.
- RFC 9116 `security.txt`, sitemap, robots, humans.txt, OG social card.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck (tsc) + production build -> dist/
npm run preview  # preview the production build
```

## Edit content

All text lives in [`src/data.ts`](src/data.ts) — profile, whoami, stats,
competitions, write-ups, projects, research. Change it there; components
read from it. Easter-egg/theme plumbing lives in [`src/secrets.ts`](src/secrets.ts).

The HTB certificate image is `public/htb-cyber-apocalypse-2026-certificate.jpg`.

## Deploy

Push to `main`. The Actions workflow typechecks, builds `dist/` and publishes
it to Pages.

> The previous Hugo Blox version of this site is preserved on the `hugo-legacy`
> branch.
