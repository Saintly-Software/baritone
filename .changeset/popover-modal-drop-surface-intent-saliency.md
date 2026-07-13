---
"@saintly-software/baritone": minor
---

Remove the surface `intent` / `saliency` props from `Popover` and `Modal`.

**Breaking:** both components previously accepted `intent` and `saliency` to tint
the floating surface. In practice the surface should always read as the default
neutral, low-saliency shade — a coloured Popover/Modal surface is a Notice/Toast
job, not an overlay one — so those knobs have been dropped. The surface now always
renders `surfaceRecipe`'s `neutral` / `low` default; `padding` is unchanged.

- `<Popover>` and `<Modal>` no longer take `intent` or `saliency`.
- The `intent` / `saliency` on `<Popover.Trigger>` / `<Popover.Close>` (and the
  `Modal` equivalents) are **unaffected** — those are `Button` props and still
  colour the trigger / footer buttons.
- `InfoButton` is unaffected: it already only passed `intent` / `saliency` to its
  trigger button, never to the Popover surface.

Migration: drop the `intent` / `saliency` props from any `<Popover …>` /
`<Modal …>` usage. To colour the _trigger_, keep passing them to
`<Popover.Trigger>` / `<Modal.Trigger>` instead.
