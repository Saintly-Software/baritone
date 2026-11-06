---
"@saintly-software/baritone": minor
---

Add `ScrollArea` — a scrollable region built on base-ui's `ScrollArea`, with two
of the docs' recipes baked in by default:

- **Gradient scroll fade.** Content fades out at any edge it can still scroll
  toward and stays crisp at an edge it's flush against, driven live by base-ui's
  per-edge overflow metrics. `orientation="both"` composites the two axis masks
  (`mask-composite: intersect`) to round the fade off on all four edges.
- **Hover-reveal scrollbars.** Native scrollbars are hidden; a slim neutral thumb
  fades in only while the area is hovered or scrolled (base-ui's `data-hovering` /
  `data-scrolling`), then lingers briefly and fades back out.

`orientation` (`"vertical"` (default) | `"horizontal"` | `"both"`) picks which
axes scroll; `both` also renders the corner where the two scrollbars meet. A
scrollbar only appears for an axis whose content actually overflows. Give the
area a bounded size via `className` / `style`.

Also exports `ScrollAreaProps` and `ScrollAreaOrientation`.
