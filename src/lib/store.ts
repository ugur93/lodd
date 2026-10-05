import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EXAMPLE_BOOKS,
  expandPool,
  pickTicket,
  remainingInBook,
  ticketKey,
  winnerFromTicket,
} from "@/lib/tickets";
import type { Prize, RaffleSnapshot, TicketBook, Winner } from "@/lib/types";

type DrawResult =
  | { ok: true; winner: Winner; remaining: number }
  | { ok: false; reason: "empty" | "none" };

type RaffleState = RaffleSnapshot & {
  addBook: (book: Omit<TicketBook, "id"> & { id?: string }) => string;
  addBooks: (books: Omit<TicketBook, "id">[]) => void;
  removeBook: (id: string) => void;
  setEventName: (name: string) => void;
  addPrize: (prize: Omit<Prize, "id"> & { id?: string }) => void;
  removePrize: (id: string) => void;
  movePrize: (id: string, dir: -1 | 1) => void;
  draw: () => DrawResult;
  undoLast: () => void;
  newRound: () => void;
  resetAll: () => void;
  loadExample: () => void;
  setStageMode: (on: boolean) => void;
};

const initial: RaffleSnapshot = {
  eventName: "Loddtrekning",
  books: [],
  prizes: [],
  winners: [],
  drawnKeys: [],
  stageMode: false,
};

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set, get) => ({
      ...initial,
      setEventName: (eventName) => set({ eventName }),
      addBook: (book) => {
        const id = book.id ?? crypto.randomUUID();
        set((s) => ({ books: [...s.books, { ...book, id }] }));
        return id;
      },
      addBooks: (books) =>
        set((s) => ({
          books: [
            ...s.books,
            ...books.map((b) => ({ ...b, id: crypto.randomUUID() })),
          ],
        })),
      removeBook: (id) =>
        set((s) => ({
          books: s.books.filter((b) => b.id !== id),
          drawnKeys: s.drawnKeys.filter((k) => !k.startsWith(`${id}:`)),
        })),
      addPrize: (prize) =>
        set((s) => ({
          prizes: [...s.prizes, { ...prize, id: prize.id ?? crypto.randomUUID() }],
        })),
      removePrize: (id) => set((s) => ({ prizes: s.prizes.filter((p) => p.id !== id) })),
      movePrize: (id, dir) =>
        set((s) => {
          const i = s.prizes.findIndex((p) => p.id === id);
          if (i < 0) return s;
          const j = i + dir;
          if (j < 0 || j >= s.prizes.length) return s;
          const next = s.prizes.slice();
          const [row] = next.splice(i, 1);
          if (!row) return s;
          next.splice(j, 0, row);
          return { prizes: next };
        }),
      draw: () => {
        const { books, drawnKeys, prizes } = get();
        if (books.length === 0) return { ok: false, reason: "empty" };
        const pool = expandPool(books, drawnKeys);
        const ticket = pickTicket(pool);
        if (!ticket) return { ok: false, reason: "none" };
        const [prize, ...rest] = prizes;
        const winner = winnerFromTicket(ticket, prize);
        set((s) => ({
          winners: [winner, ...s.winners],
          drawnKeys: [...s.drawnKeys, ticket.key],
          prizes: rest,
        }));
        return { ok: true, winner, remaining: pool.length - 1 };
      },
      undoLast: () =>
        set((s) => {
          const [last, ...rest] = s.winners;
          if (!last) return s;
          const key = ticketKey(last.bookId, last.number);
          const restoredPrize: Prize | null = last.prizeName
            ? {
                id: crypto.randomUUID(),
                name: last.prizeName,
                imageDataUrl: last.prizeImage,
              }
            : null;
          return {
            winners: rest,
            drawnKeys: s.drawnKeys.filter((k) => k !== key),
            prizes: restoredPrize ? [restoredPrize, ...s.prizes] : s.prizes,
          };
        }),
      newRound: () => set({ winners: [], drawnKeys: [] }),
      resetAll: () => set({ ...initial, eventName: get().eventName }),
      loadExample: () =>
        set((s) => ({
          books:
            s.books.length === 0
              ? EXAMPLE_BOOKS.map((b) => ({ ...b, id: crypto.randomUUID() }))
              : s.books,
        })),
      setStageMode: (stageMode) => set({ stageMode }),
    }),
    {
      name: "lodd-raffle-v1",
      skipHydration: true,
      partialize: (s) => ({
        eventName: s.eventName,
        books: s.books,
        prizes: s.prizes,
        winners: s.winners,
        drawnKeys: s.drawnKeys,
        stageMode: s.stageMode,
      }),
    },
  ),
);

export function usePoolCount() {
  const books = useRaffleStore((s) => s.books);
  const drawnKeys = useRaffleStore((s) => s.drawnKeys);
  return expandPool(books, drawnKeys).length;
}

export function useBookRemaining(book: TicketBook) {
  const drawnKeys = useRaffleStore((s) => s.drawnKeys);
  return remainingInBook(book, drawnKeys);
}
