import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import { resolveFromSource } from "../../../.config/workspace.ts";

const config: StorybookConfig = {
  stories: ["../../../packages/*/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      ...resolveFromSource,
      plugins: [vanillaExtractPlugin()],
    });
  },
};

export default config;
