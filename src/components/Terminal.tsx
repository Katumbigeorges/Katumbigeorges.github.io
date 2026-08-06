import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  competitions,
  ctfStats,
  profile,
  projects,
  SECTION_IDS,
  socials,
  whoami,
  writeups,
  writeupsRepoUrl,
} from "../data";
import { applyTheme, currentTheme, foundSecret, SECRETS, secretsFound, THEMES, type Theme } from "../secrets";
import { useBodyScrollLock } from "../hooks";

type Line = { kind: "in" | "out" | "ok" | "err" | "dim"; text: string };

const FILES = ["about.txt", "projects.txt", "ctf.txt", "socials.txt", "flag.txt", ".secrets/"];

const COMMANDS = [
  "help",
  "whoami",
  "neofetch",
  "ls",
  "cat",
  "writeups",
  "projects",
  "ctf",
  "socials",
  "contact",
  "goto",
  "open",
  "theme",
  "secrets",
  "sudo",
  "hack",
  "clear",
  "exit",
];

const SHELL_VERSION = "msh 5.2";

const NEOFETCH_ART = [
  "      ▄▄███▄▄      ",
  "   ▄█████████▀     ",
  "  ████████▀        ",
  " █████████         ",
  " █████████         ",
  "  ████████▄        ",
  "   ▀█████████▄     ",
  "      ▀▀███▀▀      ",
];

const HELP: string[] = [
  "help              list commands",
  "whoami            who is at the keyboard",
  "neofetch          system info, sort of",
  "ls [dir]          list files",
  "cat <file>        print a file",
  "writeups          CTF write-ups, with links",
  "projects          selected work",
  "ctf               competition record",
  "socials           where to find me",
  `goto <section>    jump to a section (${SECTION_IDS.join(" · ")})`,
  "open <target>     github · linkedin",
  `theme <name>      ${THEMES.join(" · ")}`,
  "secrets           track your easter-egg progress",
  "sudo <cmd>        escalate privileges",
  "hack              run the exploit",
  "clear             clear the screen",
  "exit              close the terminal (or press Esc)",
];

const BANNER: Line[] = [
  { kind: "dim", text: `moonw4lk shell — ${SHELL_VERSION} — unauthorized access is mandatory` },
  { kind: "dim", text: 'type "help" to get started. tab completes, ↑/↓ recalls history.' },
];

type TerminalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * The terminal itself. Open/closed state lives in TerminalHost so this whole
 * module can be code-split — it is the largest component on the site and most
 * visitors never open it. Once loaded it stays mounted (rendering null when
 * closed) so scrollback and command history survive closing.
 */
