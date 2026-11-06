---
"@saintly-software/baritone": minor
---

Add a `textDecoration` prop to `Text` and `Heading` (`none` | `underline` |
`line-through` | `overline`). Like `textTransform`, it's a plain `text-decoration`
passthrough backed by the sprinkles atoms, so it's opt-in and additive —
omitting it leaves the rendered decoration untouched.
