import { Link } from "react-router-dom";
import { writeups, writeupPath, THEME_ORDER, THEME_BLURB, type Writeup } from "../data";
import { useReveal } from "../hooks";

const CATEGORY_COLOR: Record<Writeup["category"], string> = {
  crypto: "text-acid border-acid/40",
  reversing: "text-[#37d6c4] border-[#37d6c4]/40",
  web: "text-[#ffbd2e] border-[#ffbd2e]/40",
  coding: "text-slate-300 border-slate-500/40",
};

export default function Writeups() {
  const ref = useReveal<HTMLDivElement>();

  const grouped = THEME_ORDER.map((theme) => ({
    theme,
    items: writeups.filter((w) => w.theme === theme),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="writeups" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal">
          <span className="section-label">
            <span className="text-acid/70">03.</span> writeups
          </span>
          <h2 className="section-title">Write-ups</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Grouped by what they demonstrate rather than when they happened. Each one is the
            bug, the approach, and a runnable solver — flags are worthless, the reasoning is the
            point.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {grouped.map((group) => (
            <div key={group.theme} className="reveal">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-ink-700 pb-3">
                <h3 className="font-display text-lg font-semibold text-white">{group.theme}</h3>
                <span className="font-mono text-xs text-acid">({group.items.length})</span>
                <p className="w-full text-sm text-ash sm:w-auto sm:flex-1">
                  {THEME_BLURB[group.theme]}
                </p>
              </div>

              <ul>
                {group.items.map((w) => (
                  <li key={w.slug} className="group border-b border-ink-700/50 last:border-0">
                    <Link
                      to={writeupPath(w)}
                      className="grid gap-1.5 py-4 transition-colors hover:bg-ink-850/50 md:grid-cols-[13rem_1fr_5rem] md:items-center md:gap-4 md:px-3"
                    >
                      <span className="font-display text-sm font-semibold text-white">
                        {w.title}
                        {w.difficulty && (
                          <span className="ml-2 font-mono text-[11px] font-normal text-ash">
                            {w.difficulty}
                          </span>
                        )}
                      </span>
                      <span className="text-sm leading-relaxed text-slate-400">{w.idea}</span>
                      <span className="flex items-center gap-2 md:justify-end">
                        <span
                          className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] ${CATEGORY_COLOR[w.category]}`}
                        >
                          {w.category}
                        </span>
                        <span className="font-mono text-xs text-acid opacity-70 transition-opacity group-hover:opacity-100">
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="reveal mt-8 font-mono text-xs text-ash">
          <Link
            to="/writeups/"
            className="inline-flex min-h-[44px] items-center text-acid hover:underline"
          >
            all write-ups →
          </Link>
        </p>
      </div>
    </section>
  );
}
