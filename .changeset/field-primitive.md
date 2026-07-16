---
"@saintly-software/baritone": major
---

Add the `Field` primitive and compose every form control on it, so label /
help / error layout and ARIA wiring live in one place instead of being
re-derived per component.

`Field` pairs a label and help / error text with an arbitrary control:

```tsx
<Field label="Email" helpText="We'll never share it.">
  <Field.Control render={<input />} />
</Field>
```

- **Naming is now mutually exclusive.** `label`, `aria-label`, and
  `aria-labelledby` are a union (`FieldLabellingProps`): passing more than one is
  a compile error, and a runtime `console.warn` in dev catches JS callers. There
  is no precedence order to remember any more — previously `label` silently beat
  `aria-label` on some controls and `aria-labelledby` silently beat `label` on
  others.
- **`helpText` renders a `HelpText`** and combines with any `aria-describedby`
  you set on the control rather than replacing it.
- **`labelPosition`** (`top` — default — / `start` / `end`) inlines the label,
  reusing the existing `LABEL_POSITIONS` vocabulary. `start`/`end` are
  inline-logical and keep the help text aligned under the _control_.
- **`fit`** (`fill` — default — / `content`) claims the line or shrink-wraps.
- **`required`** marks the label with an asterisk. The marker is decorative and
  sits _beside_ the `<label>`, never inside it, so the control's accessible name
  (and `getByLabelText`) stay exactly the label's text. The announced half lives
  on the control, which every form control here sets too.
- **`info`** hangs an `InfoButton` beside the label (moved off `TextInput` /
  `FileUpload`, which duplicated it).
- **`slotProps`** re-tunes the `label` / `helpText` / `info` slots.
- Controls base-ui's field context can't reach (a bare `<div role="group">`) take
  their wiring from the render-prop form of `children`:
  `{({ nameAttrs, describedBy }) => …}`.

**Fixes**

- **`CheckboxGroup`'s help text was wired to nothing.** Its group is a plain
  `<div role="group">`, which base-ui's field context doesn't reach, so
  `aria-describedby` was never set and the help / error text was rendered but
  never announced. It is now wired (and covered by tests).
- **`Select`, `ToggleGroup`, and `FileUpload` ignored a disabled `Fieldset`.**
  They didn't read `useIsFieldDisabled()`, contrary to what `Fieldset`'s own docs
  claimed. All three now inherit it.

**Breaking**

- `description` → **`helpText`** on `TextInput`, `Select`, `Combobox`,
  `RadioGroup`, `CheckboxGroup`, `ToggleGroup`, and `Switch` (`Checkbox` and
  `FileUpload` already used `helpText`). `Card`, `Notice`, and `Meter` keep
  `description` — they aren't form controls.
- `slotProps.description` → **`slotProps.helpText`** (`TextInput`);
  `slotProps.help` → **`slotProps.helpText`** (`FileUpload`).
- Passing more than one of `label` / `aria-label` / `aria-labelledby` no longer
  compiles. Drop the redundant one — it was already being ignored.
- `Switch`'s and `FileUpload`'s `invalid?: boolean` → **`state?: FormState`**,
  matching `Checkbox`. `invalid` becomes `state="invalid"`. `FileUpload`'s
  dropzone now renders all four states (its recipe is generated from
  `FORM_STATES`, like `formControlRecipe`, so it can't fall behind again), and
  gained the `errorMessage` the other controls have.
- Re-typing a control's props needs the new **`DistributiveOmit`** /
  `DistributivePartial` helpers instead of the built-ins. `Omit`/`Partial` over a
  union collapse it into one object carrying every arm's keys, which breaks the
  mutually-exclusive labelling arms.

**Visual**

- The label→control and control→help gaps are now a consistent 8px everywhere.
  `TextInput`, `Select`, `Combobox`, `Checkbox`, and `Switch` previously used 4px.
- A `required` field now shows an asterisk after its label. `RadioGroup` and
  `CheckboxGroup` gained a `required` prop (they had none).
- `errorMessage` now renders through `HelpText`, so it picks up that component's
  automatic warning glyph.
- A disabled field dims its label and help text (previously only `Checkbox` /
  `Switch` dimmed their row labels).

`Field` deliberately has no `id` prop: an `id` on base-ui's `Field.Root` doesn't
reach the control (base-ui generates one regardless), so it would be a lie. Put
`id` on the control, where it already works.
