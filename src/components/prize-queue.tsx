import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resizeImageFile } from "@/lib/image";
import { useRaffleStore } from "@/lib/store";

export function PrizeQueue() {
  const prizes = useRaffleStore((s) => s.prizes);
  const addPrize = useRaffleStore((s) => s.addPrize);
  const removePrize = useRaffleStore((s) => s.removePrize);
  const movePrize = useRaffleStore((s) => s.movePrize);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Velg et bilde");
      return;
    }
    try {
      const data = await resizeImageFile(file);
      setImage(data);
    } catch {
      toast.error("Kunne ikke lese bildet");
    }
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed && !image) {
      toast.error("Skriv premienavn eller last opp bilde");
      return;
    }
    addPrize({ name: trimmed || "Premie", imageDataUrl: image });
    setName("");
    setImage(undefined);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <h2 className="font-display text-xl tracking-tight">Premier</h2>
      <p className="mb-4 text-sm text-muted">Valgfritt. Neste premie i køen brukes automatisk ved trekning.</p>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="prize-name">Premie</Label>
          <Input
            id="prize-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="f.eks. Marsipankake"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="size-4" />
            {image ? "Bytt bilde" : "Bilde av premie"}
          </Button>
          {image ? (
            <img
              src={image}
              alt=""
              className="size-14 rounded-md object-cover"
            />
          ) : null}
          <Button type="button" onClick={submit} className="ml-auto">
            Legg i kø
          </Button>
        </div>
      </div>

      {prizes.length > 0 ? (
        <ol className="mt-4 grid gap-2">
          {prizes.map((prize, i) => (
            <li
              key={prize.id}
              className="flex items-center gap-3 rounded-lg bg-bg p-2 shadow-[var(--shadow-border)]"
            >
              {prize.imageDataUrl ? (
                <img
                  src={prize.imageDataUrl}
                  alt=""
                  className="size-12 rounded-sm object-cover"
                />
              ) : (
                <div className="grid size-12 place-items-center rounded-sm bg-bg-warm font-ticket text-muted">
                  {i + 1}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">Premie {i + 1}</p>
                <p className="truncate font-medium">{prize.name}</p>
              </div>
              <div className="flex">
                <button
                  type="button"
                  className="grid size-10 place-items-center text-muted hover:text-fg disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => movePrize(prize.id, -1)}
                  aria-label="Flytt opp"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  className="grid size-10 place-items-center text-muted hover:text-fg disabled:opacity-30"
                  disabled={i === prizes.length - 1}
                  onClick={() => movePrize(prize.id, 1)}
                  aria-label="Flytt ned"
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  className="grid size-10 place-items-center text-muted hover:text-primary"
                  onClick={() => removePrize(prize.id)}
                  aria-label="Fjern premie"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
