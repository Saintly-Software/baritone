---
"@saintly-software/baritone": patch
---

Fix `CheckboxGroup` and `RadioGroup` group labels activating the first option when clicked. The group label now renders as a non-`<label>` element, since it already names the group through `aria-labelledby`. `CheckboxGroup` options also get unique input ids instead of sharing the field's id.
