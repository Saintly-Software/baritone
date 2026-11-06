---
"@saintly-software/baritone": patch
---

`FileList` now sets stable `key`s on each item's download/remove actions and lead
adornment, fixing the missing-key React warnings emitted when rendering a file
list.
