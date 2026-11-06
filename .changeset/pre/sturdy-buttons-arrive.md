---
"@saintly-software/baritone": minor
---

Add a `Button` component.

A "component" element type sharing the colour scheme/recipe with `Chip`
(`componentIntentRecipe` + `componentTypographyRecipe` + `focusRingRecipe`), so
all 6 intents × 3 saliencies and the `sm` / `md` / `lg` sizes come for free.

- **Required label:** `children` is required and is always the accessible name.
- **No `aria-label`:** intentionally unsupported (typed as `never` and stripped
  at runtime) so the visible label can't be silently overridden.
- **Focusable when disabled:** uses `aria-disabled` rather than the `disabled`
  attribute, so a disabled button stays keyboard-reachable; clicks and keyboard
  activation are suppressed.
- **Loading:** `loading` disables interaction, sets `aria-busy`, and overlays a
  spinner on the label (the label stays in place to preserve width and the
  accessible name).
- **Icons:** `startIcon` / `endIcon` render before/after the label and inherit
  the resolved foreground.
- **Disabled explanation:** `disabledReason` shows a tooltip when a disabled
  button is tabbed to or hovered (suppressed while loading).
