import { Link, useParams } from "react-router-dom";
import { Head } from "vite-react-ssg";
import {
  SITE_URL,
  WRITEUP_DATE,
  profile,
  writeupAbsUrl,
  writeupRepoUrl,
  writeups,
} from "../data";
import { writeupInfo } from "../generated/writeups-index";
import { writeupHtml } from "../generated/writeups-html";

/**
 * A single write-up. The body is pre-rendered HTML produced at build time by
 * scripts/build-writeups.mjs, so no markdown parser ships to the browser.
 *
 * Exported as `Component` so the route can `lazy`-load this module — it pulls
 * in the whole article corpus and must stay out of the home-page chunk.
 */
export function Component() {
  const params = useParams();
  const slug = `${params.category}/${params.slug}`;

  const meta = writeups.find((w) => w.slug === slug);
  const content = writeupInfo[slug];
  const html = writeupHtml[slug];

  // Routes are generated from the same array, so this is unreachable in
  // practice — but a missing file should fail loudly, not render blank.
  if (!meta || !content || !html) {
    throw new Error(`No write-up content for slug "${slug}"`);
  }

  const idx = writeups.findIndex((w) => w.slug === slug);
  const prev = writeups[idx - 1];
  const next = writeups[idx + 1];

  const title = `${meta.title} — ${meta.theme} write-up`;
  const url = writeupAbsUrl(meta);

  return (
    <>
      <Head>
        <title>{`${meta.title} — HTB Cyber Apocalypse 2026 write-up`}</title>
        <meta name="description" content={meta.idea} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={meta.idea} />
        <meta property="og:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={meta.idea} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: `${meta.title} — ${meta.theme}`,
            description: meta.idea,
            url,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            datePublished: WRITEUP_DATE,
            dateModified: WRITEUP_DATE,
            inLanguage: "en",
            keywords: [meta.theme, meta.category, "CTF", "HTB Cyber Apocalypse 2026"].join(", "),
            author: { "@type": "Person", name: profile.name, url: `${SITE_URL}/` },
            publisher: { "@type": "Person", name: profile.name, url: `${SITE_URL}/` },
            isPartOf: {
              "@type": "Blog",
              name: "Georges Katumbi — write-ups",
              url: `${SITE_URL}/writeups/`,
            },
          })}
        </script>
      </Head>

      <article className="relative pb-24 pt-32">
        <div className="container-page max-w-3xl">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-ash">
            <Link to="/" className="hover:text-acid">
              ~
            </Link>
            <span aria-hidden="true"> / </span>
            <Link to="/#writeups" className="hover:text-acid">
              writeups
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-slate-400">{meta.title}</span>
          </nav>

          <header className="mt-6 border-b border-ink-700 pb-8">
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {meta.title}
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-slate-400">{meta.idea}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="chip">{meta.theme}</span>
              <span className="chip">{meta.category}</span>
              {meta.difficulty && <span className="chip">{meta.difficulty}</span>}
              {content.meta.Points && <span className="chip">{content.meta.Points} pts</span>}
              <span className="font-mono text-xs text-ash">
                {content.readingMinutes} min read
              </span>
            </div>

            <p className="mt-4 font-mono text-xs text-ash">
              HTB Cyber Apocalypse 2026 · Team Moonw4lk ·{" "}
              <a
                href={writeupRepoUrl(meta)}
                target="_blank"
                rel="noreferrer"
                className="text-acid hover:underline"
              >
                solve script ↗
              </a>
            </p>
          </header>

          {content.headings.length > 2 && (
            <nav aria-label="On this page" className="mt-8 rounded-xl border border-ink-700 bg-ink-900/50 p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-acid">On this page</p>
              <ol className="mt-3 space-y-1.5">
                {content.headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                    <a
                      href={`#${h.id}`}
                      className="font-mono text-sm text-slate-400 transition-colors hover:text-acid"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div
            className="writeup-prose mt-10"
            // Build-time output from our own markdown files; no user input path.
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <footer className="mt-16 border-t border-ink-700 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {prev ? (
                <Link
                  to={`/writeups/${prev.slug}/`}
                  className="group max-w-[15rem] font-mono text-xs text-ash hover:text-acid"
                >
                  ← previous
                  <span className="mt-1 block text-sm text-slate-400 group-hover:text-acid">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to={`/writeups/${next.slug}/`}
                  className="group max-w-[15rem] font-mono text-xs text-ash hover:text-acid sm:text-right"
                >
                  next →
                  <span className="mt-1 block text-sm text-slate-400 group-hover:text-acid">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>

            <p className="mt-10 font-mono text-xs text-ash">
              <Link to="/#writeups" className="text-acid hover:underline">
                ← all write-ups
              </Link>
            </p>
          </footer>
        </div>
      </article>
    </>
  );
}

export default Component;
