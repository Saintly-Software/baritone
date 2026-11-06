---
"@saintly-software/baritone": patch
---

Fix `Chip`'s box metrics, and stop a static chip from advertising a click it
can't perform.

`Chip` borrows the shared `component` recipes from `Button` but only partly
overrode them, so it inherited a control's proportions and affordances:

- **The label didn't fit the chip.** Heights were 12/16/20px against a label line
  box needing 18/21/24px, so the text overflowed the border box at every size.
  They're now 20/24/28px — a step under the `Button` sizes they share a recipe
  with (24/32/40) and a step over `Badge` (16/20/24), which is the intended
  order: badge < chip < button.
- **Adornment glyphs ignored the chip.** An `<Icon>` sizes its `1em` box from an
  absolute rem, so every glyph rendered a fixed 20px — taller than an `sm` chip
  is tall. A `Chip.Adornment` now takes the chip's `size` from context and scales
  its glyph (12/16/16), whichever glyph kind it's handed.
- **Padding and gap were Button-sized** (8/12/16px inline, 8px gap) and are now
  tightened to a chip's density.
- **The chip body no longer poses as a control.** Its hit targets are the label
  (given `onClick`/`popover`) and the adornments, each with their own
  affordances; the body itself took a pointer cursor and a hover background,
  promising a click that did nothing, and made its own text unselectable. A chip
  is now inert and selectable unless a `render` makes it a link, in which case
  both come back.

The shared `componentIntentRecipe` / `componentTypographyRecipe` gain an
`interactive` variant to express that last point (`control`, the default, is
what every other consumer already did — `Button`, `Tabs`, and `Notice` are
unaffected; `auto` resolves the affordances from the rendered element).
