import { copyFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "dist-pages");
copyFileSync(resolve(out, "index.html"), resolve(out, "404.html"));
writeFileSync(resolve(out, ".nojekyll"), "");
