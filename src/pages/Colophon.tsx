import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { SITE_URL, socials } from "../data";

import { useReveal } from "../hooks";

const COLOPHON_TITLE = "Colophon — Georges Katumbi";
const COLOPHON_DESC =
  "How this site is built: stack, accessibility decisions, performance budget, and the things that were deliberate.";

type Row = { label: string; body: React.ReactNode };

const STACK: Row[] = [
  {
    label: "Build",
    body: (
      <>
        React 18 + TypeScript, bundled by Vite and prerendered to static HTML with{" "}
        <code>vite-react-ssg</code>. Every route ships as a real file with real content, so
        crawlers that don't run JavaScript — which is most of them, including the AI ones —
        still read the whole page.
      </>
    ),
  },
  {
    label: "Styling",
    body: (
      <>
        Tailwind CSS. The accent colour is a single CSS custom property holding an RGB triplet,
        which is what lets the <code>theme</code> command reskin the entire site — including the
        canvas animation — without a reload.
      </>
    ),
  },
  {
    label: "Type",
    body: (
      <>
        JetBrains Mono, Space Grotesk and Inter, self-hosted as latin-subset WOFF2. No Google
        Fonts request: it was render-blocking, and third-party font CDNs are a privacy and
        availability dependency I don't need.
      </>
    ),
  },
  {
    label: "Hosting",
    body: (
      <>
        GitHub Pages, deployed by GitHub Actions on push to <code>main</code>. The build
        typechecks first, so a type error fails the deploy instead of shipping.
      </>
    ),
  },
  {
    label: "Analytics",
    body: <>None. No tracking scripts, no cookies, no third-party requests of any kind.</>,
  },
];

const CRAFT: Row[] = [
  {
    label: "Contrast",
    body: (
      <>
        Every text colour on the site was measured against its actual background and clears
        WCAG AA. The dimmest tone is <code>#7d8b9e</code> at 5.9:1 — the earlier grey looked
        right but measured 2.7:1, which is a fail. Neon green on near-black is 14.4:1.
      </>
    ),
  },
  {
    label: "Keyboard",
    body: (
      <>
        Fully operable without a mouse: a skip link, visible focus rings on everything, and both
        overlays trap focus properly and return it to whatever opened them. The terminal's Tab
        key does autocompletion, so Shift+Tab is the documented way out — a modal that swallows
        Tab with no escape route is a keyboard trap, and those are worth taking seriously.
      </>
    ),
  },
  {
    label: "Motion",
    body: (
      <>
        Everything animated respects <code>prefers-reduced-motion</code>. With it on, the boot
        sequence is skipped, the rain stops, and the role text renders as a static list instead
        of typing forever.
      </>
    ),
  },
  {
    label: "Performance",
    body: (
      <>
        Around 320 KB total, first paint near one second on a desktop connection. The matrix
        rain runs on a 2D canvas at 30fps and pauses itself via IntersectionObserver once you
        scroll past the hero, so it isn't burning battery while you read.
      </>
    ),
  },
  {
    label: "Machine-readable",
    body: (
      <>
        JSON-LD <code>ProfilePage</code> on the home page and <code>BlogPosting</code> on every
        write-up, an RSS feed at{" "}
        <a href="/feed.xml" className="text-acid hover:underline">
          /feed.xml
        </a>
        , a generated sitemap, and an RFC 9116{" "}
        <a href="/.well-known/security.txt" className="text-acid hover:underline">
          security.txt
        </a>{" "}
        — because a security site without one is conspicuous.
      </>
    ),
  },
  {
    label: "Write-ups",
    body: (
      <>
        Authored as Markdown in <code>content/writeups/</code> and rendered to HTML at build time,
        with syntax highlighting baked in. Neither the Markdown parser nor the highlighter ships to
        the browser — each article is a prerendered static file. The{" "}
        <a href="/writeups/" className="text-acid hover:underline">
          index
        </a>{" "}
        loads none of the article bodies.
      </>
    ),
  },
];

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="reveal mt-12">
      <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
      <dl className="mt-5 divide-y divide-ink-700 border-y border-ink-700">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 py-4 md:grid-cols-[9rem_1fr] md:gap-6">
            <dt className="font-mono text-xs uppercase tracking-widest text-acid">{r.label}</dt>
            <dd className="text-sm leading-relaxed text-slate-400">{r.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Component() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <>
      <Head>
        <title>{COLOPHON_TITLE}</title>
        <meta name="description" content={COLOPHON_DESC} />
        {/* trailing slash: the build emits /colophon/index.html, and GitHub
            Pages redirects /colophon → /colophon/, so the slashed form is the
            one that should be canonical */}
        <link rel="canonical" href={`${SITE_URL}/colophon/`} />
        <meta property="og:title" content={COLOPHON_TITLE} />
        <meta property="og:description" content={COLOPHON_DESC} />
        <meta property="og:url" content={`${SITE_URL}/colophon/`} />
        <meta name="twitter:title" content={COLOPHON_TITLE} />
        <meta name="twitter:description" content={COLOPHON_DESC} />
      </Head>

      <section ref={ref} className="relative pb-24 pt-32">
        <div className="container-page max-w-3xl">
          <div className="reveal">
            <Link to="/" className="font-mono text-xs text-ash hover:text-acid">
              ← back
            </Link>
            <span className="section-label mt-6 block">
              <span className="text-acid/70">$</span> cat colophon.md
            </span>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Colophon</h1>
            <p className="mt-4 text-slate-400">
              How this site is built, and which parts were deliberate. Most of what follows is
              invisible when the page is working correctly, which is the usual problem with
              craft — so here it is written down.
            </p>
          </div>

          <Section title="Stack" rows={STACK} />
          <Section title="Decisions worth naming" rows={CRAFT} />

          <div className="reveal mt-12">
            <h2 className="font-display text-2xl font-bold text-white">Honest caveats</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-400">
              <li>
                <span className="text-acid">▹</span> GitHub Pages can't set response headers, so
                there's no CSP, HSTS preload or frame-options beyond what a meta tag can do.
                That's a platform limit, not an oversight — worth knowing before you judge the
                headers.
              </li>
              <li>
                <span className="text-acid">▹</span> The certificate image is a resized JPEG. The
                original was a 2.4 MB PNG, which was 40× the size of all the JavaScript combined.
              </li>
              <li>
                <span className="text-acid">▹</span> Yes, there are flags hidden on this site.
                Open the terminal and run <code className="text-slate-300">secrets</code>.
              </li>
            </ul>
          </div>

          <p className="reveal mt-12 font-mono text-xs text-ash">
            Source:{" "}
            <a
              href={`${socials.github}/Katumbigeorges.github.io`}
              target="_blank"
              rel="noreferrer"
              className="text-acid hover:underline"
            >
              github.com/Katumbigeorges/Katumbigeorges.github.io
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

export default Component;
