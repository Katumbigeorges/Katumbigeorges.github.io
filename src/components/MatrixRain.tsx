import { useEffect, useRef } from "react";

/**
 * Depth-layered matrix rain.
 *
 * Each column carries its own speed and depth: far columns are slower,
 * dimmer and slightly smaller; near columns are faster with a bright
 * glowing head glyph. A CSS mask concentrates the rain toward the top
 * right of the hero so it never fights the headline. Pauses when
 * scrolled off-screen.
 */
export default function MatrixRain({ full = false }: { full?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const glyphs = "01</>{}[]#$*+=abcdef0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷ";
    const colWidth = 18;
    const baseFont = 15;

    // theme-aware colors: read the accent triplet from CSS custom props
    const readVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).join(",");
    let acid = readVar("--acid");
    let soft = readVar("--acid-soft");
    const onTheme = () => {
      acid = readVar("--acid");
      soft = readVar("--acid-soft");
    };
    window.addEventListener("theme-change", onTheme);

    type Column = {
      y: number; // head position in px
      speed: number; // px per tick
      depth: number; // 0..1 — scales brightness, speed and size
      trail: number; // trail length in cells (used to respawn cleanly)
    };

    let cols: Column[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;

    const spawn = (h: number, initial = false): Column => {
      const depth = 0.3 + Math.random() * 0.7;
      return {
        y: initial ? Math.random() * h : -Math.random() * h * 0.5,
        speed: (2.6 + Math.random() * 2.6) * depth,
        depth,
        trail: 10 + Math.floor(Math.random() * 16),
      };
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Array.from({ length: Math.ceil(w / colWidth) }, () => spawn(h, true));
      ctx.fillStyle = "#040506";
      ctx.fillRect(0, 0, w, h);
    };

    const pick = () => glyphs[(Math.random() * glyphs.length) | 0];

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      if (now - last < 33) return; // ~30fps
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // slow fade → long soft trails
      ctx.fillStyle = "rgba(4,5,6,0.09)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        const x = i * colWidth;
        c.y += c.speed;

        const size = Math.round(baseFont * (0.75 + c.depth * 0.35));
        ctx.font = `${size}px "JetBrains Mono", monospace`;

        const headY = Math.floor(c.y / size) * size;

        // freshly-dimmed glyph one cell behind the head keeps the trail lively
        ctx.fillStyle = `rgba(${acid},${(0.28 * c.depth).toFixed(3)})`;
        ctx.fillText(pick(), x, headY - size);

        // bright head — near columns get the light, far ones stay subtle
        ctx.fillStyle = `rgba(${soft},${(0.25 + 0.65 * c.depth).toFixed(3)})`;
        ctx.fillText(pick(), x, headY);

        if (headY - c.trail * size > h) cols[i] = spawn(h);
      }
    };

    resize();

    // Mobile browsers fire resize continuously as the URL bar hides and shows,
    // and each resize rebuilds every column — so debounce rather than react to
    // every event. 150ms is below the threshold where a real window drag feels
    // laggy but well above the URL-bar chatter.
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    // pause when the hero is out of view — no work while reading below
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("theme-change", onTheme);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${full ? "opacity-70" : "opacity-50"}`}
      style={
        full
          ? undefined
          : {
              WebkitMaskImage:
                "radial-gradient(130% 100% at 72% 12%, black 30%, rgba(0,0,0,0.35) 62%, transparent 88%)",
              maskImage:
                "radial-gradient(130% 100% at 72% 12%, black 30%, rgba(0,0,0,0.35) 62%, transparent 88%)",
            }
      }
    />
  );
}
