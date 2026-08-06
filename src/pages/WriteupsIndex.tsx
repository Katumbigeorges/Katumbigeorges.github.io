import { Link } from "react-router-dom";
import { Head } from "vite-react-ssg";
import {
  SITE_URL,
  THEME_BLURB,
  THEME_ORDER,
  WRITEUP_DATE,
  profile,
  writeupAbsUrl,
  writeupPath,
  writeups,
  writeupsRepoUrl,
} from "../data";
import { writeupInfo } from "../generated/writeups-index";

const TITLE = "Write-ups — Georges Katumbi";
const DESC =
  "Cryptanalysis, reverse engineering, web exploitation and algorithms write-ups from HTB Cyber Apocalypse 2026, with the reasoning and runnable solvers.";

export function Component() {
  const grouped = THEME_ORDER.map((theme) => ({
    theme,
    items: writeups.filter((w) => w.theme === theme),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <link rel="canonical" href={`${SITE_URL}/writeups/`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:url" content={`${SITE_URL}/writeups/`} />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESC} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Georges Katumbi — write-ups",
            description: DESC,
            url: `${SITE_URL}/writeups/`,
            inLanguage: "en",
            author: { "@type": "Person", name: profile.name, url: `${SITE_URL}/` },
            blogPost: writeups.map((w) => ({
              "@type": "BlogPosting",
              headline: `${w.title} — ${w.theme}`,
              description: w.idea,
              url: writeupAbsUrl(w),
              datePublished: WRITEUP_DATE,
            })),
          })}
        </script>
      </Head>

      <section className="relative pb-24 pt-32">
        <div className="container-page max-w-4xl">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-ash">
            <Link to="/" className="hover:text-acid">
              ~
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-slate-400">writeups</span>
          </nav>

          <h1 className="mt-6 font-display text-3xl font-bold text-white sm:text-4xl">Write-ups</h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            Grouped by what they demonstrate rather than when they happened. Each one is the bug, the
            approach, and a runnable solver.
          </p>

          <div className="mt-12 space-y-12">
            {grouped.map((group) => (
              <div key={group.theme}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-ink-700 pb-3">
                  <h2 className="font-display text-lg font-semibold text-white">{group.theme}</h2>
                  <span className="font-mono text-xs text-acid">({group.items.length})</span>
                  <p className="w-full text-sm text-ash sm:w-auto sm:flex-1">
                    {THEME_BLURB[group.theme]}
                  </p>
                </div>

                <ul>
                  {group.items.map((w) => (
                    <li key={w.slug} className="border-b border-ink-700/50 last:border-0">
                      <Link
                        to={writeupPath(w)}
                        className="group grid gap-1.5 py-5 transition-colors hover:bg-ink-850/50 md:grid-cols-[15rem_1fr_5rem] md:items-baseline md:gap-4 md:px-3"
                      >
                        <span className="font-display text-sm font-semibold text-white group-hover:text-acid">
                          {w.title}
                          {w.difficulty && (
                            <span className="ml-2 font-mono text-[11px] font-normal text-ash">
                              {w.difficulty}
                            </span>
                          )}
                        </span>
                        <span className="text-sm leading-relaxed text-slate-400">{w.idea}</span>
                        <span className="font-mono text-[11px] text-ash md:text-right">
                          {writeupInfo[w.slug]?.readingMinutes ?? 1} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-12 font-mono text-xs text-ash">
            $ git clone{" "}
            <a
              href={writeupsRepoUrl.replace("/tree/main", "")}
              target="_blank"
              rel="noreferrer"
              className="text-acid hover:underline"
            >
              solve scripts &amp; challenge sources ↗
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

export default Component;
