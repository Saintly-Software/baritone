---
"@saintly-software/baritone": patch
---

Stop a static `Badge` from advertising a hover it can't perform.

`Badge` takes its colour from the shared `componentIntentRecipe` but never
passed `interactive`, so it fell through to that recipe's `control` default and
shifted its background on `:hover`/`:active` — an affordance on a `<span>` that
is not a hit target. It now passes `interactive: "auto"`, resolving the
affordance from the rendered element: the default `<span>` stays inert, while a
badge given a `render` that makes it a link or button keeps the shift.

This is the `Chip` fix (#68) applied to the other consumer of those recipes that
wanted it. `Badge` never used `componentTypographyRecipe`, so it never took the
`cursor: pointer` half — only the background.
