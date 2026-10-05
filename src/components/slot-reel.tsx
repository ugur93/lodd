import { useEffect, useMemo, useRef } from "react";
import { ticketInk } from "@/lib/colors";
import { cn } from "@/lib/utils";

export type SlotItem = {
  id: string;
  label: string;
  color?: string;
};

type Props = {
  items: SlotItem[];
  winnerId: string;
  durationMs: number;
  delayMs?: number;
  itemHeight?: number;
  reduced?: boolean;
  locked?: boolean;
  kind?: "color" | "plain";
  onTick?: () => void;
  onStop?: () => void;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(list: T[], seed: string) {
  const a = list.slice();
  const rand = mulberry32(
    seed.split("").reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261),
  );
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function buildStrip(items: SlotItem[], winnerId: string, seed: string): SlotItem[] {
  const pool = items.length ? items : [{ id: winnerId, label: winnerId }];
  const win = pool.find((x) => x.id === winnerId) ?? { id: winnerId, label: winnerId };
  const rest = pool.filter((x) => x.id !== winnerId);
  const cycle = rest.length ? rest : pool;
  const strip: SlotItem[] = [];
  for (let loop = 0; loop < 7; loop++) {
    strip.push(...seededShuffle(cycle, `${seed}:${loop}`));
  }
  if (strip[strip.length - 1]?.id === win.id) {
    const alt = cycle.find((x) => x.id !== win.id);
    if (alt) strip.push(alt);
  }
  strip.push(win);
  return strip;
}

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

export function SlotReel({
  items,
  winnerId,
  durationMs,
  delayMs = 0,
  itemHeight = 76,
  reduced,
  locked,
  kind = "plain",
  onTick,
  onStop,
}: Props) {
  const strip = useMemo(
    () => buildStrip(items, winnerId, `${winnerId}:${durationMs}`),
    [items, winnerId, durationMs],
  );
  const stripRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef(onTick);
  const stopRef = useRef(onStop);
  tickRef.current = onTick;
  stopRef.current = onStop;

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const target = (strip.length - 1) * itemHeight;
    const setY = (y: number, blur = 0) => {
      el.style.transform = `translate3d(0, ${-y}px, 0)`;
      el.style.filter = blur > 0.2 ? `blur(${blur}px)` : "none";
    };

    if (reduced) {
      setY(target);
      stopRef.current?.();
      return;
    }

    setY(0);
    let raf = 0;
    let lastCell = 0;
    let stopped = false;
    const start = performance.now();

    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed < delayMs) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const t = Math.min(1, (elapsed - delayMs) / durationMs);
      const eased = easeOutQuint(t);
      const y = eased * target;
      const speed = (1 - t) * (1 - t);
      setY(y, speed * 1.1);
      const cell = Math.floor(y / itemHeight);
      if (cell !== lastCell) {
        lastCell = cell;
        if (t > 0.35) tickRef.current?.();
      }
      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        setY(target);
        if (!stopped) {
          stopped = true;
          stopRef.current?.();
        }
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [strip, itemHeight, durationMs, delayMs, reduced]);

  return (
    <div className={cn("reel-window", locked && "is-locked")} style={{ height: itemHeight }}>
      <div className="reel-window-mask" aria-hidden />
      <div className="reel-select" aria-hidden />
      <div ref={stripRef} className="will-change-transform">
        {strip.map((item, i) => (
          <ReelCell key={`${item.id}-${i}`} item={item} height={itemHeight} kind={kind} />
        ))}
      </div>
    </div>
  );
}

function ReelCell({
  item,
  height,
  kind,
}: {
  item: SlotItem;
  height: number;
  kind: "color" | "plain";
}) {
  if (kind === "color" && item.color) {
    const ink = ticketInk(item.color);
    return (
      <div className="flex items-center justify-center px-1" style={{ height }}>
        <div
          className="flex h-[78%] w-full items-center justify-center overflow-hidden rounded-sm"
          style={{ backgroundColor: item.color, color: ink }}
        >
          <span className="max-w-full truncate px-1.5 font-ticket text-lg tracking-wide sm:text-xl">
            {item.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center px-1 font-ticket text-4xl tracking-tight text-stage-fg tabular-nums sm:text-5xl"
      style={{ height }}
    >
      {item.label}
    </div>
  );
}
