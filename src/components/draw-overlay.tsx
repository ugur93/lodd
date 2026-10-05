import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ConfettiCanvas } from "@/components/confetti-canvas";
import { SlotReel, type SlotItem } from "@/components/slot-reel";
import { TicketCard } from "@/components/ticket-card";
import { Button } from "@/components/ui/button";
import {
  getDrawMuted,
  playClunk,
  playFanfare,
  playTick,
  setDrawMuted,
  setSpinEnergy,
  startDrawAmbience,
  stopDrawAmbience,
  unlockDrawAudio,
} from "@/lib/draw-audio";
import type { Winner } from "@/lib/types";
import { useRaffleStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "spin" | "reveal";

type Props = {
  winner: Winner;
  remaining: number;
  onClose: () => void;
  onDrawAgain: () => void;
};

const ITEM_H = 76;

export function DrawOverlay({ winner, remaining, onClose, onDrawAgain }: Props) {
  const books = useRaffleStore((s) => s.books);
  const [phase, setPhase] = useState<Phase>("spin");
  const [locked, setLocked] = useState({ color: false, letter: false, number: false });
  const [muted, setMuted] = useState(false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const colorItems = useMemo<SlotItem[]>(() => {
    const seen = new Set<string>();
    const out: SlotItem[] = [];
    for (const b of books) {
      const id = b.colorName.toUpperCase();
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, label: b.colorName.toUpperCase(), color: b.colorHex });
    }
    if (!seen.has(winner.colorName.toUpperCase())) {
      out.unshift({
        id: winner.colorName.toUpperCase(),
        label: winner.colorName.toUpperCase(),
        color: winner.colorHex,
      });
    }
    return out;
  }, [books, winner.colorHex, winner.colorName]);

  const letterItems = useMemo<SlotItem[]>(() => {
    const fromBooks = Array.from(new Set(books.map((b) => b.letter.toUpperCase())));
    const win = winner.letter.toUpperCase();
    const base = fromBooks.length >= 3 ? fromBooks : "ABCDEFGHJKLMNPRSTUVWXY".split("");
    const ids = new Set(base);
    ids.add(win);
    return [...ids].map((l) => ({ id: l, label: l }));
  }, [books, winner.letter]);

  const numberItems = useMemo<SlotItem[]>(() => {
    const ids = new Set<string>([String(winner.number)]);
    let n = (winner.number * 17 + 31) % 100;
    while (ids.size < 18) {
      ids.add(String(n === 0 ? 100 : n));
      n = (n * 13 + 7) % 100;
    }
    return [...ids].map((id) => ({
      id,
      label: String(Number(id)).padStart(3, "0"),
    }));
  }, [winner.number]);

  const tickerTickets = useMemo(
    () =>
      books.slice(0, 8).flatMap((b, i) => [
        {
          key: `${b.id}-a`,
          colorName: b.colorName,
          colorHex: b.colorHex,
          letter: b.letter,
          number: ((b.from + i * 13) % Math.max(1, b.to)) + 1,
        },
        {
          key: `${b.id}-b`,
          colorName: b.colorName,
          colorHex: b.colorHex,
          letter: b.letter,
          number: ((b.from + i * 29) % Math.max(1, b.to)) + 1,
        },
      ]),
    [books],
  );

  const confettiColors = useMemo(
    () => [...new Set([...books.map((b) => b.colorHex), winner.colorHex, "#f4efe6", "#9f1d2c"])],
    [books, winner.colorHex],
  );

  useEffect(() => {
    setMuted(getDrawMuted());
  }, []);

  useEffect(() => {
    setPhase("spin");
    setLocked({ color: false, letter: false, number: false });
    if (reduced) {
      setPhase("reveal");
      playFanfare();
      return;
    }
    unlockDrawAudio();
    startDrawAmbience();
    return () => stopDrawAmbience();
  }, [winner.id, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "reveal") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, phase]);

  function lock(which: "color" | "letter" | "number") {
    setLocked((s) => {
      if (s[which]) return s;
      playClunk();
      const next = { ...s, [which]: true };
      const count = Number(next.color) + Number(next.letter) + Number(next.number);
      setSpinEnergy(1 - count * 0.32);
      if (next.color && next.letter && next.number) {
        window.setTimeout(() => {
          playFanfare();
          setPhase("reveal");
        }, 380);
      }
      return next;
    });
  }

  function toggleMute() {
    unlockDrawAudio();
    const next = !muted;
    setMuted(next);
    setDrawMuted(next);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-stage text-stage-fg"
      role="dialog"
      aria-modal="true"
      aria-label="Loddtrekning"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 38%, rgb(244 239 230 / 0.1), transparent 62%)",
        }}
      />
      <ConfettiCanvas active={phase === "reveal"} colors={confettiColors} />

      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <p className="text-sm tracking-wide text-stage-muted uppercase">Loddtrekning</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="grid size-11 place-items-center rounded-md text-stage-muted hover:bg-stage-fg/10 hover:text-stage-fg"
            aria-label={muted ? "Slå på lyd" : "Slå av lyd"}
            aria-pressed={!muted}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          {phase === "reveal" ? (
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-3 text-sm text-stage-muted hover:text-stage-fg"
            >
              Lukk
            </button>
          ) : null}
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-8">
        {phase === "spin" ? (
          <div className="w-full max-w-xl">
            {tickerTickets.length > 0 ? (
              <div className="ticket-ticker mb-6" aria-hidden>
                <div className="ticket-ticker-track">
                  {[...tickerTickets, ...tickerTickets].map((t, i) => (
                    <TicketCard
                      key={`${t.key}-${i}`}
                      colorName={t.colorName}
                      colorHex={t.colorHex}
                      letter={t.letter}
                      number={t.number}
                      size="sm"
                      className="shrink-0"
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <p className="mb-5 text-center font-display text-2xl tracking-tight sm:text-3xl">
              Trekker lodd
            </p>
            <div className="machine">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <ReelCol label="Farge" locked={locked.color}>
                  <SlotReel
                    key={`${winner.id}-color`}
                    items={colorItems}
                    winnerId={winner.colorName.toUpperCase()}
                    durationMs={2200}
                    delayMs={40}
                    itemHeight={ITEM_H}
                    reduced={reduced}
                    locked={locked.color}
                    kind="color"
                    onTick={playTick}
                    onStop={() => lock("color")}
                  />
                </ReelCol>
                <ReelCol label="Bokstav" locked={locked.letter}>
                  <SlotReel
                    key={`${winner.id}-letter`}
                    items={letterItems}
                    winnerId={winner.letter.toUpperCase()}
                    durationMs={2800}
                    delayMs={120}
                    itemHeight={ITEM_H}
                    reduced={reduced}
                    locked={locked.letter}
                    onTick={playTick}
                    onStop={() => lock("letter")}
                  />
                </ReelCol>
                <ReelCol label="Nummer" locked={locked.number}>
                  <SlotReel
                    key={`${winner.id}-number`}
                    items={numberItems}
                    winnerId={String(winner.number)}
                    durationMs={3400}
                    delayMs={200}
                    itemHeight={ITEM_H}
                    reduced={reduced}
                    locked={locked.number}
                    onTick={playTick}
                    onStop={() => lock("number")}
                  />
                </ReelCol>
              </div>
            </div>
            <p className="mt-4 text-center text-sm text-stage-muted">
              {locked.number
                ? "Låser resultatet…"
                : locked.letter
                  ? "Siste hjul ruller…"
                  : locked.color
                    ? "To hjul igjen…"
                    : "Trommelen går"}
            </p>
          </div>
        ) : (
          <div className="flex w-full max-w-lg flex-col items-center text-center" aria-live="assertive">
            <p className="rise-in text-sm tracking-widest text-stage-muted uppercase">Vinneren er</p>
            <div className="ticket-pop mt-5">
              <TicketCard
                colorName={winner.colorName}
                colorHex={winner.colorHex}
                letter={winner.letter}
                number={winner.number}
                size="hero"
              />
            </div>
            <p className="rise-in stagger-2 mt-6 font-display text-3xl tracking-tight sm:text-4xl">
              {winner.colorName} {winner.letter}{" "}
              <span className="tabular-nums">{String(winner.number).padStart(3, "0")}</span>
            </p>
            {winner.prizeName || winner.prizeImage ? (
              <div className="rise-in stagger-3 mt-5 flex items-center gap-3 rounded-lg bg-stage-fg/10 px-4 py-3">
                {winner.prizeImage ? (
                  <img src={winner.prizeImage} alt="" className="size-16 rounded-md object-cover" />
                ) : null}
                <div className="text-left">
                  <p className="text-xs tracking-wide text-stage-muted uppercase">Premie</p>
                  <p className="font-medium">{winner.prizeName ?? "Premie"}</p>
                </div>
              </div>
            ) : null}
            <p className="mt-4 text-sm text-stage-muted tabular-nums">{remaining} lodd igjen i puljen</p>
            <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="stage" size="lg" onClick={onDrawAgain} disabled={remaining === 0}>
                Trekk neste
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-stage-fg hover:bg-stage-fg/10"
                onClick={onClose}
              >
                Ferdig
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReelCol({
  label,
  locked,
  children,
}: {
  label: string;
  locked: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-center text-xs tracking-widest text-stage-muted uppercase">{label}</p>
      {children}
      <p
        className={cn(
          "mt-1.5 h-5 text-center text-xs tracking-wide uppercase",
          locked ? "text-stage-fg" : "text-transparent",
        )}
      >
        Låst
      </p>
    </div>
  );
}
