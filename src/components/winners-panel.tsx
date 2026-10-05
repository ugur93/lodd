import { Download, Trophy } from "lucide-react";
import { toast } from "sonner";
import { TicketCard } from "@/components/ticket-card";
import { Button } from "@/components/ui/button";
import { openWinnersPrint } from "@/lib/export-pdf";
import { useRaffleStore } from "@/lib/store";

export function WinnersPanel() {
  const winners = useRaffleStore((s) => s.winners);
  const eventName = useRaffleStore((s) => s.eventName);

  function exportPdf() {
    const ok = openWinnersPrint({ eventName, winners });
    if (!ok) toast.error("Tillat sprettoppvindu for å eksportere PDF");
  }

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Vinnere</h2>
          <p className="text-sm text-muted">
            {winners.length === 0
              ? "Trukne lodd vises her og trekkes ikke igjen."
              : `${winners.length} trukket`}
          </p>
        </div>
        <Button variant="secondary" onClick={exportPdf} disabled={winners.length === 0}>
          <Download className="size-4" />
          Eksporter PDF
        </Button>
      </div>

      {winners.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <Trophy className="size-8 opacity-40" />
          <p className="text-sm">Ingen vinnere ennå. Trykk Trekk vinner når bøkene er klare.</p>
        </div>
      ) : (
        <ol className="grid gap-2">
          {winners.map((w, i) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-lg bg-bg p-2 shadow-[var(--shadow-border)]"
            >
              <span className="grid size-9 shrink-0 place-items-center font-ticket text-muted tabular-nums">
                {winners.length - i}
              </span>
              <TicketCard
                colorName={w.colorName}
                colorHex={w.colorHex}
                letter={w.letter}
                number={w.number}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {w.colorName} {w.letter} {String(w.number).padStart(3, "0")}
                </p>
                <p className="truncate text-sm text-muted">
                  {w.prizeName ?? "Uten premienavn"} ·{" "}
                  {new Date(w.drawnAt).toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {w.prizeImage ? (
                <img src={w.prizeImage} alt="" className="size-12 rounded-sm object-cover" />
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
