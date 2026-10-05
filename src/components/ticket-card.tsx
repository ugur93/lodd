import { ticketInk } from "@/lib/colors";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "hero";

const sizes: Record<Size, string> = {
  sm: "h-16 w-[7.5rem] text-[0.55rem]",
  md: "h-[5.5rem] w-[11.5rem] text-[0.7rem]",
  lg: "h-36 w-[18rem] text-sm",
  hero: "h-52 w-[min(100%,22rem)] text-base sm:h-56 sm:w-[24rem]",
};

type Props = {
  colorName: string;
  colorHex: string;
  letter: string;
  number?: number | string;
  size?: Size;
  className?: string;
  dimmed?: boolean;
};

export function TicketCard({
  colorName,
  colorHex,
  letter,
  number,
  size = "md",
  className,
  dimmed,
}: Props) {
  const ink = ticketInk(colorHex);
  const num =
    typeof number === "number" ? String(number).padStart(3, "0") : (number ?? "•••");

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-md select-none max-w-full",
        sizes[size],
        dimmed && "opacity-50 grayscale-[0.2]",
        className,
      )}
      style={{
        backgroundColor: colorHex,
        color: ink,
        boxShadow: "var(--shadow-border)",
      }}
      aria-label={`${colorName} ${letter} ${num}`}
    >
      <div
        className="flex w-[18%] shrink-0 flex-col items-center justify-center border-r border-dashed"
        style={{
          borderColor: `${ink}33`,
          background: `color-mix(in oklab, ${colorHex} 78%, #000 22%)`,
        }}
      >
        <span
          className="font-ticket leading-none tracking-wide"
          style={{ fontSize: size === "hero" ? "1.65rem" : size === "lg" ? "1.25rem" : "0.85rem" }}
        >
          {letter}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between px-2.5 py-1.5 sm:px-3 sm:py-2">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate font-medium tracking-wide uppercase opacity-90">{colorName}</span>
          <span className="font-ticket tracking-wider opacity-70">LODD</span>
        </div>
        <div
          className="font-ticket leading-none tracking-tight tabular-nums"
          style={{
            fontSize:
              size === "hero"
                ? "4.25rem"
                : size === "lg"
                  ? "2.75rem"
                  : size === "md"
                    ? "1.85rem"
                    : "1.15rem",
          }}
        >
          {num}
        </div>
        <div className="flex justify-between text-[0.65em] tracking-[0.18em] uppercase opacity-70">
          <span>
            {colorName} {letter}
          </span>
          <span>basar</span>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[18%] w-3 -translate-x-1/2"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-bg) 3px, transparent 3.5px)`,
          backgroundSize: "12px 11px",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
