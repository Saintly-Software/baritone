import { defineConfig } from "vite";
import { libraryConfig } from "../../.config/workspace";

export default defineConfig(
  libraryConfig({
    root: import.meta.dirname,
    entry: { index: "src/index.ts", internal: "src/internal/index.ts" },
    external: [/^@base-ui\/react/, "@vanilla-extract/css"],
  }),
);
