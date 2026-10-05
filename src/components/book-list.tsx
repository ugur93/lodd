import { Trash2 } from "lucide-react";
import { TicketCard } from "@/components/ticket-card";
import { remainingInBook } from "@/lib/tickets";
import { useRaffleStore } from "@/lib/store";
import { bookSize } from "@/lib/tickets";

export function BookList() {
  const books = useRaffleStore((s) => s.books);
  const drawnKeys = useRaffleStore((s) => s.drawnKeys);
  const removeBook = useRaffleStore((s) => s.removeBook);

  if (books.length === 0) {
    return (
      <p className="px-1 text-sm text-muted">
        Ingen loddbøker ennå. Legg inn farge, bokstav og nummerområde for bøkene dere har solgt.
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {books.map((book) => {
        const left = remainingInBook(book, drawnKeys);
        const total = bookSize(book);
        return (
          <li
            key={book.id}
            className="flex items-center gap-3 rounded-lg bg-surface p-2 pl-2.5 shadow-[var(--shadow-border)]"
          >
            <TicketCard
              colorName={book.colorName}
              colorHex={book.colorHex}
              letter={book.letter}
              number={book.from}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {book.colorName} {book.letter}
              </p>
              <p className="text-sm text-muted tabular-nums">
                {book.from}–{book.to} · {left} av {total} igjen
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeBook(book.id)}
              className="grid size-11 place-items-center rounded-md text-muted hover:bg-bg-warm hover:text-primary"
              aria-label={`Fjern ${book.colorName} ${book.letter}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
