---
"@saintly-software/baritone": minor
---

Keep disabled form controls keyboard-focusable.

`Checkbox`, `Switch`, `RadioGroup`, and `CheckboxGroup` now model their disabled
state with `aria-disabled` instead of the native `disabled` attribute, matching
`Button` and `TextInput`. The native attribute drops an element out of the tab
order, so a disabled control couldn't be focused to explain _why_ it's disabled;
these controls now stay tabbable while still rejecting interaction.

- Disabled is applied as `aria-disabled` plus base-ui's `readOnly` (which vetoes
  the toggle/selection — click, Space, Enter — while keeping the control in the
  tab order). `Field.Root` no longer receives `disabled`, since base-ui would
  re-apply the native attribute to its controls.
- **Behaviour change:** because these controls are no longer natively
  `disabled`, a disabled control's value is now included in native form
  submission (consistent with how `TextInput`'s `readOnly`-based disabled already
  behaves). The visible dimmed styling is unchanged.

This is now a system-wide rule: a new convention test
(`src/test/aria-disabled-convention.test.ts`) fails CI if the native `disabled`
attribute is applied to any interactive control, and the pattern is documented in
`AGENTS.md`.
