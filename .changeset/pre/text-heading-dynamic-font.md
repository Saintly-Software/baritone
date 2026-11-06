---
"@saintly-software/baritone": minor
---

Add a dynamic, consumer-defined `font` prop to `Text` and `Heading`.

Unlike every other typography knob (`size`, `weight`, `intent`, …), the set of
values `font` accepts is defined by the **consuming app**, not the design system.
A coding app might register `monospace` / `nonmono`; a lyric-writing app a larger
set of display faces. This is the one _open_ vocabulary in Baritone, so it can't
ride the build-time vanilla-extract contract — it works through three seams:

- **Values** — the theme publishes one `--font-<name>` custom property per family.
  `createDesignSystemTheme` / `createInlineTheme` / `BaritoneTheme` gain a `fonts`
  option (`{ display: '"Playfair Display", serif' }`) plus a `defaultFont` option
  that picks the family bare text uses (e.g. `"mono"` for a code-first app). The
  built-in `sans` and `mono` are always published.
- **Types** — augment the new `FontRegistry` interface to tighten `font` from a
  loose `string` to `sans | mono | <your names>` with autocompletion, while
  Baritone stays ignorant of the names:
  ```ts
  declare module "@saintly-software/baritone" {
    interface FontRegistry {
      display: true;
      handwriting: true;
    }
  }
  ```
- **Plumbing** — the `font` prop resolves to `var(--font-<name>)` via a new
  `--textFont` custom property that the size recipe reads (mirroring how colour
  reads `--textColor`); a single inline var per instance, no variant-class
  explosion.

Also:

- **Dev warning** — in development, `font="<name>"` pointing at a `--font-<name>`
  the active theme never published logs an actionable `console.warn` (the text
  would otherwise silently inherit its ancestor's family). Deduped per name,
  skipped under jsdom, and dead-code-eliminated from production builds.
- **The boolean `mono` prop is removed** — use `font="mono"` (a built-in). The
  redundant `typographyFont` recipe is gone too.
- `textFontVar` is exported alongside `textColorVar` for advanced composition, and
  `FontRegistry` / `FontName` / `fontVarName` / `fontFamilyVars` from the theme.
