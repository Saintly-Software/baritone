---
"@saintly-software/baritone": minor
---

Add form-control affordances to `ToggleGroup` so it works as a **labelled form
control**, not just a toolbar segmented control. All opt-in and non-breaking —
the toolbar `intent` / `saliency` / `size` props are untouched.

- **`label`** — a visible group label. When present the control renders field
  semantics: the group is named by the label (via `aria-labelledby`, taking
  precedence over `aria-label`) and the whole thing wraps in a `Field` for
  consistent label / help / error layout.
- **`description`** — inline help under the group, wired to the group via
  `aria-describedby` (like `TextInput` / `RadioGroup`). Because the group isn't a
  base-ui `Field` control, the ARIA is wired explicitly rather than through
  `Field`'s auto-association.
- **`errorMessage`** — validation text shown and announced under the group when
  `state` is `invalid`.
- **`state`** — a `FormState` (`neutral | warning | invalid | valid`, default
  `neutral`). `invalid` flags the group `aria-invalid` and reveals the
  `errorMessage`; the toolbar `intent` / `saliency` still own the segment colours.
- **`required`** — sets `aria-required` on the group.

Disabled is unchanged — still modelled with `aria-disabled` + a change-handler
veto (never the native attribute), so segments stay keyboard-reachable.
