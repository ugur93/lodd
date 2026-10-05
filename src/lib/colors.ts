export type PaletteColor = {
  name: string;
  hex: string;
  aliases: string[];
};

export const PALETTE: PaletteColor[] = [
  { name: "Rød", hex: "#C62828", aliases: ["rod", "red", "rød"] },
  { name: "Blå", hex: "#1565C0", aliases: ["bla", "blå", "blue"] },
  { name: "Gul", hex: "#D4A017", aliases: ["gul", "yellow", "gull"] },
  { name: "Grønn", hex: "#2E7D32", aliases: ["gronn", "grønn", "green"] },
  { name: "Rosa", hex: "#C2185B", aliases: ["rosa", "pink"] },
  { name: "Oransje", hex: "#E65100", aliases: ["oransje", "orange"] },
  { name: "Turkis", hex: "#00838F", aliases: ["turkis", "cyan", "teal"] },
  { name: "Lilla", hex: "#5E35B1", aliases: ["lilla", "fiolett", "purple", "violet"] },
  { name: "Brun", hex: "#6D4C41", aliases: ["brun", "brown"] },
  { name: "Svart", hex: "#212121", aliases: ["svart", "black"] },
  { name: "Hvit", hex: "#F3EEE6", aliases: ["hvit", "white"] },
  { name: "Grå", hex: "#616161", aliases: ["gra", "grå", "gray", "grey"] },
];

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("ø", "o")
    .replaceAll("æ", "ae")
    .replaceAll("å", "a");
}

export function colorFromName(name: string): PaletteColor | undefined {
  const key = normalize(name);
  return PALETTE.find(
    (c) => normalize(c.name) === key || c.aliases.some((a) => normalize(a) === key),
  );
}

export function hexForColorName(name: string, fallback = "#C62828") {
  return colorFromName(name)?.hex ?? fallback;
}

export function parseHex(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = Number.parseInt(h, 16);
  if (!Number.isFinite(n) || h.length !== 6) return { r: 0.2, g: 0.15, b: 0.12 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

export function isLightHex(hex: string) {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.62;
}

export function mixHex(hex: string, toward: string, amount: number) {
  const a = parseHex(hex);
  const b = parseHex(toward);
  const m = (x: number, y: number) => Math.round((x + (y - x) * amount) * 255);
  return `#${[m(a.r, b.r), m(a.g, b.g), m(a.b, b.b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function ticketInk(hex: string) {
  return isLightHex(hex) ? "#1c1814" : "#faf6ef";
}
