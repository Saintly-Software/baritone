---
"@saintly-software/baritone": minor
---

Add `Divider` — a standalone rule for separating content, built on base-ui's
`Separator` (`role="separator"` plus the `aria-orientation` wiring).

- **Colour:** `intent` × `saliency` read the `component` _border_ ramp, so the
  default `neutral` / `low` is a quiet hairline and a louder intent is there when
  the split itself carries meaning. `thickness` (`thin` / `thick`) picks a
  `borderWidth` token.
- **Orientation:** `horizontal` (default) or `vertical`, which stretches to its
  flex row's height without an explicit height.
- **Labels:** `children` breaks the rule around a label, placed by
  `labelPosition` (`start` / `center` / `end`) and tunable through
  `slotProps.label`. A string label doubles as the divider's accessible name — a
  `separator`'s children are presentational, so the visible text alone would
  never be announced; pass `aria-label` to name it any other way.
- **Spacing:** the shared `MarginProps` (`my` / `mx` / …) space the rule from its
  neighbours.

`Card.Divider` is unchanged — it stays the edge-to-edge rule that negates a
card's padding.
