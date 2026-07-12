---
"@saintly-software/baritone": minor
---

`Tooltip`'s `content` now accepts only a `string`.

**Breaking:** `content` previously also accepted a `string[]` to render each
entry on its own line (backed by the internal `tooltipLines` style). That
multi-line affordance has been removed — a tooltip should stay a short,
supplemental hint; anything longer belongs in a `Popover`.

Migration: pass a single `string`. If you were relying on multi-line tooltip
content, move that copy into a `Popover` instead.
