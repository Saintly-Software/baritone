export const isDev = (): boolean => process.env.NODE_ENV !== "production";

const warnedUnsetVars = new Set<string>();

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
