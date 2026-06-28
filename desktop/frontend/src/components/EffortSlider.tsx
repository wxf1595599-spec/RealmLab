import { useEffect, useRef } from "react";
import type { EffortInfo } from "../lib/types";
import { asArray } from "../lib/array";

// A Claude-style effort control. Below the max level it is a plain track with one
// discrete dot per level (the max dot tinted) and a thumb that snaps to them — no
// animation. Only at the max level does the dithered particle field appear, the
// purple grains streaming Smarter→Faster (right→left).
export function EffortSlider({
  effort,
  disabled,
  onPick,
  title,
}: {
  effort?: EffortInfo;
  disabled?: boolean;
  onPick: (level: string) => void;
  title: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const levels = asArray(effort?.levels);
  const current = effort?.current || "auto";
  const idx = Math.max(0, levels.indexOf(current));
  const isMax = levels.length > 0 && idx === levels.length - 1;
  const ratio = levels.length > 1 ? idx / (levels.length - 1) : 1;

  // The particle field only exists — and only animates — at the max level.
  useEffect(() => {
    if (!isMax) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CELL = 5;
    const hash = (c: number, r: number) => {
      const s = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    let dims = { w: 0, h: 0 };
    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dims = { w, h };
    };

    const draw = (t: number) => {
      const { w, h } = dims;
      if (w === 0 || h === 0) return;
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      ctx.clearRect(0, 0, w, h);
      for (let c = 0; c < cols; c++) {
        const x = cols > 1 ? c / (cols - 1) : 1;
        // purple density rises smoothly toward Smarter; a small floor keeps a few
        // sparse purple cells on the Faster end so it never reads as empty.
        const p = Math.max(0.05, Math.min(1, Math.pow(x, 0.85) * 1.02));
        const flow = t * 0.012;
        // +flow makes the traveling wave drift toward -c, i.e. the grains stream
        // from the Smarter (right) end toward the Faster (left) end.
        const fx = c + flow;
        for (let r = 0; r < rows; r++) {
          const wave =
            0.55 * Math.sin(fx * 0.85 + r * 2.0) +
            0.45 * Math.sin(fx * 0.4 - r * 0.9 + hash(c, r) * 6.283);
          const n = reduce ? hash(c, r) : 0.5 + 0.5 * Math.max(-1, Math.min(1, wave));
          if (n < p) {
            const a = Math.min(1, 0.45 + 0.55 * (n / Math.max(p, 0.01)));
            ctx.fillStyle = `rgba(124,92,255,${a.toFixed(2)})`;
          } else {
            ctx.fillStyle = `rgba(170,178,196,${(0.42 + 0.22 * n).toFixed(2)})`;
          }
          ctx.fillRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
        }
      }
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      if (reduce) draw(1000);
    });
    ro.observe(canvas);

    if (reduce) {
      draw(1000);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last >= 70) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isMax]);

  if (!effort?.supported || levels.length === 0) return null;

  const pickAt = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const nearest = Math.round(r * (levels.length - 1));
    const lvl = levels[Math.min(levels.length - 1, Math.max(0, nearest))];
    if (lvl && lvl !== current) onPick(lvl);
  };

  const stepLevel = (delta: number) => {
    const next = Math.min(levels.length - 1, Math.max(0, idx + delta));
    if (levels[next] && levels[next] !== current) onPick(levels[next]);
  };

  const dotLeft = (i: number) =>
    `calc(11px + ${levels.length > 1 ? i / (levels.length - 1) : 1} * (100% - 22px))`;

  return (
    <div className="effort-slider">
      <div className="effort-slider__head">
        <span className="effort-slider__title">{title}</span>
        <span className="effort-slider__value">{current}</span>
      </div>
      <div className="effort-slider__ends">
        <span>Faster</span>
        <span>Smarter</span>
      </div>
      <div
        className="effort-slider__track"
        role="slider"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={levels.length - 1}
        aria-valuenow={idx}
        aria-valuetext={current}
        tabIndex={disabled ? -1 : 0}
        onClick={(e) => {
          if (!disabled) pickAt(e.clientX, e.currentTarget);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            stepLevel(1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            stepLevel(-1);
          }
        }}
      >
        {isMax ? (
          <canvas ref={canvasRef} className="effort-slider__canvas" aria-hidden="true" />
        ) : (
          levels.map((lvl, i) => (
            <span
              key={lvl}
              className={`effort-slider__dot${i === levels.length - 1 ? " effort-slider__dot--max" : ""}`}
              style={{ left: dotLeft(i) }}
            />
          ))
        )}
        <span
          className="effort-slider__thumb"
          style={{
            // pure-% left (transitions reliably in WebKit) + a px transform offset
            // for the 11px end inset; both are transitioned for a smooth glide.
            left: `${(ratio * 100).toFixed(3)}%`,
            transform: `translate(calc(${(11 - 22 * ratio).toFixed(2)}px - 50%), -50%)`,
          }}
        />
      </div>
    </div>
  );
}
