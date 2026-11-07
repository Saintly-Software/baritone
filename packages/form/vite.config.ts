import { defineConfig } from "vite";
import { libraryConfig } from "../../.config/workspace";

export default defineConfig(
  libraryConfig({
    root: import.meta.dirname,
    entry: { index: "src/index.ts" },
    external: [/^@saintly-software\/baritone(\/|$)/, /^@tanstack\/react-form/],
  }),
);
