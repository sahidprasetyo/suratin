import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // Production builds (and `vite preview` of them) are served from
  // https://sahidprasetyo.github.io/suratin/; the dev server stays at the root.
  base: command === "build" || isPreview ? "/suratin/" : "/",
  plugins: [react(), tailwindcss()],
}));
