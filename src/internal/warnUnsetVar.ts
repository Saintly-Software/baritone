// Prod-safe by construction: a browser production bundle replaces
// `process.env.NODE_ENV` with `"production"`, so this folds to `false` and the
// dev-only path dead-code-eliminates. React already requires `NODE_ENV` to be
// defined, so reading it unguarded is safe. (Not `typeof process === "undefined"
// || …` — that's `true` when `process` is undefined, leaking the dev path into prod.)
export const isDev = (): boolean => process.env.NODE_ENV !== "production";

// `--…-<name>` custom properties already warned about, so a page full of
// elements naming the same unset var warns once, not once per element. Keyed
// by the resolved CSS var (unique per prop/name pair).
const warnedUnsetVars = new Set<string>();

/**
 * Dev-only guard for the open-ended, theme-published vocabularies (`size`,
 * `weight`, `lineHeight`, `font`, `letterSpacing`, border `thickness`). When a
 * prop names a `--…-<name>` the active theme never published, the reference
 * silently collapses to the recipe's fallback instead of doing anything
 * visibly wrong — easy to ship by accident (a typo, or a name never wired into
 * the theme). Probes the resolved value once per var and warns the dev.
 *
 * Skipped under jsdom (unit tests): it doesn't resolve stylesheet custom
 * properties, so every themed element would report as unset. This is a
 * real-browser aid (dev server, Storybook).
 */
export function warnIfVarUnset(
  el: HTMLElement | null,
  cssVar: string,
  message: () => string,
): void {
  if (el == null || warnedUnsetVars.has(cssVar)) return;
  if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) return;
  if (getComputedStyle(el).getPropertyValue(cssVar).trim() !== "") return;
  warnedUnsetVars.add(cssVar);
  console.warn(message());
}
