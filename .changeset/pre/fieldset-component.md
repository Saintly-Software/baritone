---
"@saintly-software/baritone": minor
---

Add a `Fieldset` component — groups related controls under a shared legend and an
optional shared disabled context. Built on Base UI's `Fieldset`, so it renders a
real `<fieldset>` and wires the legend as the group's accessible name.

- **`disabled`** — disables every nested control at once. It propagates through
  React context (not the native `<fieldset disabled>` attribute, which would drop
  the controls out of the tab order), so disabled controls keep the system's
  focusable `aria-disabled` model. Nesting composes: an inner fieldset can add to,
  but never undo, an outer fieldset's disabled state.
- **`FieldsetLegend`** — the group's visible heading, styled like the form-group
  labels and dimmed when the fieldset is disabled. Or label the group with an
  existing element via `aria-labelledby`.
- **`useIsFieldDisabled()`** — the hook controls read to inherit the fieldset's
  disabled state. Every form control in the package (`TextInput`, `Checkbox`,
  `Switch`, `RadioGroup`, `CheckboxGroup`, `Combobox`) and `Button` now ORs it
  into their own `disabled`, so wrapping them in a disabled `Fieldset` disables
  them while keeping each one focusable.
