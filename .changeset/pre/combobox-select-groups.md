---
"@saintly-software/baritone": minor
---

Add option **groups** to `Combobox` and `Select`. Both components' `options`
prop now accepts either a flat list (as before) or an array of
`{ label, options }` groups, rendered under headings via base-ui's
`Group` / `GroupLabel` (a labelled `role="group"`).

- New exported types `ComboboxOptionGroup` and `SelectOptionGroup`.
- Fully backwards-compatible — passing a flat `Option[]` is unchanged.
- `Combobox`: groups work with sync filtering (matches per group, empty groups
  drop out), async `search.results`, free-text, and single/multiple. The
  `virtualized` window remains flat-only — a grouped source is flattened there.
- `Select`: groups work in single and multiple mode; the selected value still
  resolves to its label on the trigger.
- Group headings use a small, muted, semibold eyebrow aligned to the option rows.
