---
"@saintly-software/baritone": minor
---

Make `Text`/`Heading`'s `letterSpacing` (tracking) prop **dynamic and
consumer-defined**, mirroring the `font` prop. The built-in steps
(`tighter`…`widest`) still ship and stay token-backed, but an app can now register
its own tracking values — a hand-tuned `em` for an all-caps eyebrow, a display
headline's negative track — outside that ramp. Like `font`, this is an _open_
vocabulary, so it works through three seams instead of the vanilla-extract
contract:

- **Values** — the theme publishes one `--letterSpacing-<name>` custom property
  per step. `createDesignSystemTheme` / `createInlineTheme` / `BaritoneTheme` gain
  a `letterSpacings` option (`{ eyebrow: "0.2em" }`) plus a `defaultLetterSpacing`
  option that sets the tracking bare text uses. The built-in `tighter`…`widest`
  steps are always published (from the `text.letterSpacing` tokens).
- **Types** — augment the new `LetterSpacingRegistry` interface to tighten
  `letterSpacing` from a loose `string` to the built-ins plus your names, with
  autocompletion, while Baritone stays ignorant of the names:
  ```ts
  declare module "@saintly-software/baritone" {
    interface LetterSpacingRegistry {
      eyebrow: true;
      display: true;
    }
  }
  ```
- **Plumbing** — the `letterSpacing` prop resolves to `var(--letterSpacing-<name>)`
  via a new `--textLetterSpacing` custom property the size recipe reads (mirroring
  how the family reads `--textFont`); a single inline var per instance, no
  variant-class explosion.

Also:

- **Dev warning** — in development, `letterSpacing="<name>"` pointing at a
  `--letterSpacing-<name>` the active theme never published logs an actionable
  `console.warn` (the text would otherwise silently fall back to `normal`
  tracking). Deduped per name, skipped under jsdom, and dead-code-eliminated from
  production builds.
- `textLetterSpacingVar` is exported for advanced composition, alongside
  `LetterSpacingRegistry` / `LetterSpacingName` / `BuiltinLetterSpacingName` /
  `letterSpacingVarName` / `letterSpacingVars` / `LetterSpacingOptions` from the
  theme.

**Breaking (alpha):** `letterSpacing` is no longer a responsive sprinkles atom —
it no longer accepts per-breakpoint objects (`{ mobile: "tight", md: "wide" }`).
The scalar API (`letterSpacing="widest"`) and the built-in step names are
unchanged. The `text.letterSpacing` tokens and `BrandSeed.letterSpacing` overrides
still back the built-ins.
