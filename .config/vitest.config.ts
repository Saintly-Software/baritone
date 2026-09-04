import { resolve } from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const storybookConfigDir = resolve(__dirname, "../.storybook");

export default defineConfig({
  test: {
    projects: [
      {
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
