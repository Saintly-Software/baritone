---
"@saintly-software/baritone": minor
---

Add a `Lockup` component — an icon locked up with a title and optional subtitle,
after the logo-design idea of a fixed "lockup" of mark and wordmark. A flexible
media object: the mark sits inline with the stacked text, each of the three
pieces (`icon` / `title` / `subtitle`) is optional, and each renders as a system
primitive (`Icon`, `Text`) you can tune through `slotProps`. Colours are
inherited from the surrounding surface, so a lockup drops into a coloured
`component` / `surface` and matches automatically. Swap the root element via the
base-ui `render` prop.
