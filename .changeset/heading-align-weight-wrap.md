---
"@saintly-software/baritone": minor
---

Add `align`, `weight`, and `wrap` typography knobs to `Heading` (and `Text`).

These are backed by a new shared `textStyleRecipe`, so `Heading` and `Text`
expose the same variants:

- **`align`** — logical `text-align` (`start` | `center` | `end` | `justify`).
- **`weight`** — override the variant's default font weight with a named
  `font.weight` token (`regular` | `medium` | `semibold` | `bold`). Omitting it
  leaves the size variant's default weight untouched.
- **`wrap`** — `text-wrap` behaviour (`wrap` | `nowrap` | `balance` | `pretty`),
  handy for `balance`-d multi-line titles.

The named font weights are now exposed through the theme contract at
`vars.font.weight.*`, and `FONT_WEIGHTS` / `TEXT_ALIGNS` / `TEXT_WRAPS` (plus
their `FontWeight` / `TextAlign` / `TextWrap` types) are exported from the theme.
