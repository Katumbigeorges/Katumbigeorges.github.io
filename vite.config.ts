import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { profile, socials, writeups, writeupAbsUrl, WRITEUP_DATE, SITE_URL } from "./src/data";

const SITE = SITE_URL;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Emits /feed.xml from the same write-up data the site renders, so the feed
 * can never drift from the page. Infosec still reads RSS heavily — and it is
 * how newsletter curators actually consume blogs, so the links must point at
 * this site rather than at GitHub.
 */
function rssFeed(): Plugin {
  return {
    name: "rss-feed",
    apply: "build",
    closeBundle() {
      const built = new Date(WRITEUP_DATE).toUTCString();
      const items = writeups
        .map(
          (w) => `    <item>
      <title>${esc(`${w.title} — ${w.theme}`)}</title>
      <link>${esc(writeupAbsUrl(w))}</link>
      <guid isPermaLink="true">${esc(writeupAbsUrl(w))}</guid>
      <pubDate>${built}</pubDate>
      <category>${esc(w.theme)}</category>
      <description>${esc(w.idea)}</description>
    </item>`,
        )
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} — write-ups</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Security research, CTF write-ups and solve scripts from ${esc(profile.name)} (${esc(profile.handle)}).</description>
    <language>en</language>
    <managingEditor>${esc(socials.email)} (${esc(profile.name)})</managingEditor>
    <lastBuildDate>${built}</lastBuildDate>
${items}
  </channel>
</rss>
`;
      const outDir = resolve(process.cwd(), "dist");
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, "feed.xml"), xml, "utf8");
      // eslint-disable-next-line no-console
      console.log(`  rss      wrote dist/feed.xml (${writeups.length} items)`);
    },
  };
}

/**
 * Emits /sitemap.xml. Generated rather than hand-maintained in public/ because
 * a hand-written sitemap is guaranteed to fall behind the write-up list — the
 * previous one listed 2 URLs while the site had far more to offer.
 */
function sitemap(): Plugin {
  return {
    name: "sitemap",
    apply: "build",
    closeBundle() {
      const lastmod = WRITEUP_DATE.slice(0, 10);
      const urls = [
        { loc: `${SITE}/`, priority: "1.0", changefreq: "monthly" },
        { loc: `${SITE}/writeups/`, priority: "0.9", changefreq: "monthly" },
        ...writeups.map((w) => ({
          loc: writeupAbsUrl(w),
          priority: "0.8",
          changefreq: "yearly",
        })),
        { loc: `${SITE}/colophon/`, priority: "0.4", changefreq: "yearly" },
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
      const outDir = resolve(process.cwd(), "dist");
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf8");
      // eslint-disable-next-line no-console
      console.log(`  sitemap  wrote dist/sitemap.xml (${urls.length} urls)`);
    },
  };
}

// User Pages site (katumbigeorges.github.io) serves from root, so base = "/".
export default defineConfig({
  plugins: [react(), rssFeed(), sitemap()],
  base: "/",
  // `nested` emits /colophon/index.html instead of /colophon.html, so both
  // /colophon and /colophon/ resolve. Under `flat` the trailing-slash form 404s,
  // which would give every future write-up URL a silently dead twin.
  ssgOptions: {
    dirStyle: "nested",
  },
});
