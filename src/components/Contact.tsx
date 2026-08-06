import { profile, socials } from "../data";
import { useReveal } from "../hooks";

const LINKS = [
  { label: "linkedin/georgeskatumbi", url: socials.linkedin },
  { label: "github/Katumbigeorges", url: socials.github },
];

export default function Contact() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="contact" ref={ref} className="relative py-16 sm:py-24">
      <div className="container-page">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="section-label justify-center">
            <span className="text-acid/70">07.</span> contact
          </span>
          <h2 className="section-title">Let's talk</h2>
          <p className="mt-4 text-slate-400">
            {profile.availability}. Whether it's a CTF team, a research collaboration, or a
            security problem you're stuck on — reach out.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${socials.email}`} className="btn btn-primary">
              {socials.email}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-sm">
            {LINKS.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[44px] items-center text-slate-400 transition-colors hover:text-acid"
              >
                {l.label}
              </a>
            ))}
          </div>

          <p className="mt-8 font-mono text-xs text-ash">
            Security contact:{" "}
            <a
              href="/.well-known/security.txt"
              className="inline-block py-1.5 text-slate-400 hover:text-acid"
            >
              /.well-known/security.txt
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