export default function Terminal({ open, setOpen }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  const draft = useRef(""); // in-progress line, preserved across history navigation
  const restoreFocus = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useBodyScrollLock(open);

  // focus management: remember the trigger, focus the input, restore on close
  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement;
      inputRef.current?.focus();
    } else {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setBusy(false);
      restoreFocus.current?.focus?.();
      restoreFocus.current = null;
    }
  }, [open]);

  // never leave timers running against an unmounted terminal
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  const print = useCallback((out: Line[]) => setLines((prev) => [...prev, ...out]), []);

  const runHack = useCallback(() => {
    setBusy(true);
    const steps: Line[] = [
      { kind: "out", text: "[+] scanning target: visitor.local ........ 3 open ports" },
      { kind: "out", text: "[+] fingerprinting stack ................. curiosity/1.0" },
      { kind: "out", text: "[+] exploiting CVE-2026-31337 ............ success" },
      { kind: "out", text: "[+] escalating privileges ................ root" },
      { kind: "out", text: "[+] exfiltrating secrets ................. just kidding." },
      { kind: "ok", text: "[✓] the only thing compromised here is your free time. try: sudo cat flag.txt" },
    ];
    steps.forEach((line, i) => {
      const t = window.setTimeout(() => {
        print([line]);
        if (i === steps.length - 1) {
          setBusy(false);
          foundSecret("hack");
          // re-enabling a disabled input does not restore focus by itself
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }, 350 * (i + 1));
      timers.current.push(t);
    });
  }, [print]);

  const exec = useCallback(
    (raw: string) => {
      const cmdline = raw.trim();
      print([{ kind: "in", text: cmdline }]);
      if (!cmdline) return;

      setHistory((h) => [cmdline, ...h]);
      setHistIdx(-1);
      draft.current = "";

      // strip any number of leading `sudo` tokens, case-insensitively
      const isSudo = /^sudo\s+/i.test(cmdline);
      const line = cmdline.replace(/^(sudo\s+)+/i, "");
      const [cmd, ...args] = line.split(/\s+/);
      const arg = args.join(" ");

      switch (cmd.toLowerCase()) {
        case "help":
          print(HELP.map((t) => ({ kind: "out", text: t }) as Line));
          break;

        case "whoami":
          if (isSudo) {
            print([{ kind: "ok", text: "root. flattering, but you are still in a sandbox." }]);
          } else {
            print([
              { kind: "out", text: "guest — but you probably came for the other guy:" },
              {
                kind: "out",
                text: `${profile.name} · security researcher · red team · Team Moonw4lk`,
              },
              { kind: "dim", text: `${profile.location} · ${profile.availability.toLowerCase()}` },
            ]);
          }
          break;

        case "ls": {
          const dir = arg.replace(/\/$/, "");
          if (!dir || dir === "." || dir === "~") {
            print([{ kind: "out", text: FILES.join("   ") }]);
          } else if (dir === ".secrets") {
            print([
              { kind: "out", text: "hint-01.txt" },
              { kind: "dim", text: "$ cat .secrets/hint-01.txt" },
            ]);
          } else {
            print([{ kind: "err", text: `ls: cannot access '${arg}': No such file or directory` }]);
          }
          break;
        }

        case "cat": {
          const f = arg.replace(/^\.\//, "");
          if (!f) {
            print([{ kind: "err", text: "cat: missing operand. try: cat about.txt" }]);
          } else if (f === "about.txt") {
            print(whoami.map((t) => ({ kind: "out", text: t }) as Line));
          } else if (f === "projects.txt") {
            print(
              projects.map((p) => ({ kind: "out", text: `▹ ${p.title} — ${p.brief}` }) as Line),
            );
          } else if (f === "ctf.txt") {
            print([
              ...competitions.map(
                (c) => ({ kind: "out", text: `▹ ${c.name} — ${c.result}` }) as Line,
              ),
              { kind: "dim", text: writeupsRepoUrl.replace("/tree/main", "") },
            ]);
          } else if (f === "socials.txt") {
            print([
              { kind: "out", text: `github    ${socials.github}` },
              { kind: "out", text: `linkedin  ${socials.linkedin}` },
              { kind: "out", text: `email     ${socials.email}` },
            ]);
          } else if (f === "flag.txt") {
            if (isSudo) {
              print([
                { kind: "dim", text: "[sudo] password for guest: ********" },
                { kind: "ok", text: "access granted." },
                { kind: "ok", text: "flag{pr1v3sc_by_p0l1t3ly_4sk1ng}" },
                { kind: "dim", text: "there are more flags. run `secrets` to see how deep this goes." },
              ]);
              foundSecret("sudo-flag");
            } else {
              print([{ kind: "err", text: "cat: flag.txt: Permission denied (are you root?)" }]);
            }
          } else if (f === "hint-01.txt" || f === ".secrets/hint-01.txt") {
            print([{ kind: "out", text: "the konami code still works in 2026." }]);
          } else {
            print([{ kind: "err", text: `cat: ${f}: No such file or directory` }]);
          }
          break;
        }

        case "writeups":
          print([
            ...writeups.map(
              (w) => ({ kind: "out", text: `[${w.category.padEnd(9)}] ${w.title} — ${w.idea}` }) as Line,
            ),
            { kind: "dim", text: "full write-ups + solvers: goto writeups" },
          ]);
          break;

        case "projects":
          print(
            projects.map((p) => ({ kind: "out", text: `▹ ${p.title} — ${p.brief}` }) as Line),
          );
          print([{ kind: "dim", text: "full detail: goto projects" }]);
          break;

        case "ctf":
          print(
            ctfStats.map(
              (s) =>
                ({
                  kind: "out",
                  text: `${s.label}: ${s.value.toLocaleString()}${s.suffix} (${s.of})`,
                }) as Line,
            ),
          );
          break;

        case "socials":
        case "contact":
          print([
            { kind: "out", text: `github    ${socials.github}` },
            { kind: "out", text: `linkedin  ${socials.linkedin}` },
            { kind: "out", text: `email     ${socials.email}` },
          ]);
          break;

        case "goto": {
          const id = arg.toLowerCase();
          if (SECTION_IDS.includes(id)) {
            setOpen(false);
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const scrollTo = () =>
              document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
            if (document.getElementById(id)) {
              scrollTo();
            } else {
              // the sections only exist on the home route — go there first
              navigate("/");
              requestAnimationFrame(() => requestAnimationFrame(scrollTo));
            }
          } else {
            print([
              {
                kind: "err",
                text: arg
                  ? `goto: unknown section "${arg}". sections: ${SECTION_IDS.join(" · ")}`
                  : `goto: missing section. sections: ${SECTION_IDS.join(" · ")}`,
              },
            ]);
          }
          break;
        }

        case "open": {
          const target = arg.toLowerCase();
          const url = target.includes("linkedin")
            ? socials.linkedin
            : target.includes("github")
              ? socials.github
              : null;
          if (url) {
            window.open(url, "_blank", "noopener");
            print([{ kind: "ok", text: `opening ${url} ...` }]);
          } else {
            print([{ kind: "err", text: "open: try `open github` or `open linkedin`." }]);
          }
          break;
        }

        case "neofetch": {
          const [rank, solved, points] = ctfStats;
          const info = [
            "guest@moonw4lk",
            "──────────────────────────",
            `os        moonw4lkOS 2.6 LTS`,
            `host      github-pages / vite`,
            `shell     ${SHELL_VERSION} (this one)`,
            `team      Moonw4lk`,
            `ctf       ${rank.value}${rank.suffix} of 6,744 · ${points.value.toLocaleString()} pts`,
            `solved    ${solved.value}${solved.suffix} · ${solved.of}`,
          ];
          const rows = Math.max(NEOFETCH_ART.length, info.length);
          const out: Line[] = [];
          for (let i = 0; i < rows; i++) {
            out.push({
              kind: "ok",
              text: `${(NEOFETCH_ART[i] ?? " ".repeat(19)).padEnd(21)}${info[i] ?? ""}`,
            });
          }
          print(out);
          break;
        }

        case "theme": {
          const t = arg.toLowerCase() as Theme;
          if (!arg) {
            print([
              { kind: "out", text: `themes: ${THEMES.join(" · ")} (current: ${currentTheme()})` },
              { kind: "dim", text: "usage: theme <name>" },
            ]);
          } else if ((THEMES as readonly string[]).includes(t)) {
            applyTheme(t);
            if (t !== "phosphor") foundSecret("theme");
            print([{ kind: "ok", text: `theme set to ${t}. easy on the eyes? your call.` }]);
          } else {
            print([
              { kind: "err", text: `theme: unknown theme "${arg}". try: ${THEMES.join(" · ")}` },
            ]);
          }
          break;
        }

        case "secrets": {
          const found = secretsFound();
          print([
            { kind: "out", text: `secrets found: ${found.length}/${SECRETS.length}` },
            ...SECRETS.map(
              (s) =>
                ({
                  kind: found.includes(s.id) ? "ok" : "dim",
                  text: found.includes(s.id) ? ` [✓] ${s.label}` : ` [ ] ??? — ${s.hint}`,
                }) as Line,
            ),
          ]);
          break;
        }

        case "hack":
          runHack();
          break;

        case "rm":
          print([
            isSudo
              ? {
                  kind: "err",
                  text: "rm: cannot remove '/': deployed on GitHub Pages — immutability is a feature.",
                }
              : { kind: "err", text: "nice try. this box has snapshots." },
          ]);
          break;

        case "sudo":
          print([{ kind: "err", text: "usage: sudo <command> — with great power, etc." }]);
          break;

        case "clear":
          setLines([]);
          break;

        case "exit":
          setOpen(false);
          break;

        case "vim":
        case "nano":
        case "emacs":
          print([{ kind: "err", text: `${cmd}: opening... just kidding, you would never escape.` }]);
          break;

        default:
          print([
            {
              kind: "err",
              text: isSudo
                ? `sudo: ${cmd}: command not found — root does not fix typos.`
                : `command not found: ${cmd} — try \`help\``,
            },
          ]);
      }
    },
    [print, runHack, navigate],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !busy) {
      exec(input);
      setInput("");
      draft.current = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx === -1) draft.current = input; // remember the line being typed
      const next = Math.min(histIdx + 1, history.length - 1);
      if (history[next] !== undefined) {
        setHistIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx <= -1) return; // not navigating history — leave the draft alone
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next < 0 ? draft.current : history[next]);
    } else if (e.key === "Tab" && !e.shiftKey) {
      // Shift+Tab is deliberately NOT intercepted: it is the keyboard escape
      // route out of the input to the close button.
      e.preventDefault();
      const parts = input.split(/\s+/);
      const leading = parts[0] === "" ? 1 : 0;
      const first = parts[leading] ?? "";
      const rest = parts.slice(leading + 1);
      if (rest.length === 0) {
        const match = COMMANDS.find((c) => c.startsWith(first.toLowerCase()) && first !== "");
        if (match) setInput(match + " ");
      } else {
        const partial = rest[rest.length - 1];
        const base = first.toLowerCase() === "sudo" ? (parts[leading + 1] ?? "") : first;
        const pool: readonly string[] = base.toLowerCase() === "theme" ? THEMES : FILES;
        const match = pool.find((f) => f.startsWith(partial) && partial !== "");
        if (match) setInput([first, ...rest.slice(0, -1), match].join(" "));
      }
    }
  };

  // keep Tab focus inside the dialog (only two focusables: close button, input)
  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === closeRef.current) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-950/70 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Interactive terminal"
      ref={dialogRef}
      onKeyDown={onDialogKeyDown}
    >
      <div className="crt flex h-[72vh] max-h-[600px] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-ink-600 bg-ink-950/95 shadow-glow-lg">
        <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-850 px-4 py-3">
          <button
            ref={closeRef}
            aria-label="Close terminal"
            onClick={() => setOpen(false)}
            className="h-3 w-3 rounded-full bg-[#ff5f56] transition-transform hover:scale-125"
          />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-xs text-ash">guest@moonw4lk: ~</span>
          <span className="ml-auto hidden font-mono text-[11px] text-ash sm:inline">
            esc to close · shift+tab to exit field
          </span>
        </div>

        <div
          ref={bodyRef}
          className="terminal-body flex-1 space-y-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((l, i) => (
            <p
              key={i}
              className={
                l.kind === "in"
                  ? "text-slate-200"
                  : l.kind === "ok"
                    ? "text-acid"
                    : l.kind === "err"
                      ? "text-[#ff8b8b]"
                      : l.kind === "dim"
                        ? "text-ash"
                        : "text-slate-300"
              }
            >
              {l.kind === "in" && <span className="mr-2 select-none text-acid">$</span>}
              <span className="whitespace-pre-wrap break-words">{l.text}</span>
            </p>
          ))}

          <div className="flex items-center">
            <span className="mr-2 select-none font-mono text-acid">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (histIdx === -1) draft.current = e.target.value;
              }}
              onKeyDown={onKeyDown}
              disabled={busy}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label="Terminal input"
              className="w-full bg-transparent font-mono text-[13px] text-slate-100 caret-acid outline-none placeholder:text-ash"
              placeholder={busy ? "" : "help"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
