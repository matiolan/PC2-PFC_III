import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/lib/**"],
      exclude: ["src/lib/supabase/**", "src/lib/**/*.types.ts", "src/lib/auth.ts", "src/lib/request.ts"],
      // El pipeline falla si la cobertura de la lógica de dominio baja de estos umbrales.
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
  },
});
