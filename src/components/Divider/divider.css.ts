import { createVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { BORDER_WIDTH_KEYS, INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// The rule's colour and thickness, funnelled through local vars so the recipe
// base stays flat: each intent×saliency compound swaps the colour, each
// `thickness` variant swaps the width, and the pieces that actually paint the
// line (the element itself, or its two pseudo-element rules) just read them.
const line = createVar();
const weight = createVar();

/**
 * Divider root. A flex line: unlabelled it paints the rule on its own box;
 * labelled it grows a rule either side of the label via `::before` / `::after`.
 *
 * The colour reads `component.color[intent][saliency].default.border` — the
 * border ramp, so the rule sits at hairline weight against a surface at every
 * saliency — and the thickness reads the `borderWidth` tokens.
 */
export const dividerRoot = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    // Never let a divider get squeezed to nothing by a greedy flex sibling.
    flexShrink: 0,
    // No `margin: 0` reset here: the root renders a `div` (no UA margin to
    // reset), and the reset would out-order the equal-specificity `atoms` class
    // that carries the margin props, silently swallowing `my` / `mx` / ….
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
        // whatever the parent's `align-items` says; `min-height` keeps it
        // visible outside a flex container, where there's nothing to stretch to.
        alignSelf: "stretch",
        minHeight: "1em",
      },
    },
    /**
     * Whether there's a label between the rules. Drives *where* the line is
     * painted: on the element's own box (`false`), or on the two pseudo-element
     * rules flanking the label (`true`).
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
    thickness: Object.fromEntries(
      BORDER_WIDTH_KEYS.map((key) => [key, { vars: { [weight]: vars.borderWidth[key] } }]),
    ) as Record<(typeof BORDER_WIDTH_KEYS)[number], { vars: Record<string, string> }>,
  },
  compoundVariants: [
    // The rule's cross-axis size — on the element's own box when unlabelled, on
    // the pseudo-element rules when labelled.
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
    // `labelPosition` nudges the label along the divider by pinning the rule on
    // its side to a short stub; the other rule keeps growing into the slack.
    // `center` needs no compound — both rules grow equally by default.
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
    thickness: "thin",
  },
});

export type DividerVariants = NonNullable<RecipeVariants<typeof dividerRoot>>;
