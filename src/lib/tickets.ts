import { colorFromName, hexForColorName } from "@/lib/colors";
import type { PoolTicket, TicketBook, Winner } from "@/lib/types";

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ".split("");
export const BOOK_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

export function ticketKey(bookId: string, number: number) {
  return `${bookId}:${number}`;
}

export function formatTicket(colorName: string, letter: string, number: number) {
  return `${colorName} ${letter} ${String(number).padStart(3, "0")}`;
}

export function expandPool(books: TicketBook[], drawnKeys: Iterable<string>): PoolTicket[] {
  const drawn = drawnKeys instanceof Set ? drawnKeys : new Set(drawnKeys);
  const pool: PoolTicket[] = [];
  for (const book of books) {
    for (let n = book.from; n <= book.to; n++) {
      const key = ticketKey(book.id, n);
      if (drawn.has(key)) continue;
      pool.push({
        key,
        bookId: book.id,
        colorName: book.colorName,
        colorHex: book.colorHex,
        letter: book.letter,
        number: n,
      });
    }
  }
  return pool;
}

export function remainingInBook(book: TicketBook, drawnKeys: Iterable<string>) {
  const drawn = drawnKeys instanceof Set ? drawnKeys : new Set(drawnKeys);
  let count = 0;
  for (let n = book.from; n <= book.to; n++) {
    if (!drawn.has(ticketKey(book.id, n))) count += 1;
  }
  return count;
}

export function bookSize(book: Pick<TicketBook, "from" | "to">) {
  return Math.max(0, book.to - book.from + 1);
}

/** Unbiased index in [0, length). */
export function randomIndex(length: number) {
  if (length <= 0) return 0;
  const max = 0x1_0000_0000;
  const limit = max - (max % length);
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0]!;
  } while (x >= limit);
  return x % length;
}

export function pickTicket(pool: PoolTicket[]): PoolTicket | null {
  if (pool.length === 0) return null;
  return pool[randomIndex(pool.length)] ?? null;
}

export function winnerFromTicket(
  ticket: PoolTicket,
  prize?: { name?: string; imageDataUrl?: string },
): Winner {
  return {
    id: crypto.randomUUID(),
    drawnAt: Date.now(),
    bookId: ticket.bookId,
    colorName: ticket.colorName,
    colorHex: ticket.colorHex,
    letter: ticket.letter,
    number: ticket.number,
    prizeName: prize?.name?.trim() || undefined,
    prizeImage: prize?.imageDataUrl || undefined,
  };
}

export type ParsedBookLine = {
  colorName: string;
  letter: string;
  from: number;
  to: number;
};

export function parseBookLine(line: string): ParsedBookLine | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const match = trimmed.match(/^(.+?)\s+(\S+)\s+(\d+)\s*[-–—to]+\s*(\d+)$/i);
  if (!match) return null;
  const colorName = match[1]!.trim();
  const letter = match[2]!.trim().toUpperCase();
  const from = Number(match[3]);
  const to = Number(match[4]);
  if (!colorName || !letter || from < 1 || to < from) return null;
  return { colorName, letter, from, to };
}

export function parseBookLines(text: string): ParsedBookLine[] {
  return text
    .split(/\n+/)
    .map(parseBookLine)
    .filter((row): row is ParsedBookLine => row !== null);
}

export function bookFromParsed(parsed: ParsedBookLine): TicketBook {
  const known = colorFromName(parsed.colorName);
  return {
    id: crypto.randomUUID(),
    colorName: known?.name ?? parsed.colorName,
    colorHex: known?.hex ?? hexForColorName(parsed.colorName),
    letter: parsed.letter,
    from: parsed.from,
    to: Math.min(parsed.to, 9999),
  };
}

export const EXAMPLE_BOOKS: Omit<TicketBook, "id">[] = [
  { colorName: "Rød", colorHex: "#C62828", letter: "A", from: 1, to: 100 },
  { colorName: "Blå", colorHex: "#1565C0", letter: "A", from: 1, to: 100 },
  { colorName: "Gul", colorHex: "#D4A017", letter: "A", from: 1, to: 100 },
  { colorName: "Grønn", colorHex: "#2E7D32", letter: "A", from: 1, to: 100 },
];
