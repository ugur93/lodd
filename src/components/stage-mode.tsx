import { X } from "lucide-react";
import { DrawStage } from "@/components/draw-stage";
import { TicketCard } from "@/components/ticket-card";
import { useRaffleStore } from "@/lib/store";

export function StageMode() {
  const setStageMode = useRaffleStore((s) => s.setStageMode);
  const winners = useRaffleStore((s) => s.winners);
  const eventName = useRaffleStore((s) => s.eventName);

  return (
    <div className="flex min-h-dvh flex-col bg-stage text-stage-fg">
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-stage-muted uppercase">Lodd</p>
          <p className="font-display text-xl tracking-tight">{eventName}</p>
        </div>
        <button
          type="button"
          onClick={() => setStageMode(false)}
          className="inline-flex h-11 items-center gap-2 px-3 text-sm text-stage-muted hover:text-stage-fg"
        >
          <X className="size-4" />
          Avslutt storskjerm
        </button>
      </header>
      <div className="flex flex-1 flex-col justify-center px-4 pb-6">
        <DrawStage />
      </div>
      {winners.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto px-4 pb-5">
          {winners.slice(0, 8).map((w) => (
            <TicketCard
              key={w.id}
              colorName={w.colorName}
              colorHex={w.colorHex}
              letter={w.letter}
              number={w.number}
              size="sm"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
