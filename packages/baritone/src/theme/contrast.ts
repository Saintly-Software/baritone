import { contrastRatio } from "./color-math";
import { INTENTS, SALIENCIES, SURFACE_SALIENCIES, FORM_STATES } from "./constants";
import type { ThemeTokensInput } from "./contract.css";

export const AA_BODY = 4.5;
export const AA_LARGE_OR_UI = 3.0;

export interface ContrastIssue {
  path: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
}

function check(
  issues: ContrastIssue[],
  path: string,
  foreground: string,
  background: string,
  required: number,
): void {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return;
  if (ratio < required) {
    issues.push({
      path,
      foreground,
      background,
      ratio: Math.round(ratio * 100) / 100,
      required,
    });
  }
}

export function findContrastIssues(tokens: ThemeTokensInput): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  const pageBg = tokens.surface.color.neutral.low.default.bgc;

  for (const intent of INTENTS) {
    for (const saliency of SALIENCIES) {
      const fg = tokens.text.color[intent][saliency];
      const required = saliency === "low" ? AA_LARGE_OR_UI : AA_BODY;
      check(issues, `text.color.${intent}.${saliency}`, fg, pageBg, required);
    }
  }

  for (const intent of INTENTS) {
    for (const saliency of SURFACE_SALIENCIES) {
      const block = tokens.surface.color[intent][saliency].default;
      check(issues, `surface.color.${intent}.${saliency}`, block.text, block.bgc, AA_BODY);
    }
  }

  for (const intent of INTENTS) {
    for (const saliency of SALIENCIES) {
      const block = tokens.component.color[intent][saliency].default;
      const bg = saliency === "low" ? pageBg : block.bgc;
      const required = saliency === "low" ? AA_LARGE_OR_UI : AA_BODY;
      check(issues, `component.color.${intent}.${saliency}`, block.text, bg, required);
    }
  }

  for (const state of FORM_STATES) {
    const block = tokens.form.color[state];
    check(issues, `form.color.${state}.placeholder`, block.placeholder, block.background, AA_BODY);
  }

  return issues;
}

export function warnOnContrastIssues(tokens: ThemeTokensInput, label = "theme"): ContrastIssue[] {
  const issues = findContrastIssues(tokens);
  if (issues.length > 0 && typeof console !== "undefined") {
    const lines = issues
      .map(
        (i) =>
          `  • ${i.path}: ${i.ratio}:1 (needs ${i.required}:1) — ${i.foreground} on ${i.background}`,
      )
      .join("\n");
    console.warn(`[baritone] ${issues.length} contrast issue(s) in ${label}:\n${lines}`);
  }
  return issues;
}
