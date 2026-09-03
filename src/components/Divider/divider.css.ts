import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// The rule's colour, funnelled through a local var so the recipe base stays
// flat — each intent×saliency compound swaps it; painting rules just read it.
const line = createVar();

/**
 * The rule's thickness, set per instance by `Divider` to a
 * `var(--borderWidth-<name>)` the active theme published. `borderWidth` is an
 * open (consumer-extensible) vocabulary, so this is an inline var, not a variant.
 */
export const dividerWeightVar = createVar("dividerWeight");

// What the line-painting rules read for their cross-axis size. Falls back to
// `thin` so a bare `dividerRoot(...)` class (no inline var) still gets a hairline rule.
const weight = fallbackVar(dividerWeightVar, vars.borderWidth.thin);

/**
 * Divider root. A flex line: unlabelled paints the rule on its own box;
 * labelled grows a rule either side of the label via `::before`/`::after`.
 *
 * Colour reads `component.color[intent][saliency].default.border` (the border
 * ramp); thickness reads the `--borderWidth-<name>` the component sets.
 */
export const dividerRoot = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    // Never let a divider get squeezed to nothing by a greedy flex sibling.
    flexShrink: 0,
    // No `margin: 0` reset here: a `div` has no UA margin to reset, and the
    // reset would out-order the equal-specificity `atoms` class, swallowing `my`/`mx`.
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: "row",
        width: "100%",
      },
      vertical: {
        flexDirection: "column",
        // `alignSelf` (not `height`) so the rule spans a flex row's full height
        // regardless of `align-items`; `min-height` keeps it visible outside a flex container.
        alignSelf: "stretch",
        minHeight: "1em",
      },
    },
    /**
     * Whether there's a label between the rules. Drives where the line paints:
     * the element's own box (`false`), or the two pseudo-element rules (`true`).
     */
    labelled: {
      false: {
        background: line,
      },
      true: {
        gap: vars.space[3],
        selectors: {
          "&::before, &::after": {
            content: '""',
            flex: "1 1 auto",
            background: line,
          },
        },
      },
    },
    labelPosition: {
      start: {},
      center: {},
      end: {},
    },
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: [
    // Cross-axis size: the element's own box when unlabelled, the pseudo-element rules when labelled.
    {
      variants: { orientation: "horizontal", labelled: false },
      style: { height: weight },
    },
    {
      variants: { orientation: "vertical", labelled: false },
      style: { width: weight },
    },
    {
      variants: { orientation: "horizontal", labelled: true },
      style: { selectors: { "&::before, &::after": { height: weight } } },
    },
    {
      variants: { orientation: "vertical", labelled: true },
      style: { selectors: { "&::before, &::after": { width: weight } } },
    },
    // `labelPosition` nudges the label by pinning the rule on its side to a
    // short stub; the other rule grows into the slack. `center` needs no compound.
    {
      variants: { labelled: true, labelPosition: "start" },
      style: { selectors: { "&::before": { flex: `0 0 ${vars.space[4]}` } } },
    },
    {
      variants: { labelled: true, labelPosition: "end" },
      style: { selectors: { "&::after": { flex: `0 0 ${vars.space[4]}` } } },
    },
    ...INTENTS.flatMap((intent) =>
      SALIENCIES.map((saliency) => ({
        variants: { intent, saliency },
        style: { vars: { [line]: vars.component.color[intent][saliency].default.border } },
      })),
    ),
  ],
  defaultVariants: {
    orientation: "horizontal",
    labelled: false,
    labelPosition: "center",
    intent: "neutral",
    saliency: "low",
  },
});

export type DividerVariants = NonNullable<RecipeVariants<typeof dividerRoot>>;
