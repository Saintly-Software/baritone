---
"@saintly-software/baritone": major
---

Refactor recipes for granularity, redesign the Card API, and upgrade base-ui.

**Breaking changes:**

- **base-ui:** the peer dependency moves from `@base-ui-components/react` to
  `@base-ui/react` (now `^1.6.0`). Update your install accordingly.
- **Heading:** `level` is now **required** and is a number `1`–`6` (was an
  optional `'h1'`–`'h6'` string defaulting to `'h2'`). The number maps to the
  matching `h1`–`h6` tag.
- **Text recipe:** `textRecipe` is split into `textIntentRecipe` (text + icon
  colour) and `textVariantRecipe` (typography variant). Compose both.
- **Text colour:** `Text` no longer hard-codes a neutral/mid colour. By default
  it now inherits the ambient `--textColor` published by a surrounding `surface`/
  `component` (so text inside a coloured surface matches automatically), falling
  back to the neutral/mid token when standalone. Pass `intent` and/or `saliency`
  to override. `Text` placed inside a coloured surface will therefore change
  colour where it previously stayed neutral/mid.
- **Component recipe:** `componentRecipe` is split into `componentIntentRecipe`
  (border / background / text / icon colour) and `componentTypographyRecipe`
  (layout, type, sizing). Compose both, plus `focusRingRecipe` for the ring.

**New:**

- **Ambient text colour:** new `textColorVar` (`--textColor`), the text-colour
  analogue of `iconColorVar`. The `surface` and `component` recipes publish their
  resolved foreground to it, and `Text` reads it by default — so a nested `Text`
  matches its surface/component without being told the intent.
- **Focus ring recipe:** `focusRingRecipe` renders the focus ring from
  `--focusRingColor`. Its `type` variant selects `:focus-visible` or
  `:focus-within` so a component can choose its focus model.
- **Card API:** `Card` is now a compound component — `Card.Header`
  (`title` / `subtitle`), `Card.Footer`, `Card.Bleed` (full-width content that
  negates the card padding), and `Card.Divider` (edge-to-edge rule). New
  `header` / `footer` props and an `as` prop (`div` | `section` | `main` |
  `article`).
