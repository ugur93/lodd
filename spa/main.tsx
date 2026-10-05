import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "@/app";
import "@/styles.css";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app");

createRoot(root).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      offset={16}
      toastOptions={{
        className: "!font-sans !bg-surface !text-fg !border-border !shadow-[var(--shadow-border)]",
      }}
    />
  </StrictMode>,
);
