import { resolve } from "node:path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    dts({
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
      include: ["src"],
      exclude: [
        "src/**/*.stories.tsx",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/test/**",
        "src/components/_stories/**",
      ],
    }),
  ],
  build: {
    lib: {
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
        /^@tanstack\/react-table/,
        /^@tanstack\/react-form/,
        "@vanilla-extract/css",
      ],
    },
  },
});
