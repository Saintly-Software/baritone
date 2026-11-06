---
"@saintly-software/baritone": major
---

Rename `Text`/`Heading`'s `variant` prop to `size` and unify typography on one
token-driven scale.

- **Breaking — `variant` → `size`** on `Text` and `Heading` (and `Lockup`'s title
  slot). The `base` value is renamed `md`, which is also the new default.
- **Breaking — new size scale** `xs sm md lg xl 2xl 3xl 4xl 5xl 6xl 7xl 8xl 9xl`
  (Tailwind-style). `3.5xl` is removed; `5xl`–`9xl` are new. `Text` and `Heading`
  share the full scale — there is no more body/title split.
- **Breaking — token API:** `text.variant.{body,title}.<size>` is replaced by a
  flat `text.size.<size>` (`{ fontSize, lineHeight }`) plus two increment tokens
  `text.fontStep.{lower,upper}`. Each per-size font-size is `calc()`-derived from
  the `md` anchor + the increments, so the whole ramp re-themes at runtime by
  changing three tokens — or override any single `text.size.<size>` leaf.
  `BrandSeed` gains a `fontScale` option. Defaults match Tailwind for `xs`–`2xl`
  (font-size) and use Tailwind's per-size line-heights.
- **Breaking — constants/recipe:** removed `BODY_SIZES`/`TITLE_SIZES` and
  `BodySize`/`TitleSize` (use `TEXT_SIZES`/`TextSize`); `HEADING_LEVEL_VARIANT` →
  `HEADING_LEVEL_SIZE`; the `textVariantRecipe` recipe (and `TextVariantVariants`)
  → `textSizeRecipe`/`TextSizeVariants`, and its `family` variant is gone.
- Weight is now independent of `size`: `Heading` keeps its customary per-level
  weight (via the new `HEADING_LEVEL_WEIGHT`); large `Text` is no longer
  auto-bolded — use the `weight` prop.
- **Breaking — `align`/`wrap`/`wordBreak` → layout atoms.** These `Text`/`Heading`
  props are replaced by the `textAlign` / `whiteSpace` / `overflowWrap` atoms
  (e.g. `wrap="nowrap"` → `whiteSpace="nowrap"`, `wrap="wrap"` →
  `whiteSpace="normal"`, `wordBreak="break-word"` → `overflowWrap="break-word"`).
  `mono` / `italic` / `weight` remain, now backed by the split `typographyFont` /
  `typographyDecoration` / `typographyWeight` recipes.

`Text` and `Heading` now delegate to a shared internal `InternalText` primitive.
