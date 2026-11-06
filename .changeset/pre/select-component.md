---
"@saintly-software/baritone": minor
---

Add a `Select` component — a "form control" element type for choosing from a
list, built on base-ui's `Select` (listbox semantics, keyboard navigation,
typeahead) and wrapped in a `Field` for label / description / error association,
like `TextInput` and `RadioGroup`. It takes a `state` (not intent/saliency).

Discriminated on `multiple`, so `value` / `onChange` stay in lockstep:

- **single** (`multiple` omitted / `false`) — `value: string | null`,
  `onChange: (v: string | null) => void`; the chosen option shows a trailing
  check.
- **multiple** (`multiple`) — `value: string[]`,
  `onChange: (v: string[]) => void`; each option composes an `InternalCheckbox`
  reflecting whether it's selected.

Options are `ReadonlyArray<{ label; value; disabled? }>`. A per-option `disabled`
maps to base-ui's `aria-disabled` (never the native attribute), keeping the
option in the listbox's accessibility tree.

Also supports `label`, `description`, `errorMessage`, `size` (`sm | md | lg`),
`placeholder`, `required`, `name`, `loading` (busy spinner in place of the
chevron), and a clear button (suppress with `hideClearButton`). Disabled follows
the system convention — `aria-disabled` + base-ui's `readOnly`, so the trigger
stays keyboard-focusable.
