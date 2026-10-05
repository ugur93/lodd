import { Monitor, RotateCcw, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { expandPool } from "@/lib/tickets";
import { useRaffleStore } from "@/lib/store";

export function AppHeader() {
  const eventName = useRaffleStore((s) => s.eventName);
  const setEventName = useRaffleStore((s) => s.setEventName);
  const books = useRaffleStore((s) => s.books);
  const drawnKeys = useRaffleStore((s) => s.drawnKeys);
  const winners = useRaffleStore((s) => s.winners);
  const undoLast = useRaffleStore((s) => s.undoLast);
  const newRound = useRaffleStore((s) => s.newRound);
  const resetAll = useRaffleStore((s) => s.resetAll);
  const stageMode = useRaffleStore((s) => s.stageMode);
  const setStageMode = useRaffleStore((s) => s.setStageMode);
  const remaining = expandPool(books, drawnKeys).length;
  const [confirm, setConfirm] = useState<"round" | "reset" | null>(null);

  return (
    <header className="flex flex-col gap-4 border-b border-border/80 pb-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-widest text-muted uppercase">Basar · lotteri</p>
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Lodd</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setStageMode(!stageMode)}
            aria-pressed={stageMode}
          >
            <Monitor className="size-4" />
            Storskjerm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={winners.length === 0}
            onClick={() => {
              undoLast();
              toast("Siste trekk angret");
            }}
          >
            <Undo2 className="size-4" />
            Angre
          </Button>
          {confirm === "round" ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  newRound();
                  setConfirm(null);
                  toast("Ny runde — samme bøker, tom vinnerliste");
                }}
              >
                Bekreft ny runde
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                Avbryt
              </Button>
            </>
          ) : confirm === "reset" ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  resetAll();
                  setConfirm(null);
                  toast("Alt er tømt");
                }}
              >
                Bekreft tømming
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                Avbryt
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirm("round")}>
                <RotateCcw className="size-4" />
                Ny runde
              </Button>
              <Button variant="ghost" size="sm" className="text-muted" onClick={() => setConfirm("reset")}>
                Tøm alt
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
        <label className="grid min-w-0 flex-1 gap-1.5">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">Navn på trekningen</span>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            aria-label="Navn på trekningen"
            className="min-w-0 max-w-md"
          />
        </label>
        <p className="text-sm text-muted tabular-nums sm:pb-2.5">
          {remaining} lodd igjen
          {winners.length ? ` · ${winners.length} trukket` : ""}
          {books.length ? ` · ${books.length} bøker` : ""}
        </p>
      </div>
    </header>
  );
}
