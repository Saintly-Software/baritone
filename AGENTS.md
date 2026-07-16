# Contributor & agent guide

Conventions for anyone (human or AI) changing this package. These are rules, not
suggestions — CI enforces the ones marked **enforced**.

## Disabled controls must stay focusable (enforced)

**Never put the native `disabled` attribute on an interactive control.** The
native attribute removes the element from the tab order, so it can't be focused —
which means a disabled control can't explain _why_ it's disabled (a tooltip, an
inline reason) and keyboard users can't even land on it to find out. Model
disabled state with ARIA instead, so the element stays reachable:

| Element type                                                                   | How to disable                                                                          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Buttons / links / surfaces (`Button`, `Chip`, `Card`)                          | `aria-disabled={disabled \|\| undefined}` + swallow the activation in the click handler |
| Form inputs (`TextInput`, `Checkbox`, `Switch`, `RadioGroup`, `CheckboxGroup`) | `aria-disabled` **+ base-ui's `readOnly`** (keeps focus; base-ui vetoes the toggle)     |

Notes for the form controls specifically:

- Pass base-ui's **`readOnly`** (not `disabled`) to `Checkbox.Root` /
  `Switch.Root` / `Radio.Root` / `RadioGroup`. base-ui keeps `readOnly` controls
  in the tab order but blocks the toggle/selection (click, Space, Enter). Add
  `aria-disabled` alongside it for the semantics.
- **Do not pass `disabled` to base-ui's `Field.Root`** (always imported as
  `BaseField`). base-ui propagates a Field's `disabled` down to its controls as
  the _native_ attribute, which silently re-breaks focusability. Model disabled on
  the control(s) instead. Our own `Field` wrapper does take a `disabled`, but it
  is presentational only and deliberately never reaches `BaseField.Root` — see
  "Form controls compose `Field`" below.
- The dimmed _look_ comes from the presentational `InternalCheckbox` /
  `InternalSwitch` (their `disabled` prop sets `data-disabled` — it is visual
  only and never reaches the DOM as the native attribute) plus the row/label
  `*Disabled` classes. Passing `disabled` to those `Internal*` components is fine.

### Enforcement

- `src/test/aria-disabled-convention.test.ts` parses every component and fails if
  a `disabled` attribute lands on a native element or a base-ui form primitive.
  Our own `Internal*` wrappers and base-ui's `Tooltip.Root` are allowlisted (see
  the comment there); add to the allowlist only with a clear reason.
- Every interactive component has a test asserting it can be **tabbed to** while
  disabled (`aria-disabled="true"`, not `:disabled`, and `toHaveFocus()` after a
  `Tab`). Add the same when you add a component — see `Button.test.tsx` or
  `Checkbox.test.tsx` for the pattern.

## Form controls compose `Field` (enforced)

**Never re-derive label / help / error layout or ARIA wiring in a control.**
`src/components/Field` owns it, and every form control composes it. A new control
gets the shared contract for free:

```tsx
<Field label={label} helpText={helpText} errorMessage={errorMessage} state={state}>
  <Field.Control render={<input />} />
</Field>
```

- **Naming is a union, not a precedence order.** Take `FieldLabellingProps` by
  intersection (`type MyProps = MyBaseProps & FieldLabellingProps`) so `label` /
  `aria-label` / `aria-labelledby` stay mutually exclusive. Never re-add an
  `aria-label?: string` of your own — `Omit` it off any HTML attributes you
  extend, or the union can't own it.
- **Spread `fieldNameAttrs(...)`, never bare `aria-*={undefined}`.** base-ui's
  `mergeProps` treats an explicit `undefined` as a value and clobbers the name /
  description coming from the field context, silently unlabelling the control.
  Same for `aria-describedby`: `{...(x != null && { "aria-describedby": x })}`.
- **base-ui wires its own components** (`Field.Control`, `Select`, `RadioGroup`,
  `Checkbox`, `Switch`) through the field context. A control it _can't_ see — a
  bare `<div role="group">`, a toolbar — must take `nameAttrs` / `describedBy`
  from the render-prop form of `children` and spread them itself. Forgetting this
  is how `CheckboxGroup`'s help text ended up pointing at nothing.
- **`Field`'s `disabled` is presentational** (it dims the label and help text).
  It is _not_ forwarded to `BaseField.Root` — base-ui would turn it into the
  native attribute on the control. Model the real thing on the control, and OR in
  `useIsFieldDisabled()` so a wrapping `Fieldset` reaches you.
- **`id` and `required` go on the control**, not the `Field`. An `id` on base-ui's
  `Field.Root` doesn't reach the control, so `Field` deliberately has no such prop.
- **Re-typing a control's props** needs `DistributiveOmit` / `DistributivePartial`
  (`src/utils/types.ts`). The built-in `Omit`/`Partial` collapse a union into one
  object carrying every arm's keys, quietly destroying the exclusivity.

### Enforcement

- `src/test/field-composition.test.ts` fails if anything other than
  `src/components/Field` imports base-ui's `Field` directly.
- The labelling exclusivity is enforced by `pnpm typecheck` (the union makes a
  conflicting pair a compile error); `Field` also warns at runtime in dev for JS
  callers, and `Checkbox` / `Switch` call `warnOnConflictingNames` themselves
  because their label lives inside the clickable row rather than in the `Field`.

## Other conventions

- **Class names:** join with the local `cx` helper (`src/utils/cx.ts`); there is
  no `clsx`/`classnames` dependency.
- **Variants are the source of truth:** every variant prop is backed by a
  vanilla-extract recipe variant. Add styles as recipe variants, not ad-hoc
  `style` props (there's no token-bypassing `style` escape hatch on the colour
  API).
- **Polymorphism:** use base-ui's `render` prop (no `asChild`).

## Before you push

`pnpm fmt:check && pnpm lint:check && pnpm typecheck && pnpm test` — the same four
gates CI runs (see `.github/workflows/quality-check.yml`).
