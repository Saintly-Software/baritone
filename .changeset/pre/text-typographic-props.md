---
"@saintly-software/baritone": minor
---

Add typographic props to `Text`, each backed by a vanilla-extract recipe variant
with values sourced from tokens (no ad-hoc CSS):

- **`weight`** (`default` | `semibold` | `bold` | `superbold`) — reads the new
  `text.weight` tokens and overrides the weight baked into the `variant`.
- **`italic`** — renders the text in italics.
- **`align`** (`start` | `center`) — horizontal text alignment.
- **`wrap`** (`wrap` | `nowrap`) — whether the text wraps onto multiple lines.
- **`wordBreak`** (`break-word` | `normal`) — how long words break.

Adds a `superbold` (800) step to the font-weight scale and a `text.weight` token
group to the theme contract.
