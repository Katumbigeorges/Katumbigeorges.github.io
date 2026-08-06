import { profile, whoami } from "../data";
import { useReveal } from "../hooks";

export default function Whoami() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="whoami" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal">
          <span className="section-label">
            <span className="text-acid/70">01.</span> whoami
          </span>
          <h2 className="section-title">Who I am</h2>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* terminal card */}
          <div className="reveal lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-900/70 shadow-glow">
              <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-850 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 font-mono text-xs text-ash">
                  {profile.handle}@moonw4lk: ~/whoami
                </span>
              </div>
              <div className="space-y-4 p-6 font-mono text-sm leading-relaxed">
                <p className="text-ash">
                  <span className="text-acid">$</span> cat about.txt
                </p>
                {whoami.map((line, i) => (
                  <p key={i} className="text-slate-300">
                    {line}
                  </p>
                ))}
                <p className="text-ash">
                  <span className="text-acid">$</span>
                  <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 bg-acid animate-blink" />
                </p>
              </div>
            </div>
          </div>

          {/* facts */}
          <div className="reveal space-y-3 lg:col-span-2">
            {[
              ["handle", profile.handle],
              ["team", "Moonw4lk"],
              ["focus", "Offensive security · AI security"],
              ["location", profile.location],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 px-4 py-3"
              >
                <span className="font-mono text-xs uppercase tracking-wider text-ash">
                  {k}
                </span>
                <span className="font-mono text-sm text-slate-200">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
