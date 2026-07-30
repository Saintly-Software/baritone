---
"@saintly-software/baritone": minor
---

Add a `textStyle` prop to `Text` and `Heading` — an open, app-defined vocabulary
of named typography *roles*.

Where `font` names one family, a `textStyle` bundles several typographic
properties (size, line-height, weight, family) under one app-declared name, so a
consuming app can say `textStyle="title"` instead of scattering inline
`style={{ lineHeight, … }}` overrides across every title, body, and label. It's
the typographic sibling of `font` and rides the exact same seam — the one _open_
vocabulary pattern in Baritone — so the set of roles is defined by the **consuming
app**, not the design system.

- **Values** — the theme publishes a small group of `--textStyle-<name>-*` custom
  properties per role. `createDesignSystemTheme` / `createInlineTheme` /
  `BaritoneTheme` gain a `textStyles` option:
  ```ts
  textStyles={{
    title: { size: "5xl", lineHeight: 1.04, weight: "bold", font: "serif" },
    lyric: { size: "xl", lineHeight: 1.85, font: "serif" },
    badge: { size: "sm", lineHeight: 1 },
  }}
  ```
  A role sets only the properties it owns; `size` is a convenience that pulls
  `fontSize`+`lineHeight` from a `text.size` token, and an explicit
  `fontSize`/`lineHeight` overrides it.
- **Types** — augment the new `TextStyleRegistry` interface to tighten `textStyle`
  from a loose `string` to your declared names with autocompletion, while Baritone
  stays ignorant of them:
  ```ts
  declare module "@saintly-software/baritone" {
    interface TextStyleRegistry {
      title: true;
      lyric: true;
      badge: true;
    }
  }
  ```
- **Plumbing** — a `textStyle` points the size recipe's per-instance vars
  (`--fontSize` / `--lineHeight` / `--fontWeight` / `--textFont`) at the theme's
  published values. A property a role _omits_ resolves to the guaranteed-invalid
  value, so the recipe's `fallbackVar` falls back to the base token — the same
  var-chaining `--textFont` already uses. No variant-class explosion.

A `textStyle` is a **baseline**; explicit props always win:

```
explicit prop  >  textStyle  >  Heading level default  >  base token default
```

So `<Heading level={1} textStyle="title" size="4xl">` renders the `title` bundle
nudged to `4xl`, and on a `Heading` a `textStyle` yields the level's default
`size` _and_ `weight` to the bundle (both still overridable per instance).

Also:

- **Dev warning** — in development, `textStyle="<name>"` naming a style the active
  theme never published logs an actionable `console.warn` (the bundle would
  otherwise silently do nothing). Deduped per name, skipped under jsdom, and
  dead-code-eliminated from production builds — mirroring the `font` warning.
- **`TextStyleRegistry` / `TextStyleName` / `TextStyleDef` / `TextStyleOptions` /
  `textStyleVarName` / `textStyleVars`** are exported from the theme entry for
  augmentation and advanced composition.
- The `textSizeRecipe` base now routes `fontSize` / `lineHeight` / `fontWeight`
  through per-instance vars with a token fallback, and its `size` `defaultVariants`
  moved to the component layer — behaviourally identical for existing callers (a
  bare `<Text>` is still `md`), but it lets an unset `size` defer to a `textStyle`.
