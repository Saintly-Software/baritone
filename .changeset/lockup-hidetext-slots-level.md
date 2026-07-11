---
"@saintly-software/baritone": minor
---
Add `hideText`, `slots`, and title-`level` switching to `Lockup`.
- **`hideText`** — visually hide the text column while keeping it in the
  accessible tree, for an icon-only lockup a screen reader still announces.
- **`slots`** — ReactNode overrides (`icon` / `title` / `subtitle`) that replace
  a slot's content entirely, complementing the existing `slotProps` tweaks.
- **`slotProps.title.level`** — set a `HeadingLevel` to render the title as a
  semantic `Heading` (`h1`–`h6`) instead of a `Text`; a pure semantics switch, so
  the visual size is unchanged (still driven by `variant`, default `lg`).
