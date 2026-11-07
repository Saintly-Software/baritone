import { resolve } from "node:path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defaultClientConditions, defaultServerConditions, type UserConfig } from "vite";
import dts from "vite-plugin-dts";
import type { ViteUserConfig } from "vitest/config";

/**
 * Export condition that points workspace packages at their TypeScript sources.
 *
 * Dev, test and Storybook MUST resolve it so sibling packages run without a
 * build. Library builds MUST NOT, so each package compiles against the
 * published output of the packages it depends on.
 */
export const SOURCE_CONDITION = "@saintly-software/source";

/**
 * Vite config that resolves workspace packages to their sources, in both the
 * client and SSR environments.
 *
 * Every dev, test and Storybook config MUST spread it. vanilla-extract compiles
 * `.css.ts` files in the SSR environment; without it there, a sibling's theme
 * variables silently stop matching the core's.
 */
export const resolveFromSource = {
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  environments: {
    ssr: { resolve: { conditions: [SOURCE_CONDITION, ...defaultServerConditions] } },
  },
} satisfies UserConfig;

const STORY_AND_TEST_FILES = [
  "src/**/*.stories.tsx",
  "src/**/*.test.ts",
  "src/**/*.test.tsx",
  "src/test/**",
  "src/**/_stories/**",
];

export interface LibraryConfigOptions {
  /** Package directory. */
  root: string;
  /** Entry name → path relative to `root`. Each becomes `dist/<name>.js`. */
  entry: Record<string, string>;
  /** Dependencies left as imports instead of being bundled. */
  external: (string | RegExp)[];
}

/** Vite config that builds a workspace package into `dist/`. */
export function libraryConfig({ root, entry, external }: LibraryConfigOptions): UserConfig {
  return {
    root,
    plugins: [
      react(),
      vanillaExtractPlugin(),
      dts({
        tsconfigPath: resolve(root, "tsconfig.json"),
        compilerOptions: { rootDir: resolve(root, "src"), customConditions: [] },
        include: ["src"],
        exclude: STORY_AND_TEST_FILES,
      }),
    ],
    build: {
      lib: {
        entry: Object.fromEntries(
          Object.entries(entry).map(([name, path]) => [name, resolve(root, path)]),
        ),
        formats: ["es"],
        fileName: (_format, entryName) => `${entryName}.js`,
        cssFileName: "styles",
      },
      cssCodeSplit: false,
      sourcemap: true,
      rollupOptions: {
        external: ["react", "react-dom", "react/jsx-runtime", ...external],
      },
    },
  };
}

/** Vitest project that runs a package's `*.test.ts(x)` files in jsdom. */
export function unitTestConfig(name: string): ViteUserConfig {
  return {
    ...resolveFromSource,
    plugins: [react(), vanillaExtractPlugin()],
    test: {
      name: `unit:${name}`,
      globals: true,
      environment: "jsdom",
      setupFiles: [resolve(import.meta.dirname, "vitest.setup.ts")],
      include: ["src/**/*.test.{ts,tsx}"],
      css: true,
    },
  };
}
