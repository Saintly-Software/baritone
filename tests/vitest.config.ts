import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "conventions",
    environment: "node",
    include: ["*.test.ts"],
  },
});
