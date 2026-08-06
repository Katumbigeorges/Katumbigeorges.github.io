import { skills } from "../data";
import { useReveal } from "../hooks";

export default function Arsenal() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="arsenal" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal">
          <span className="section-label">
            <span className="text-acid/70">05.</span> arsenal
          </span>
          <h2 className="section-title">Arsenal</h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            The tools and domains I reach for — offensive work first, with the AI-security
            research and systems grounding that back it up.
          </p>
        </div>

        <div className="dim-group mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((group) => (
            <div key={group.title} className="reveal card">
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-acid">▹</span>
                <h3 className="font-display text-lg font-semibold text-white">{group.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
