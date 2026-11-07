import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = resolve(import.meta.dirname, "..");

export default defineConfig({
  test: {
    projects: [
      resolve(root, "packages/*/vitest.config.ts"),
      resolve(root, "apps/storybook/vitest.config.ts"),
      resolve(root, "tests/vitest.config.ts"),
    ],
  },
});
