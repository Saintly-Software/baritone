---
"@saintly-software/baritone": major
---

Overlays no longer carry a `z-index`. Base UI portals `Tooltip`, `Popover`,
`Menu`, `Select`, `Combobox`, `Modal`, and `Drawer` to the end of `<body>`,
where they stack above page content by DOM order, so the per-surface `z-index`
was redundant and has been removed. To keep this robust, the theme scope now
establishes its own stacking context via `isolation: isolate` — set inline by
`BaritoneTheme` and attached to the generated class by `createDesignSystemTheme`
— so any z-indexed app content stays contained below the portaled popups.

**Breaking:** the `zIndex` token scale is removed from the theme contract.
`vars.zIndex` no longer exists, and `zIndex` is no longer part of the token
values a theme supplies (`ThemeTokensInput`). Callers of `buildDefaultTokens`
are unaffected; if you hand-build token objects, drop the `zIndex` key. If your
app root creates its own stacking context, ensure it sets `isolation: isolate`
(the shipped theme classes and `BaritoneTheme` now do this for you).
