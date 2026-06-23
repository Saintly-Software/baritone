import { createVar } from '@vanilla-extract/css';
import { recipe, type RecipeVariants } from '@vanilla-extract/recipes';
import { FORM_STATES, FORM_STATE_INTENT } from '../../theme/constants';
import { vars } from '../../theme/contract.css';
import { focusRingColorVar, iconColorVar } from '../vars.css';

const bg = createVar();
const bd = createVar();
const placeholder = createVar();

const sizes = {
  sm: {
    height: '2rem',
    px: vars.space[2],
    font: vars.text.variant.body.sm.fontSize,
  },
  md: {
    height: '2.5rem',
    px: vars.space[3],
    font: vars.text.variant.body.base.fontSize,
  },
  lg: {
    height: '3rem',
    px: vars.space[4],
    font: vars.text.variant.body.lg.fontSize,
  },
} as const;

/**
 * Shared recipe for the "form control" element type (TextInput, and future
 * Select/NumberField/etc.). Form controls don't take intent/saliency — they
 * take a `state` (neutral | warning | invalid | valid) that drives
 * background/border/placeholder and publishes the focus-ring colour (via the
 * state's mapped intent) for the shared `focusRingRecipe`.
 */
export const formControlRecipe = recipe({
  base: {
    boxSizing: 'border-box',
    width: '100%',
    margin: 0,
    fontFamily: vars.font.sans,
    color: vars.text.color.neutral.high,
    vars: { [iconColorVar]: vars.text.color.neutral.high },
    background: bg,
    borderStyle: 'solid',
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    borderRadius: vars.form.borderRadius,
    transitionProperty: 'border-color, outline-color',
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&::placeholder': { color: placeholder, opacity: 1 },
      '&[aria-disabled="true"], &:disabled': {
        opacity: 0.55,
        cursor: 'not-allowed',
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': { transitionDuration: '0ms' },
    },
  },
  variants: {
    state: Object.fromEntries(
      FORM_STATES.map((state) => {
        const c = vars.form.color[state];
        return [
          state,
          {
            vars: {
              [bg]: c.background,
              [bd]: c.border,
              [placeholder]: c.placeholder,
              [focusRingColorVar]: vars.form.focus[FORM_STATE_INTENT[state]],
            },
          },
        ];
      }),
    ) as Record<(typeof FORM_STATES)[number], { vars: Record<string, string> }>,
    size: {
      sm: {
        height: sizes.sm.height,
        paddingInline: sizes.sm.px,
        fontSize: sizes.sm.font,
      },
      md: {
        height: sizes.md.height,
        paddingInline: sizes.md.px,
        fontSize: sizes.md.font,
      },
      lg: {
        height: sizes.lg.height,
        paddingInline: sizes.lg.px,
        fontSize: sizes.lg.font,
      },
    },
  },
  defaultVariants: {
    state: 'neutral',
    size: 'md',
  },
});

export type FormControlVariants = NonNullable<
  RecipeVariants<typeof formControlRecipe>
>;
