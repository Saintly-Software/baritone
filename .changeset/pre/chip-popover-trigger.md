---
"@saintly-software/baritone": minor
---

Add a `popover` prop to `Chip` for opening a `<Popover>` from the chip's text label.

- **`Chip` gains `popover`** — pass a fully configured `<Popover>` element and the
  chip slots itself in as that popover's `trigger`, rendering its text label as a
  real `<button>` that base-ui wires up. The label button carries the popup a11y
  attributes (`aria-haspopup` / `aria-expanded` / `aria-controls`) and toggles the
  surface; only the label is the trigger, so adornments keep their own actions.
- A disabled chip's label trigger stays keyboard-focusable (`aria-disabled`) but
  swallows the click, so the popover won't open. The prop composes with `onClick`
  (which still fires) and has no effect without text `children` or while `loading`.
