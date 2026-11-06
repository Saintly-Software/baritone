---
"@saintly-software/baritone": major
---

Expand `Chip` with adornments, a clickable label, shapes, and a loading state.

**Breaking change:**

- **`children` is now text-only** — typed as `string | string[]` (was
  `React.ReactNode`). A Chip wraps its label in its own truncating element, so
  icons and actions move out of the children and into adornments (below).
  Anything that previously passed JSX children (an inline `<Icon>`, an
  interpolated `{count} items`, a nested element) must move that content to
  `leadAdornments` / `trailAdornments` or render plain text.

**New:**

- **`Chip.Adornment` compound part:** small icons slotted before/after the label
  via `leadAdornments` / `trailAdornments`. Each is one of three kinds — a regular
  (decorative or `label`-named) icon, a clickable `<button>` (`onClick` + required
  `label`), or a link `<a>` (`href` + required `label`, with the base-ui `render`
  prop for router links). Adornments inherit the chip's colour through
  `--iconColor`, or take their own `intent` to tint just that adornment.
- **`handleRemove`:** a shortcut for the common removable chip — appends a
  built-in clickable remove "×" as the _last_ trailing adornment, after any
  `trailAdornments` you supply.
- **Clickable label:** pass `onClick` to render the text label as a real
  `<button>` (keyboard-focusable, Enter/Space-activated). The label and any
  adornments are independent hit targets.
- **`shape`:** `square` (default — the shared component radius) or `pill` (fully
  rounded ends, a Bootstrap-style badge).
- **`loading`:** replaces the chip's entire content — both adornment lists and the
  label — with a centred spinner and marks the chip `aria-busy` + inert. The chip
  keeps its height; its width collapses to the spinner.
- **Disabled propagates to clickable adornments:** a disabled chip drags its
  clickable adornments (and the `handleRemove` button) along — they go inert but
  stay keyboard-focusable (`aria-disabled`, never the native attribute — see
  AGENTS.md).

`FileList` now renders its file-type icon and remove button as `Chip.Adornment`s
internally; its own API is unchanged.
