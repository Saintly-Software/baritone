---
"@saintly-software/baritone": minor
---

Add a themeable `letterSpacing` (tracking) prop to `Text` and `Heading`, backed
by a new `text.letterSpacing` token scale — closing the last typographic gap that
forced consumers to reach for a custom `style` (e.g. an uppercase eyebrow).

- **`letterSpacing`** (`tighter` | `tight` | `normal` | `wide` | `wider` |
  `widest`) — like `textAlign` / `whiteSpace` / `overflowWrap` / `textTransform`,
  it's a plain `letter-spacing` passthrough backed by the sprinkles atoms
  (responsive-capable), so it's opt-in and additive — omitting it leaves tracking
  untouched. `widest` (0.1em) is the go-to for small uppercase labels.
- Adds a **`text.letterSpacing`** token group to the theme contract, with
  `em`-based defaults (Tailwind's tracking scale) so a step tracks the font-size
  across the whole ramp. Override per brand via the new `BrandSeed.letterSpacing`
  (e.g. `letterSpacing: { widest: "0.14em" }`).
