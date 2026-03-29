import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/land-record-website/",
  plugins: [react()]
});
