---
"@saintly-software/baritone": minor
---

Round out `Notice` into a full banner/alert surface with dismiss, actions, a
status chip, and inline/disabled/margin props. All additive — the existing
`intent` / `saliency` / `shape` / `icon` / `description` / `actions` API and the
`Notice.Icon` part are unchanged.

- **`close`** + **`Notice.Close`** — a top-right "×" dismiss. Pass a handler for
  the built-in button (`close={onClose}`), or a `<Notice.Close>` element to set
  its accessible `label` (default "Dismiss") or glyph. It's a real focusable
  `<button>`.
- **`Notice.Action`** — a typed control for the `actions` row that looks like a
  small `Button` (it shares the `component` colour/size recipes and the focus
  ring). It's a `<button>` (`onClick`) or a link (`href`, or a router link via
  `render`), and either text (`children`, with an optional leading `icon`) or
  icon-only (`icon` + a required `label`). The `actions` prop still accepts any
  node, so dropping in a plain `<Button>` keeps working.
- **`chip`** + **`Notice.Chip`** — a status chip on the title line. `Notice.Chip`
  is a thin `Chip` preset defaulting to the compact `sm` size; every other `Chip`
  prop passes through.
- **`inline`** — compact `inline-flex` layout that shrinks to its content instead
  of filling the container like a full-width block banner.
- **`disabled`** — dims the notice and makes its `actions` / `close` inert. Uses
  `aria-disabled` (never the native attribute), so the controls stay focusable;
  the state reaches them through context.
- **Margin props** (`m` / `mx` / `my` / `mt` / …) via the shared spacing scale,
  matching the layout primitives.
- **`role` / `aria-live`** — the notice is a live region so assistive tech
  announces it when it appears or changes: `role="alert"` (assertive) for
  `negative` / `warning` intents, `role="status"` (polite) otherwise. Pass your
  own `role` (or `aria-live`) to override.
