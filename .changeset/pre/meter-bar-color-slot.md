---
"@saintly-software/baritone": minor
---

Add `slotProps.bar.color` to `Meter` — a colour escape hatch for the indicator.

- **`slotProps.bar.color`** — paint the filled indicator any CSS colour,
  overriding the `intent` × `saliency` palette default. Accepts anything CSS
  `color` takes (a hex/rgb value, a custom property, `currentColor`). Prefer
  `intent` / `saliency` so the bar stays on the system palette — reach for this
  only when you need a colour outside it, and mind contrast against the track.

Applied inline over the indicator's fill custom property, so only the colour
changes — the radius, width transition, and track are untouched. Meters without
`slotProps.bar` render exactly as before.
