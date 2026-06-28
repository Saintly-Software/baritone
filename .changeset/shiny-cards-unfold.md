---
"@saintly-software/baritone": minor
---

Expand `Card` with interactive roots, a collapsible mode, and new compound parts.

**New:**

- **Clickable / linkable roots:** pass `onClick` or `href` (with optional
  `target` / `rel`, and the base-ui `render` prop for router links) to make the
  whole card activate / navigate. Following
  [Inclusive Components](https://inclusive-components.design/cards/), the card
  itself stays a plain container and its `Card.Header` **title** becomes the one
  real `<button>` / `<a>`, stretched over the whole surface with an `::after`
  overlay. So the accessible name is just the title (not the card's whole
  contents), and — unlike a card that _is_ a single control — you can still nest
  other controls (footer buttons, row actions): they sit above the overlay and
  stay independently clickable. Keyboard focus outlines the whole card, and the
  disabled model is the focusable one (`aria-disabled` + swallowed activation,
  never the native attribute — see AGENTS.md). `CardProps` is a discriminated
  union over the static / clickable / linkable modes, so the three are mutually
  exclusive.
- **Collapsible card:** set `collapsible` (+ `open` / `defaultOpen` /
  `onOpenChange`) to collapse the content + footer away, leaving the header
  visible. A disclosure **button** in the header (the chevron, labelled by the
  title) toggles it — only that button, not the whole header, so the header can
  carry its own interactive content (chips, actions). Built on base-ui's
  `Collapsible`; a disabled collapsible card keeps its trigger keyboard-focusable
  but vetoes the toggle.
- **`Card.Rows` + `Card.Row`:** a description list (`<dl>`) of rows, passed as a
  child of `Card`. Each `Card.Row` is one of two shapes — `term` + `description`
  (a `<dt>`/`<dd>` pair) or a rich `title` (+ optional `subtitle`) + `actions` row.
  A plain term/value row highlights on hover; a row that carries its own action
  does not (its action's hover is the affordance that matters).
- **`Card.Actions`:** a row of buttons (the `actions` array) anchored to a `side`
  (`start` / `end`, default `end`). Drop it into a `Card.Footer` or a rich
  `Card.Row`.
- **`Card.Header` `icon` + `chip`:** a leading glyph and a trailing element (e.g. a
  status `Chip`) alongside the title/subtitle.
- **`Card.Footer` `actions`:** an actions slot (typically a `Card.Actions`),
  rendered after any footer children.

The shared `surfaceRecipe` gains an `interactive` variant (hover/active washes
computed in oklch from the default background) that powers the clickable/linkable
card's surface.

**Note:** an interactive `Card` is a container, not the control itself — its
`Card.Header` title is the rendered `<button>` / `<a>` (and the `render` prop for a
router link targets that link). A clickable/linkable card therefore needs a
`Card.Header` with a `title` for the control's accessible name.
