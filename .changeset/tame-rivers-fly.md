---
"@saintly-software/baritone": minor
---

Add a `Switch` component.

A single boolean "form control", built on base-ui's `Switch` for behaviour
(role, keyboard, form wiring) and wrapped in a `Field` for ARIA, the same way
`Checkbox`, `TextInput`, and `RadioGroup` are.

- **Visual is `InternalSwitch`:** slotted in via base-ui's `render` prop —
  base-ui owns the focusable `role="switch"` element and feeds it
  `data-checked` / `data-disabled` / `data-invalid`, while `InternalSwitch`
  owns the look (track, sliding thumb, focus ring).
- **Explicit labelling:** because base-ui's hidden `<input>` is `aria-hidden`, a
  wrapping `<label>` would only name _it_, not the track — so, exactly like
  `Checkbox`, the track is named explicitly with `aria-labelledby` pointing at
  the visible label.
- **Same shape as `Checkbox`:** a switch and a checkbox are the same control
  (one boolean), so the API is deliberately identical — `value` is a `boolean`
  and validation is a plain `invalid` flag.
