---
"@saintly-software/baritone": minor
---

Add sizing + responsive-visibility shorthands to `Flex` and `Box`.

- **`Flex` + `Box`:** `hideOn` / `showOn` for responsive breakpoint visibility
  (accept one breakpoint or a set of `"mobile" | "sm" | "md" | "lg" | "xl"`), and
  a friendly `width` shorthand (`"fill"` → 100%, `"fit"` → fit-content,
  `"inherit"`).
- **`Flex`:** `grow` (`flex-grow` on the container itself, for a `Flex` nested in
  another flex layout), plus `height` / `maxWidth` / `minHeight` wired to the
  atoms sizing scale.
- All backed by vanilla-extract sprinkles conditions and fully type-safe. Because
  the breakpoint conditions are `min-width`, `hideOn` / `showOn` emit every
  condition explicitly so hiding at one breakpoint never leaks into the next.
- `render` remains the escape hatch for full polymorphism; the new `maxWidth`
  atom and `inherit` dimension value are also exposed on `atoms`.
