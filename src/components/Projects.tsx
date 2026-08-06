import { useState } from "react";
import { projects } from "../data";
import { useReveal } from "../hooks";

export default function Projects() {
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <section id="projects" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal">
          <span className="section-label">
            <span className="text-acid/70">04.</span> projects
          </span>
          <h2 className="section-title">Projects</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Selected work — security research and write-ups first, engineering alongside.
            Tap a card for detail.
          </p>
        </div>

        <div className="dim-group mt-10 grid gap-5 md:grid-cols-2">
          {projects.map((p, i) => {
            const isOpen = !!open[i];
            return (
              <article
                key={p.title}
                className={`reveal card flex flex-col ${p.featured ? "md:border-acid/25" : ""}`}
              >
                {p.featured && (
                  <span className="absolute right-4 top-4 rounded-md border border-acid/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-acid">
                    featured
                  </span>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-acid">▹</span>
                  <h3 className="font-display text-lg font-semibold text-white">{p.title}</h3>
                </div>

                <p className="text-sm leading-relaxed text-slate-400">{p.brief}</p>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-l-2 border-acid/40 pl-3 text-sm leading-relaxed text-slate-400">
                      {p.details}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-ink-700 pt-4">
                  <button
                    onClick={() => setOpen((s) => ({ ...s, [i]: !isOpen }))}
                    className="-my-2 flex min-h-[44px] items-center py-2 font-mono text-xs text-slate-400 transition-colors hover:text-acid"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? "− less" : "+ details"}
                  </button>
                  {p.repo && (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="-my-2 flex min-h-[44px] items-center py-2 font-mono text-xs text-acid hover:underline"
                    >
                      source ↗
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
