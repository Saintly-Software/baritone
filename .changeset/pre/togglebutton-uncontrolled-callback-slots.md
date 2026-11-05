---
"@saintly-software/baritone": minor
---

Add uncontrolled mode and state-aware callback slots to `ToggleButton`. All
additions are non-breaking — the existing controlled `value` + `onChange` API
stays valid.

- **Uncontrolled mode** — omit `value` and the component tracks its own pressed
  state, seeded from the new optional `defaultValue?: boolean`. `onChange` is
  now optional in both modes (a callback slot, not the source of truth).
- **State-aware slots** — `icon` and `aria-label` may each be a function of the
  pressed state (`(pressed: boolean) => ReactNode | string`), so the glyph / name
  can flip with the toggle (e.g. Mute ⇄ Unmute).
- **`onChange` now exposes the DOM event** — its signature is
  `(value: boolean, event: React.MouseEvent<HTMLButtonElement>) => void`.
