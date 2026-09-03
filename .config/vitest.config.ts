import { resolve } from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Absolute path to the repo-root .storybook dir — a relative configDir resolves
// against process.cwd(), which breaks when Vitest runs from elsewhere (e.g. a worktree).
const storybookConfigDir = resolve(__dirname, "../.storybook");

// Two test "kinds" live side by side as separate Vitest projects:
//
//   • unit      — fast component/logic tests (`*.test.{ts,tsx}`) in jsdom.
//   • storybook — every `*.stories.tsx` rendered in real Chromium via Playwright,
//                 running each story's `play` function as an interaction test.
//
// Run everything with `pnpm test`, or one kind with `pnpm test:unit` /
// `pnpm test:storybook`.
export default defineConfig({
  test: {
    projects: [
      {
        // Reuse the same React + vanilla-extract pipeline the library build uses.
        plugins: [react(), vanillaExtractPlugin()],
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          css: true,
        },
      },
      {
        // The Storybook plugin derives test files from the `stories` glob in
        // .storybook/main.ts and pulls in that config's Vite pipeline (including
        // vanilla-extract). Since Storybook 10.3 it also applies preview
        // annotations itself, so no include/plugins/setupFiles are needed here.
        plugins: [storybookTest({ configDir: storybookConfigDir })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
