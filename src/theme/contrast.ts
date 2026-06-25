import { contrastRatio } from "./color-math";
import { INTENTS, SALIENCIES, SURFACE_SALIENCIES, FORM_STATES } from "./constants";
import type { ThemeTokensInput } from "./contract.css";

export const AA_BODY = 4.5;
export const AA_LARGE_OR_UI = 3.0;

export interface ContrastIssue {
  /** Human-readable token path of the pairing that failed. */
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
  // `null` => not statically evaluable (var()/calc()/relative-colour). Skip.
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

/**
 * Build-time WCAG AA check over a theme's dev-supplied tokens. Returns the list
 * of foreground/background pairings that fail. Because tokens are dev-supplied,
 * the system warns rather than silently shipping low contrast.
 *
 * Low-saliency (transparent) component backgrounds and low-saliency text are
 * checked against the neutral low surface (the page background) as a best-effort
 * backing colour, and held to the 3:1 UI/large-text floor.
 */
export function findContrastIssues(tokens: ThemeTokensInput): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  const pageBg = tokens.surface.color.neutral.low.default.bgc;

  // Body/heading text over the page background.
  for (const intent of INTENTS) {
    for (const saliency of SALIENCIES) {
      const fg = tokens.text.color[intent][saliency];
      const required = saliency === "low" ? AA_LARGE_OR_UI : AA_BODY;
      check(issues, `text.color.${intent}.${saliency}`, fg, pageBg, required);
    }
  }

  // Surface text over surface background.
  for (const intent of INTENTS) {
    for (const saliency of SURFACE_SALIENCIES) {
      const block = tokens.surface.color[intent][saliency].default;
      check(issues, `surface.color.${intent}.${saliency}`, block.text, block.bgc, AA_BODY);
    }
  }

  // Component text over component background. Transparent (low) backgrounds are
  // checked against the page background instead.
  for (const intent of INTENTS) {
    for (const saliency of SALIENCIES) {
      const block = tokens.component.color[intent][saliency].default;
      const bg = saliency === "low" ? pageBg : block.bgc;
      const required = saliency === "low" ? AA_LARGE_OR_UI : AA_BODY;
      check(issues, `component.color.${intent}.${saliency}`, block.text, bg, required);
    }
  }

  // Form placeholder over form background.
  for (const state of FORM_STATES) {
    const block = tokens.form.color[state];
    check(issues, `form.color.${state}.placeholder`, block.placeholder, block.background, AA_BODY);
  }

  return issues;
}

/**
 * Run the contrast check and `console.warn` any failures. Called by the theme
 * factory in non-production builds. Returns the issues for programmatic use.
 */
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
