import { AddBookForm } from "@/components/add-book-form";
import { AppHeader } from "@/components/app-header";
import { BookList } from "@/components/book-list";
import { DrawStage } from "@/components/draw-stage";
import { PrizeQueue } from "@/components/prize-queue";
import { StageMode } from "@/components/stage-mode";
import { TicketCard } from "@/components/ticket-card";
import { Button } from "@/components/ui/button";
import { WinnersPanel } from "@/components/winners-panel";
import { EXAMPLE_BOOKS } from "@/lib/tickets";
import { useHydrated } from "@/lib/use-hydrated";
import { useRaffleStore } from "@/lib/store";

export function App() {
  useHydrated();
  const stageMode = useRaffleStore((s) => s.stageMode);
  const books = useRaffleStore((s) => s.books);
  const addBooks = useRaffleStore((s) => s.addBooks);

  if (stageMode) return <StageMode />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:py-10">
      <AppHeader />

      {books.length === 0 ? (
        <EmptyIntro onExample={() => addBooks(EXAMPLE_BOOKS.map((b) => ({ ...b })))} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col gap-6">
          <AddBookForm />
          <BookList />
          <PrizeQueue />
        </div>
        <div className="flex flex-col gap-6">
          <DrawStage />
          <WinnersPanel />
        </div>
      </div>
    </main>
  );
}

function EmptyIntro({ onExample }: { onExample: () => void }) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            Trekk lodd slik det gjøres på basaren
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Legg inn loddbøkene med farge, bokstav og nummer 1–100. Hvert trekk er tilfeldig
            blant solgte lodd, og det samme loddet trekkes aldri to ganger. Valgfritt bilde av
            premien, vinnerliste og PDF.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={onExample}>Fyll med eksempelbøker</Button>
            <p className="self-center text-sm text-muted">Rød, blå, gul og grønn A 1–100</p>
          </div>
        </div>
        <div className="hidden shrink-0 lg:flex lg:-space-x-10">
          {EXAMPLE_BOOKS.map((b, i) => (
            <div key={b.colorName} style={{ transform: `rotate(${(i - 1.5) * 6}deg)` }}>
              <TicketCard
                colorName={b.colorName}
                colorHex={b.colorHex}
                letter={b.letter}
                number={17 + i * 11}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
