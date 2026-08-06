import { researchAreas } from "../data";
import { useReveal } from "../hooks";

export default function Research() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="research" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal">
          <span className="section-label">
            <span className="text-acid/70">06.</span> research
          </span>
          <h2 className="section-title">Research directions</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Beyond the flags: understanding how AI systems fail, and how to evaluate them
            honestly.
          </p>
        </div>

        <div className="dim-group mt-10 grid gap-5 md:grid-cols-3">
          {researchAreas.map((r, i) => (
            <div key={r.title} className="reveal card">
              <span className="font-mono text-xs text-acid/60">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{r.body}</p>
              <a
                href={r.link.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-[44px] items-center gap-1 font-mono text-xs text-acid hover:underline"
              >
                {r.link.label} ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
