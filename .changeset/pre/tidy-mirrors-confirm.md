---
"@saintly-software/baritone": minor
---

Add a `ConfirmationModal` component — a focused confirm/cancel dialog built on
`Modal` (DES-61).

- Composes `Modal`, so the focus trap, Escape/backdrop behaviour, and ARIA wiring
  come for free. Adds an intent-tinted `icon` + `header`, the body, and a footer
  with a **cancel** button (dismisses) and a **confirm** button.
- `intent` (`secondary` | `warning` | `negative`, default `negative`) colours the
  icon and the confirm button; the confirm's own `intent` is limited to the same
  set.
- Actions take full `Button` props via `confirm` / `cancel`, or the
  `handleConfirm` / `handleCancel` callback shorthands. Confirm dismisses by
  default; call `event.preventDefault()` in the handler to keep it open for an
  async confirm.
- `loading` shows the confirm spinner and locks the dialog (Escape / cancel /
  confirm can't dismiss it) while the action is in flight; `disabled` locks it for
  an unmet precondition. Both keep the buttons focusable via `aria-disabled`.
- Controlled (`open` / `onOpenChange`, optional `trigger`) or uncontrolled
  (`trigger` required). Exposes `ConfirmationModal.Trigger` / `.Close` (the same
  parts as `Modal`).
