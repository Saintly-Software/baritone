---
"@saintly-software/baritone": patch
---

`Select` now anchors its listbox consistently below the trigger. The positioner
pins `side="bottom"`, `align="start"`, and `alignItemWithTrigger={false}`, so the
popup always opens downward and start-aligned rather than overlaying the selected
item on top of the trigger.
