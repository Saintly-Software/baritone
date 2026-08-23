// Prod-safe by construction: a browser production bundle replaces
// `process.env.NODE_ENV` with `"production"`, so this folds to `false` and any
// dev-only path (ref composition + effect) built on it dead-code-eliminates. React
// is a peer dep that already requires `process.env.NODE_ENV` to be defined, so
// reading it unguarded is safe wherever this runs. (Deliberately not the
// `typeof process === "undefined" || …` form — that returns `true` in a browser
// where `process` is undefined, which would leak the dev path into production.)
export const isDev = (): boolean => process.env.NODE_ENV !== "production";

// `--…-<name>` custom properties already warned about, so a page full of elements
// naming the same unset var warns once, not once per element. Shared across the
// open-vocabulary consumers (`InternalText`, `Divider`, …) and keyed by the resolved
// CSS var, which is unique per (prop, name) pair.
const warnedUnsetVars = new Set<string>();

/**
 * Dev-only guard shared by the open-ended, theme-published vocabularies (`size`,
 * `weight`, `lineHeight`, `font`, `letterSpacing`, border `thickness`). When a prop
 * names a `--…-<name>` the active theme never published, that inner var is
 * guaranteed-invalid, so the reference built on it collapses to the recipe's
 * *fallback* — instead of doing anything visibly wrong. Easy to ship by accident (a
 * typo, or a name declared on the registry but never wired into the theme). So probe
 * the resolved value once per var and point the dev at the fix.
 *
 * Skipped under jsdom (unit tests): it doesn't resolve stylesheet custom properties,
 * so it would report every themed element as unset. This is a real-browser aid (dev
 * server, Storybook), which is where the mistake shows up.
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
