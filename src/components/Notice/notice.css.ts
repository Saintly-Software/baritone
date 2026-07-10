import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar, textColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES, SURFACE_SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// Resolved colours are funnelled through local vars so the base style can stay
// flat while the intent×saliency compound variants just set the values.
const bgc = createVar();
const fg = createVar();
const bd = createVar();

/**
 * A Notice's saliency maps onto the `component` saliency it borrows its palette
 * from — the same tokens `Chip`/`Button` use:
 *   - `high` → component **`mid`** (a washed fill, like a mid-saliency Button),
 *   - `low`  → component **`low`** (the subtle, near-transparent shade).
 * A Notice never uses the component's loud `high` fill — a callout shouldn't
 * shout like a primary button.
 */
const COMPONENT_SALIENCY = { high: "mid", low: "low" } as const;

/**
 * Notice root recipe — a block-level callout that borrows the `component` colour
 * scheme (shared with `Chip`/`Button`) rather than the washed `surface` palette,
 * so `<Notice intent="warning">` matches a Button/Chip of the same intent at the
 * mapped saliency (see {@link COMPONENT_SALIENCY}). Unlike `componentIntentRecipe`
 * it's static (no hover/active) since a Notice is a container, not a control. The
 * resolved foreground is published as `--iconColor`/`--textColor` so a nested
 * `Icon`/`Text` matches automatically.
 *
 * The `shape` knob mirrors `Chip`: `square` (default) keeps the shared component
 * radius; `pill` fully rounds the ends.
 */
export const noticeRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: vars.space[3],
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    background: bgc,
    color: fg,
    padding: vars.space[4],
    borderRadius: vars.component.borderRadius,
    vars: { [iconColorVar]: fg, [textColorVar]: fg },
  },
  variants: {
    // Intent/saliency are pure selectors for the compound variants below; the
    // colour is set there so the two axes stay in lockstep.
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SURFACE_SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SURFACE_SALIENCIES)[number],
      Record<string, never>
    >,
    shape: {
      // `square` keeps the shared component radius; `pill` fully rounds the ends.
      square: {},
      pill: { borderRadius: vars.radius.full },
    },
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SURFACE_SALIENCIES.map((saliency) => {
      const block = vars.component.color[intent][COMPONENT_SALIENCY[saliency]];
      return {
        variants: { intent, saliency },
        style: {
          vars: {
            [bgc]: block.default.bgc,
            [fg]: block.default.text,
            [bd]: block.default.border,
          },
        },
      };
    }),
  ),
  defaultVariants: {
    intent: "neutral",
    saliency: "high",
    shape: "square",
  },
});

export type NoticeRecipeVariants = NonNullable<RecipeVariants<typeof noticeRecipe>>;

/** The text column — the title, the description, and the actions row stacked. */
export const noticeBody = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  // Let a long title/description ellipsize rather than push the flex row wide.
  minWidth: 0,
  flex: 1,
});

/** The title line — the notice's `children`, set a touch heavier than body copy. */
export const noticeTitle = style({
  fontWeight: "600",
});

/** The actions row — buttons wrapped beneath the text, with a little top gap. */
export const noticeActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  marginTop: vars.space[2],
});

/**
 * `Notice.Icon` colour override. By default a notice icon inherits the notice's
 * foreground through `--iconColor`; passing an `intent` republishes `--iconColor`
 * on the icon itself at the given `component` `intent`×`saliency` token, so the
 * `Icon`'s own `color` (which reads `--iconColor`) picks up the override. Mirrors
 * `chipAdornmentRecipe`'s intent-override mechanism.
 */
export const noticeIconRecipe = recipe({
  variants: {
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: {
        vars: { [iconColorVar]: vars.component.color[intent][saliency].default.text },
      },
    })),
  ),
});

export type NoticeIconRecipeVariants = NonNullable<RecipeVariants<typeof noticeIconRecipe>>;
