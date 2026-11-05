---
"@saintly-software/baritone": minor
---

Add `Overflow` — a single row (or column) of controls that scrolls instead of
wrapping, built on base-ui's `ScrollArea`. Three affordances appear only when
there's actually more to see in a given direction:

- **Floating nav buttons** pinned to the start/end edges. A click slides to the
  next clipped control (`scrollBy="item"`, the default — never leaves a control
  half-cut) or by a whole viewport (`scrollBy="page"`, like Page Up/Down).
  They're pointer conveniences kept out of the tab order: the keyboard path is to
  Tab through the controls, which scrolls each focused control into view. Their
  visibility is pure CSS off base-ui's `data-overflow-*` edge attributes — no
  React state — and `prefers-reduced-motion` swaps the smooth scroll for a jump.
- **Gradient edge fades** that grow in as content hides past an edge (driven live
  by base-ui's per-edge overflow metrics) and stay crisp at a flush edge.
- **A hover-reveal scrollbar** for pointer dragging.

`orientation` (`"horizontal"` (default) | `"vertical"`) picks the flow/scroll
axis; `gap` spaces the controls from the spacing scale; `previousLabel` /
`nextLabel` name the nav buttons (sensible per-orientation defaults otherwise).
A horizontal `Overflow` just needs a bounded width (its container's is enough); a
vertical one needs a bounded `height` **or** `max-height` — the root is a flex
column so a cap makes the row grow to it and then scroll.

Also exports `OverflowProps`, `OverflowOrientation`, and `OverflowScrollMode`.
