export const isDev = (): boolean => process.env.NODE_ENV !== "production";

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
