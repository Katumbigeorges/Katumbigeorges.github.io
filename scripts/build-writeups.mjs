// Turns content/writeups/**/*.md into src/generated/writeups-html.ts.
//
// This runs at build time (see the `prebuild`/`predev` npm scripts) so neither
// `marked` nor `shiki` ever reaches the browser bundle — the site ships plain
// pre-rendered HTML strings.
//
// Each file is split into three parts:
//   1. the leading `# Title`
//   2. the metadata table right below it (Category / Difficulty / Flag / ...)
//   3. everything else, which becomes the article body
// The first two are surfaced as structured data so the page can render a proper
// header instead of an HTML table with an empty header row.

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";
import { createHighlighter } from "shiki";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "content", "writeups");
const OUT_DIR = join(ROOT, "src", "generated");
// Split deliberately: the index page and nav only need the light metadata, and
// importing it must not drag ~57 kB of article HTML into their chunk.
const OUT_HTML = join(OUT_DIR, "writeups-html.ts");
const OUT_INDEX = join(OUT_DIR, "writeups-index.ts");

const THEME = "github-dark-default";
const LANGS = ["python", "bash", "c", "json", "javascript", "typescript"];

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** GitHub-style heading id, so in-page anchors match what people expect. */
const slugifyHeading = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** Splits `# Title` + metadata table off the top of the document. */
function splitFrontMatter(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  let title = "";

  while (i < lines.length && lines[i].trim() === "") i++;
  const h1 = lines[i]?.match(/^#\s+(.*)$/);
  if (h1) {
    title = h1[1].trim();
    i++;
  }
  while (i < lines.length && lines[i].trim() === "") i++;

  // metadata table: consecutive lines starting with `|`
  const meta = {};
  if (lines[i]?.trimStart().startsWith("|")) {
    while (i < lines.length && lines[i].trimStart().startsWith("|")) {
      const cells = lines[i]
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());
      const isSeparator = cells.every((c) => /^:?-{2,}:?$/.test(c));
      if (!isSeparator && cells.length === 2 && cells[0] && cells[1]) {
        meta[cells[0]] = cells[1];
      }
      i++;
    }
  }

  return { title, meta, body: lines.slice(i).join("\n").trim() };
}

async function main() {
  const highlighter = await createHighlighter({ themes: [THEME], langs: LANGS });
  const loaded = new Set(highlighter.getLoadedLanguages());

  const categories = await readdir(CONTENT_DIR, { withFileTypes: true });
  const entries = [];

  for (const cat of categories.filter((d) => d.isDirectory())) {
    const files = (await readdir(join(CONTENT_DIR, cat.name))).filter((f) => f.endsWith(".md"));
    for (const file of files.sort()) {
      const raw = await readFile(join(CONTENT_DIR, cat.name, file), "utf8");
      const { title, meta, body } = splitFrontMatter(raw);
      const headings = [];

      // A fresh Marked per file: the heading collector below is stateful.
      const marked = new Marked({ gfm: true, breaks: false });
      marked.use({
        renderer: {
          // Raw HTML is escaped rather than passed through. Nothing in these
          // files needs it, and `<G>`-style notation must survive as text.
          html: (token) => escapeHtml(typeof token === "string" ? token : token.text),
          heading(token) {
            const text = this.parser.parseInline(token.tokens);
            const plain = token.text.replace(/`/g, "");
            const id = slugifyHeading(plain);
            if (token.depth === 2 || token.depth === 3) {
              headings.push({ id, text: plain, level: token.depth });
            }
            return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
          },
          code(token) {
            const lang = (token.lang || "").split(/\s+/)[0].toLowerCase();
            if (lang && loaded.has(lang)) {
              return highlighter.codeToHtml(token.text, { lang, theme: THEME });
            }
            // unlabelled or unknown language: still render, just unhighlighted
            return `<pre class="shiki plain"><code>${escapeHtml(token.text)}</code></pre>`;
          },
        },
      });

      const html = await marked.parse(body);
      const words = body.split(/\s+/).filter(Boolean).length;

      entries.push({
        slug: `${cat.name}/${basename(file, ".md")}`,
        title,
        meta,
        headings,
        html,
        readingMinutes: Math.max(1, Math.round(words / 200)),
      });
    }
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));

  const BANNER = `// GENERATED by scripts/build-writeups.mjs — do not edit by hand.
// Source of truth is content/writeups/**/*.md. Run \`npm run build:writeups\`.
`;

  const indexOut = `${BANNER}
export type WriteupHeading = { id: string; text: string; level: number };

/** Everything about a write-up except its body. Safe to import anywhere. */
export type WriteupInfo = {
  slug: string;
  title: string;
  meta: Record<string, string>;
  headings: WriteupHeading[];
  readingMinutes: number;
};

export const writeupInfo: Record<string, WriteupInfo> = ${JSON.stringify(
    Object.fromEntries(
      entries.map(({ html: _html, ...rest }) => [rest.slug, rest]),
    ),
    null,
    2,
  )};
`;

  const htmlOut = `${BANNER}
// Article bodies only — import this from the write-up page and nowhere else,
// or the whole corpus lands in a chunk that does not need it.

export const writeupHtml: Record<string, string> = ${JSON.stringify(
    Object.fromEntries(entries.map((e) => [e.slug, e.html])),
    null,
    2,
  )};
`;

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_INDEX, indexOut, "utf8");
  await writeFile(OUT_HTML, htmlOut, "utf8");

  const kb = (s) => (s.length / 1024).toFixed(1);
  console.log(
    `  writeups ${entries.length} articles → writeups-index.ts (${kb(indexOut)} kB) + writeups-html.ts (${kb(htmlOut)} kB)`,
  );
}

main().catch((err) => {
  console.error("build-writeups failed:", err);
  process.exit(1);
});
