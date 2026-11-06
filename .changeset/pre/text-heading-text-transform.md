---
"@saintly-software/baritone": minor
---

Add a `textTransform` prop to `Text` and `Heading` (`none` | `uppercase` |
`lowercase` | `capitalize`). Like `textAlign`, `whiteSpace`, and `overflowWrap`,
it's a plain `text-transform` passthrough backed by the sprinkles atoms, so it's
opt-in and additive — omitting it leaves the rendered casing untouched.
