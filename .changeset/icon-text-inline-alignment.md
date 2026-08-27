---
"@saintly-software/baritone": minor
---

`Icon` now owns its vertical alignment inside text, not just its colour. Flowing
inline in `Text`/`Heading`, an icon picks up an optical vertical offset
automatically (via the new `--iconAlign` variable, `-0.125em`), so a glyph
dropped mid-sentence or at a line's end sits centred against the copy instead of
low on the baseline — no per-usage `style={{ verticalAlign: "middle" }}` hack.

This mirrors the existing `--iconColor` signal: `Text`'s colour recipe publishes
both, and `Icon` reads them. It's scoped to inline flow — standalone icons and
flex children (`Button`'s `startIcon`, a `Flex`) fall back to `baseline`, where
the parent's `align-items` already centres them and `vertical-align` is inert.
Horizontal spacing stays the caller's to set. The `iconVerticalAlignVar` export
is available for advanced composition, alongside `iconColorVar`.
