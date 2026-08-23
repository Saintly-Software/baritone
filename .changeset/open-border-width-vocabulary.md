---
"@saintly-software/baritone": minor
---

Make border width a consumer-extensible *open* vocabulary, mirroring `Text`'s
`size` / `weight` / `font`. Divider's `thickness` prop is no longer limited to the
built-in `thin` / `thick` steps — an app can publish its own named widths and select
them by name.

- **New `borderWidths` theme option** on `createDesignSystemTheme` /
  `createInlineTheme` / `BaritoneTheme`. Each entry emits a `--borderWidth-<name>`
  custom property (e.g. `borderWidths: { hair: "0.5px", heavy: "4px" }`); the
  built-in `thin` / `thick` steps are always published from the tokens (and stay
  reserved), so a runtime brand swap still flows through.
- **New `BorderWidthRegistry` module-augmentation seam** plus `BorderWidthName` /
  `BuiltinBorderWidthName` types and the `borderWidthVarName` / `borderWidthVars`
  helpers. Augment the registry to tighten a border-width prop to the built-ins plus
  your declared names, with autocompletion:

  ```ts
  declare module "@saintly-software/baritone" {
    interface BorderWidthRegistry { hair: true; heavy: true }
  }
  ```

- **`Divider`'s `thickness` now accepts `BorderWidthName`** (a loose `string` until
  the registry is augmented) and resolves to `var(--borderWidth-<name>)`. A dev-only
  warning fires when a name isn't published by the active theme (the rule falls back
  to `thin`).

Fully backwards-compatible: `thickness="thin"` / `"thick"` behave exactly as before.
