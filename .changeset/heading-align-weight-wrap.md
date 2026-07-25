---
"@saintly-software/baritone": minor
---

Expose `Text`'s token-backed typographic props on `Heading`, reusing the shared
`textTypographyRecipe`: `weight`, `italic`, `align`, `wrap`, and `wordBreak`.

Each prop is opt-in and additive — omitting it leaves the heading's default
styling (including the level's default weight) untouched.
