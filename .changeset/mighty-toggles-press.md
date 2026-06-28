---
"@saintly-software/baritone": minor
---

Add a `ToggleButton` component.

An icon-only button with an on / off (`aria-pressed`) state, for toolbar-style
toggles (bold, mute, pin, …). It's a thin wrapper over the very same
`InternalButton` that powers `Button`: `value` / `onChange` drive the
`aria-pressed` flag and the click, and the `icon` is the button's only content.

- **Pressed state expressed through saliency:** `intent` / `saliency` describe
  the *on* look, and the *off* look drops to `low` (ghost) saliency, so the two
  states are visibly distinct while reusing the shared `component` colour recipe
  (no toggle-specific colours). `saliency` defaults to `high` (filled).
- **Required `aria-label`:** the button is icon-only and has no visible text, so
  its accessible name is required — the mirror image of `Button`, which *forbids*
  `aria-label` precisely because its visible label is already the name.
- **`intent` / `saliency` / `size`:** the pressed look, shared with `Button` /
  `Chip`; square at every size.
- **Focusable when disabled:** uses `aria-disabled` rather than the native
  attribute, so a disabled toggle stays keyboard-reachable (and can surface
  `disabledReason`); clicks and keyboard activation are vetoed.
- **`disabledReason`:** shows a tooltip when a disabled toggle is tabbed to or
  hovered.
