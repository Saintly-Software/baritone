---
"@saintly-software/baritone": minor
---

Add a `Checkbox` component.

A single boolean "form control", built on base-ui's `Checkbox` for behaviour
(role, keyboard, form wiring) and wrapped in a `Field` for ARIA, the same way
`TextInput` and `RadioGroup` are.

- **Visual is `InternalCheckbox`:** slotted in via base-ui's `render` prop —
  base-ui owns the focusable `role="checkbox"` element and feeds it
  `data-checked` / `data-disabled` / `data-invalid`, while `InternalCheckbox`
  owns the look (box, glyph, focus ring).
- **Explicit labelling:** because base-ui's hidden `<input>` is `aria-hidden`, a
  wrapping `<label>` would only name *it*, not the box — so the box is named
  explicitly with `aria-labelledby` pointing at the visible label.
- **Smaller API than `RadioGroup`:** a checkbox is one boolean, so `value` is a
  `boolean` and validation is a plain `invalid` flag rather than a full
  `FormState`.
