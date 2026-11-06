---
"@saintly-software/baritone": minor
---

Add a `MetricCard` component.

A `Card` variant for the "big number + label" stat / KPI tile (dashboards,
summaries). Renders a large `value`, a `label` naming it, and an optional
`caption` and leading `icon`, on a neutral `Card` surface.

- **No bare-number headings:** the `value` is a styled `<span>` (the title
  typography without the semantics), not a heading — so a grid of tiles doesn't
  flood the document outline with context-free numbers and drown the real section
  headings. Metrics are meant to sit in a **named `CardList`** (each tile a
  `listitem` under a real heading), which is the documented usage.
- **Interactive, accessibly:** `onClick` (a `<button>`) or `href` (an `<a>`, or a
  router link via `render`) turns the value + label into the card's single
  control, stretched over the whole surface with an `::after` overlay (the
  Inclusive Components card pattern) so a click anywhere activates it while the
  control is named by the value **and** the label ("Active goals, 2"). The
  `caption` stays outside that control, so it isn't folded into the name.
- **`disabled`** is modelled the focusable way — `aria-disabled` + swallowed
  activation, never the native attribute (per AGENTS.md), so it stays tabbable.
- **`intent`** tints the value (e.g. `positive` / `negative` for a good / bad
  number); **`valueSize`** picks the figure size from the title scale.
- **`trend`** adds a delta badge (`▲ 12%`) beneath the label. The arrow is
  decorative — the badge is exposed as a single `role="img"` with a composed text
  alternative ("increased 12%"), never read as a glyph name. Sentiment colour
  defaults from the direction but can be overridden for _inverted_ metrics (churn,
  latency) where a fall is good. Like the caption, it stays outside an interactive
  card's control name.
