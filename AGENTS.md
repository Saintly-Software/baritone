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
- **Do not pass `disabled` to `Field.Root`.** base-ui propagates a Field's
  `disabled` down to its controls as the _native_ attribute, which silently
  re-breaks focusability. Model disabled on the control(s) instead.
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
