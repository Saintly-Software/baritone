import { resolve } from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Absolute path to the repo-root .storybook dir. The Storybook plugin resolves a
// relative configDir against process.cwd(), which breaks when Vitest is invoked
// from elsewhere (e.g. a git worktree), so pin it off this config's location.
const storybookConfigDir = resolve(__dirname, "../.storybook");

// Two test "kinds" live side by side as separate Vitest projects:
//
//   • unit      — fast component/logic tests (`*.test.{ts,tsx}`) in jsdom.
//   • storybook — every `*.stories.tsx` rendered in a real Chromium browser via
//                 Playwright, running each story's `play` function as an
//                 interaction test (and a render smoke-test for the rest).
//
// Run everything with `pnpm test`, or a single kind with
// `pnpm test:unit` / `pnpm test:storybook` (`vitest --project <name>`).
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
        // The Storybook plugin derives the test files from the `stories` glob in
        // .storybook/main.ts and pulls in that config's Vite pipeline (incl.
        // vanilla-extract via viteFinal). Since Storybook 10.3 it also applies
        // the preview annotations (the theme decorator + parameters) itself, so
        // no include/plugins/setupFiles are needed here.
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
