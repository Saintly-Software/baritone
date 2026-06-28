---
"@saintly-software/baritone": minor
---

Expand `Card` with interactive roots, a collapsible mode, and new compound parts.

**New:**

- **Clickable / linkable roots:** pass `onClick` to render the whole card as a
  `<button>`, or `href` (with optional `target` / `rel`, and the base-ui `render`
  prop for router links) to render it as an `<a>`. Both gain hover/active surface
  washes and the focusable disabled model (`aria-disabled` + swallowed activation,
  never the native attribute — see AGENTS.md). `CardProps` is now a discriminated
  union over the static / clickable / linkable modes, so the three are mutually
  exclusive.
- **Collapsible card:** set `collapsible` (+ `open` / `defaultOpen` /
  `onOpenChange`) to turn the header into a disclosure trigger built on base-ui's
  `Collapsible` — only the header shows when closed, with the content + footer
  collapsing away. A disabled collapsible card keeps its trigger keyboard-focusable
  but vetoes the toggle.
- **`Card.Rows` + `Card.Row`:** a description list (`<dl>`) of rows, passed as a
  child of `Card`. Each `Card.Row` is one of two shapes — `term` + `description`
  (a `<dt>`/`<dd>` pair) or a rich `title` (+ optional `subtitle`) + `actions` row.
- **`Card.Actions`:** a row of buttons (the `actions` array) anchored to a `side`
  (`start` / `end`, default `end`). Drop it into a `Card.Footer` or a rich
  `Card.Row`.
- **`Card.Header` `icon` + `chip`:** a leading glyph and a trailing element (e.g. a
  status `Chip`) alongside the title/subtitle.
- **`Card.Footer` `actions`:** an actions slot (typically a `Card.Actions`),
  rendered after any footer children.

The shared `surfaceRecipe` gains an `interactive` variant (hover/active washes
computed in oklch from the default background) that powers the clickable/linkable
card.

**Note:** `onClick` / `href` now drive the rendered element — a `Card` with an
`onClick` renders a `<button>` (was a `<div>` with the handler). Move presentation-
only click handling onto a child if you need the old static element.
