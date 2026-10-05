import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

type Props = {
  active: boolean;
  colors: string[];
};

export function ConfettiCanvas({ active, colors }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let running = true;
    const palette = colors.length ? colors : ["#C62828", "#1565C0", "#D4A017", "#2E7D32", "#f4efe6"];

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();

    const w = () => canvas.clientWidth;
    const h = () => canvas.clientHeight;
    const particles: Particle[] = Array.from({ length: 140 }, (_, i) => ({
      x: w() * 0.5 + (Math.random() - 0.5) * w() * 0.35,
      y: h() * 0.32 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 14,
      vy: -4 - Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.28,
      w: 6 + Math.random() * 9,
      h: 4 + Math.random() * 7,
      color: palette[i % palette.length]!,
      life: 1,
    }));

    const gravity = 0.18;
    const start = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      const elapsed = now - start;
      ctx.clearRect(0, 0, w(), h());
      for (const p of particles) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 4200);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (elapsed < 4300) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [active, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-20 size-full"
      aria-hidden
    />
  );
}
