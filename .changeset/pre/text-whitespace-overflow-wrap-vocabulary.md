---
"@saintly-software/baritone": minor
---

Expand the `whiteSpace` and `overflowWrap` atoms to the full CSS keyword sets, so
`Text` (and `Heading`, which shares the atoms) can use them all:

- **`whiteSpace`** adds `pre` (preserve newlines/spaces, never wrap), `pre-line`
  (keep newlines, collapse spaces), and `break-spaces` (like `pre-wrap` but also
  wraps trailing spaces) alongside the existing `normal` / `nowrap` / `pre-wrap`.
- **`overflowWrap`** adds `anywhere` (breaks a long token like `break-word`, but
  the break counts toward min-content sizing so the element can shrink narrower)
  alongside the existing `normal` / `break-word`.

Purely additive — new atomic classes only, no change to existing behaviour.
