import { createVar, fallbackVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar, textColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES, SURFACE_SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

// Resolved colours are funnelled through local vars so the base style stays
// flat while the intent×saliency compound variants just set the values.
const bgc = createVar();
const fg = createVar();
const bd = createVar();

/**
 * A Notice's saliency maps onto the `component` saliency it borrows its
 * palette from (same tokens as `Chip`/`Button`): `high` → component **`mid`**
 * (a washed fill), `low` → component **`low`** (the subtle, near-transparent
 * shade). Never the loud `high` fill — a callout shouldn't shout like a
 * primary button.
 */
const COMPONENT_SALIENCY = { high: "mid", low: "low" } as const;

/**
 * Notice root recipe — a block-level callout that borrows the `component`
 * colour scheme (shared with `Chip`/`Button`) rather than the `surface`
 * palette, so `<Notice intent="warning">` matches a same-intent Button/Chip
 * at the mapped saliency (see {@link COMPONENT_SALIENCY}). Static (no
 * hover/active), since a Notice is a container, not a control. The resolved
 * foreground publishes as `--iconColor`/`--textColor` so a nested
 * `Icon`/`Text` matches automatically.
 *
 * `shape` mirrors `Chip`: `square` (default) keeps the shared radius; `pill`
 * fully rounds the ends.
 */
export const noticeRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: vars.space[3],
    minWidth: 0, // see `Flex`
    minHeight: 0, // see `Flex`
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
    // Pure selectors — colour is set in the compound variants below so the
    // two axes stay in lockstep.
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SURFACE_SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SURFACE_SALIENCIES)[number],
      Record<string, never>
    >,
    shape: {
      square: {},
      pill: { borderRadius: vars.radius.full },
    },
    inline: {
      // Block (default) fills the container width; `inline` shrinks to its
      // content so it can sit within a line of layout.
      false: {},
      true: { display: "inline-flex" },
    },
    disabled: {
      // Dims the whole callout (actions/close go inert separately via
      // context). Plain `opacity` is fine — a Notice is presentational, not
      // a form control with a token'd disabled palette.
      false: {},
      true: { opacity: 0.6 },
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
    inline: false,
    disabled: false,
  },
});

export type NoticeRecipeVariants = NonNullable<RecipeVariants<typeof noticeRecipe>>;

/** The text column — the title, the description, and the actions row stacked. */
export const noticeBody = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  // Lets a long title/description ellipsize instead of stretching the row.
  minWidth: 0,
  flex: 1,
});

/** The title line — the notice's `children`, set a touch heavier than body copy. */
export const noticeTitle = style({
  fontWeight: "600",
});

/** The title row — the title and an optional status `chip`, on one line. */
export const noticeHeader = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexWrap: "wrap",
  // Lets a long title truncate instead of shoving the chip off the row.
  minWidth: 0,
});

/** The actions row — buttons wrapped beneath the text, with a little top gap. */
export const noticeActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  marginTop: vars.space[2],
});

/**
 * `Notice.Icon` colour override. By default the icon inherits the notice's
 * foreground via `--iconColor`; passing `intent` republishes `--iconColor` on
 * the icon at the given `component` token, which its own `color` then picks
 * up. Mirrors `chipAdornmentRecipe`'s intent-override mechanism.
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

/**
 * `Notice.Action` layout tweak on top of the shared component scheme. Colour,
 * box/size, and focus ring are the same ones `Button` uses, so an action
 * looks like a small button; this only squares the box for the icon-only
 * form so a lone glyph isn't stretched wide by the size's inline padding.
 */
export const noticeActionRecipe = recipe({
  base: {},
  variants: {
    iconOnly: {
      false: {},
      true: { paddingInline: 0, aspectRatio: "1" },
    },
  },
  defaultVariants: { iconOnly: false },
});

export type NoticeActionRecipeVariants = NonNullable<RecipeVariants<typeof noticeActionRecipe>>;

/**
 * `Notice.Close` — the bare "×" dismiss button in the notice's top corner.
 * Chromeless: it inherits the notice's foreground via `--iconColor`, dimmed
 * at rest and brightening on hover. A fixed square keeps it a comfortable
 * hit target. Inert (`aria-disabled`) when a disabled Notice makes it so —
 * dimmer still, `not-allowed`.
 */
export const noticeClose = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxSizing: "border-box",
  width: "1.5rem",
  height: "1.5rem",
  margin: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  // Fallback: neutral text when used outside a Notice (no `--iconColor` to inherit).
  color: fallbackVar(iconColorVar, vars.component.color.neutral.mid.default.text),
  borderRadius: vars.radius.full,
  lineHeight: 0,
  cursor: "pointer",
  opacity: 0.7,
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    '&:hover:not([aria-disabled="true"])': { opacity: 1 },
    '&[aria-disabled="true"]': { cursor: "not-allowed", opacity: 0.4 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});
