import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketCard } from "@/components/ticket-card";
import { PALETTE, colorFromName, hexForColorName } from "@/lib/colors";
import { useRaffleStore } from "@/lib/store";
import { BOOK_LETTERS, bookFromParsed, parseBookLines } from "@/lib/tickets";
import { cn } from "@/lib/utils";

export function AddBookForm() {
  const addBook = useRaffleStore((s) => s.addBook);
  const addBooks = useRaffleStore((s) => s.addBooks);
  const [colorName, setColorName] = useState("Rød");
  const [colorHex, setColorHex] = useState("#C62828");
  const [letter, setLetter] = useState("A");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(100);
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const previewHex = colorHex || hexForColorName(colorName);

  const bulkCount = useMemo(() => parseBookLines(bulk).length, [bulk]);

  function onColorChip(name: string, hex: string) {
    setColorName(name);
    setColorHex(hex);
  }

  function onColorNameChange(value: string) {
    setColorName(value);
    const known = colorFromName(value);
    if (known) setColorHex(known.hex);
  }

  function submitBook() {
    const name = colorName.trim();
    const lettr = letter.trim().toUpperCase();
    if (!name || !lettr) {
      toast.error("Farge og bokstav må fylles ut");
      return;
    }
    if (from < 1 || to < from || to > 9999) {
      toast.error("Ugyldig nummerområde");
      return;
    }
    addBook({ colorName: name, colorHex: previewHex, letter: lettr, from, to });
    toast.success(`La til ${name} ${lettr} ${from}–${to}`);
  }

  function submitBulk() {
    const parsed = parseBookLines(bulk);
    if (parsed.length === 0) {
      toast.error("Fant ingen gyldige linjer. Format: Rød A 1–100");
      return;
    }
    addBooks(parsed.map(bookFromParsed));
    setBulk("");
    setShowBulk(false);
    toast.success(`La til ${parsed.length} loddbok${parsed.length === 1 ? "" : "er"}`);
  }

  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Loddbøker</h2>
          <p className="text-sm text-muted">Farge, bokstav og solgte nummer (1–100).</p>
        </div>
        <button
          type="button"
          className="text-sm text-muted underline-offset-2 hover:text-fg hover:underline"
          onClick={() => setShowBulk((v) => !v)}
        >
          {showBulk ? "Skjema" : "Hurtiginnlegging"}
        </button>
      </div>

      {showBulk ? (
        <div className="grid gap-3">
          <Label htmlFor="bulk">Én bok per linje</Label>
          <textarea
            id="bulk"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={6}
            placeholder={"Rød A 1-100\nBlå L 1-59\nGul B 20-100"}
            className="w-full resize-y rounded-md bg-bg px-3 py-2 font-mono text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button onClick={submitBulk} disabled={bulkCount === 0}>
            Legg til {bulkCount || ""} {bulkCount === 1 ? "bok" : "bøker"}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Farge</Label>
            <div className="flex flex-wrap gap-1.5">
              {PALETTE.map((c) => {
                const active = colorName.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onColorChip(c.name, c.hex)}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-sm px-2.5 text-sm",
                      "shadow-[var(--shadow-border)]",
                      active ? "ring-2 ring-fg/70" : "hover:shadow-[var(--shadow-border-hover)]",
                    )}
                    style={{ background: c.hex, color: c.name === "Hvit" || c.name === "Gul" ? "#1c1814" : "#faf6ef" }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
              <Input
                value={colorName}
                onChange={(e) => onColorNameChange(e.target.value)}
                placeholder="Fargenavn"
                aria-label="Fargenavn"
              />
              <label
                className="relative size-11 overflow-hidden rounded-md shadow-[var(--shadow-border)]"
                style={{ backgroundColor: previewHex }}
              >
                <span className="sr-only">Velg farge</span>
                <input
                  type="color"
                  value={previewHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Bokstav</Label>
            <div className="grid grid-cols-7 gap-1 sm:grid-cols-9">
              {BOOK_LETTERS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLetter(l)}
                  className={cn(
                    "grid h-11 place-items-center rounded-sm font-ticket text-sm shadow-[var(--shadow-border)]",
                    letter === l ? "bg-fg text-bg" : "bg-surface text-fg hover:bg-bg-warm",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Input
              value={letter}
              maxLength={8}
              onChange={(e) => setLetter(e.target.value.toUpperCase())}
              aria-label="Bokstav"
              className="max-w-32 font-ticket tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="from">Fra nummer</Label>
              <Input
                id="from"
                type="number"
                min={1}
                max={9999}
                value={from}
                onChange={(e) => setFrom(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="to">Til nummer</Label>
              <Input
                id="to"
                type="number"
                min={1}
                max={9999}
                value={to}
                onChange={(e) => setTo(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              [1, 50],
              [1, 100],
              [1, 200],
            ].map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => {
                  setFrom(a!);
                  setTo(b!);
                }}
                className="h-8 rounded-sm bg-bg-warm px-2.5 text-xs text-muted hover:text-fg"
              >
                {a}–{b}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <TicketCard
              colorName={colorName || "Farge"}
              colorHex={previewHex}
              letter={letter || "?"}
              number={from}
              size="md"
            />
            <Button onClick={submitBook} className="min-w-40">
              <Plus className="size-4" />
              Legg til bok
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
