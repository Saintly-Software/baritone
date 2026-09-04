import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

const line = createVar();

/**
 * The rule's thickness, set per instance by the `Divider` component to a
 * `var(--borderWidth-<name>)` the active theme published — the `borderWidth`
 * vocabulary is *open* (consumer-extensible), so it's an inline var, not a variant.
 * See {@link module:../../theme/borderWidths}.
 */
export const dividerWeightVar = createVar("dividerWeight");

const weight = fallbackVar(dividerWeightVar, vars.borderWidth.thin);

/**
 * Divider root. A flex line: unlabelled it paints the rule on its own box;
 * labelled it grows a rule either side of the label via `::before` / `::after`.
 *
 * The colour reads `component.color[intent][saliency].default.border` — the
 * border ramp, so the rule sits at hairline weight against a surface at every
 * saliency — and the thickness reads the `--borderWidth-<name>` the component sets.
 */
export const dividerRoot = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: "row",
        width: "100%",
      },
      vertical: {
        flexDirection: "column",
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
  },
  compoundVariants: [
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
