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
      include: ["src"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"],
      // Type-only files (contract / theme) re-export fine as separate .d.ts.
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
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
        // The VE *compiler* is build-time only (used by createDesignSystemTheme
        // inside consumers' .css.ts). Keep it out of the runtime bundle; it's an
        // optional peer. The small VE *runtime* helpers (recipes/sprinkles/
        // dynamic) stay bundled so the pre-compiled path needs no VE deps.
        "@vanilla-extract/css",
      ],
    },
  },
});
