import { resolve } from "node:path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build. Externalises React + base-ui (peer deps) but bundles the
// vanilla-extract runtime helpers so consumers can use the pre-compiled output
// without configuring the VE plugin.
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    dts({
      // Config lives in .config/, so point dts at the relocated tsconfig (it
      // otherwise auto-resolves tsconfig.json from the vite root).
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
      // Two entries: the main barrel and a `DataTable`-only subpath, so
      // `@tanstack/react-table` (below) is only ever referenced from
      // `datatable.js` — importing the main entry never touches the table engine.
      entry: {
        index: resolve(__dirname, "../src/index.ts"),
        datatable: resolve(__dirname, "../src/datatable.ts"),
        form: resolve(__dirname, "../src/form.ts"),
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
        // Peer dependency — leave external instead of bundling; bundling it is
        // what dragged its CJS `require("react")` interop into the ESM output.
        /^@tanstack\/react-table/,
        // Likewise a peer dep, reached only from `form.ts`. Its `form-core`/
        // `react-store` deps re-export through this one specifier, so
        // externalising it keeps the whole family out of the runtime bundle.
        /^@tanstack\/react-form/,
        // The VE *compiler* is build-time only (used by createDesignSystemTheme
        // in consumers' .css.ts) and an optional peer, so it's kept out of the
        // runtime bundle. The small VE *runtime* helpers stay bundled instead.
        "@vanilla-extract/css",
      ],
    },
  },
});
