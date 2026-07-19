import { resolve } from "node:path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build. We externalise React + base-ui (`@base-ui/react`, peer deps)
// but BUNDLE the
// vanilla-extract runtime helpers (createRuntimeFn / sprinkles / dynamic) so
// consumers can use the pre-compiled output without configuring the VE plugin.
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    dts({
      // Config now lives in .config/, so point dts at the relocated tsconfig
      // (it otherwise auto-resolves tsconfig.json from the vite root).
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
      include: ["src"],
      exclude: [
        "src/**/*.stories.tsx",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/test/**",
        "src/components/_stories/**",
      ],
      // Type-only files (contract / theme) re-export fine as separate .d.ts.
    }),
  ],
  build: {
    lib: {
      // Two entries: the main barrel and a `DataTable`-only subpath. Keeping
      // `DataTable` in its own entry means `@tanstack/react-table` (below) is
      // only ever referenced from `datatable.js` — importing the main entry
      // never touches the table engine.
      entry: {
        index: resolve(__dirname, "../src/index.ts"),
        datatable: resolve(__dirname, "../src/datatable.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "styles",
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        /^@base-ui\/react/,
        // `@tanstack/react-table` is a peer dependency (consumers install it),
        // so leave it external instead of bundling it — bundling the peer is
        // what dragged its CJS `require("react")` interop into the ESM output.
        /^@tanstack\/react-table/,
        // The VE *compiler* is build-time only (used by createDesignSystemTheme
        // inside consumers' .css.ts). Keep it out of the runtime bundle; it's an
        // optional peer. The small VE *runtime* helpers (recipes/sprinkles/
        // dynamic) stay bundled so the pre-compiled path needs no VE deps.
        "@vanilla-extract/css",
      ],
    },
  },
});
