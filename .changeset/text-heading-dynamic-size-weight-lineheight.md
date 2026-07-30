---
"@saintly-software/baritone": minor
---

Make `Text`/`Heading`'s `size` and `weight` props **dynamic and consumer-defined**,
and add a matching **`lineHeight` (leading) prop** — all three mirroring the `font`
and `letterSpacing` pattern. The built-in scales still ship and stay token-backed
(`xs`…`9xl`, `default`…`superbold`, and the new `none`…`loose` leadings), but an app
can now register its own font-sizes, weights, and line-heights outside them. Each is
an _open_ vocabulary, working through three seams instead of the vanilla-extract
contract:

- **Values** — the theme publishes one `--fontSize-<name>` / `--fontWeight-<name>` /
  `--lineHeight-<name>` custom property per step. `createDesignSystemTheme` /
  `createInlineTheme` / `BaritoneTheme` gain `sizes`, `weights`, and `lineHeights`
  options (`{ hero: "4rem" }`, `{ black: "900" }`, `{ airy: "2.2" }`) plus a
  `defaultWeight` option that sets the weight bare `<Text>` uses.
- **Types** — augment the new `FontSizeRegistry` / `FontWeightRegistry` /
  `LineHeightRegistry` interfaces to tighten each prop from a loose `string` to the
  built-ins plus your names, with autocompletion:
  ```ts
  declare module "@saintly-software/baritone" {
    interface FontSizeRegistry {
      hero: true;
    }
  }
  ```
- **Plumbing** — the props resolve to `var(--fontSize-<name>)` etc. via new
  `--textSize` / `--textLineHeight` / `--textWeight` custom properties the size
  recipe reads (mirroring how the family reads `--textFont`); inline vars per
  instance, no variant-class explosion.

`lineHeight` is purely **additive** and preserves the size↔leading pairing: `size`
still applies its tuned per-size line-height by default, and `lineHeight` only
overrides it when set. Its built-in vocabulary is a Tailwind-style unitless leading
scale — `none` (1), `tight` (1.25), `snug` (1.375), `normal` (1.5), `relaxed`
(1.625), `loose` (2) — backed by a new `text.lineHeight` token group (overridable via
`BrandSeed.lineHeight`).

Also:

- **Dev warning** — in development, a `size`/`weight`/`lineHeight` name pointing at a
  custom property the active theme never published logs an actionable `console.warn`
  (the text would otherwise silently fall back to the `md` size/leading or `default`
  weight). Deduped per var, skipped under jsdom, dead-code-eliminated from production.
- `textSizeVar` / `textLineHeightVar` / `textWeightVar` are exported for advanced
  composition, alongside `FontSizeRegistry` / `FontSizeName` / `BuiltinFontSizeName` /
  `fontSizeVarName` / `fontSizeVars` / `FontSizeOptions` (and the `FontWeight*` /
  `LineHeight*` equivalents) from the theme.

**Breaking (alpha):** `size` and `weight` are now loose `string`s until you augment
the matching registry — the built-in names and the scalar API
(`size="4xl"`, `weight="bold"`) are unchanged, and the `text.size` / `text.weight`
tokens (and `BrandSeed.fontScale`) still back the built-ins, but the compile-time
autocomplete/typo-check on the raw props is opt-in via the registry (exactly as with
`font` / `letterSpacing`). The other components that take a built-in size
(`Button.variant`, `MetricCard.valueSize`, `Lockup.size`, `HelpText`) are unchanged.
