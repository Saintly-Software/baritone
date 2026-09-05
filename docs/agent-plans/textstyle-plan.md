# `textStyle` — implementation plan

Add an open, app-defined vocabulary of named typography roles (a "text style" /
type-token) to Baritone, selected via a `textStyle` prop on `Text`/`Heading`. A
`textStyle` bundles several typographic properties (size, line-height, weight,
family, tracking) under one app-declared name, published by the theme — mirroring
exactly how the existing per-property vocabularies (`font`, `size`, …) work.

## Status — mostly overtaken (as of #95, 2026-07-31)

**The premise this plan was written against no longer holds.** When it was drafted,
`font` was the _only_ open, app-defined typographic vocabulary; `size`, `weight`,
`lineHeight`, and `letterSpacing` were closed. A run of PRs has since generalized
that seam to **every** typographic dimension, one property at a time:

- **#86** — dynamic, consumer-defined **`font`** prop.
- **#90 / #93** — themeable then fully dynamic, consumer-defined **`letterSpacing`**.
- **#95** — dynamic **`size`** and **`weight`**, plus a new dynamic **`lineHeight`**
  (leading) prop; a consumer `size` may also bundle a paired `lineHeight`.

So the two things this plan was going to _introduce_ already exist:

1. The **mechanism** below (an instance indirection var per property, read by the
   size recipe base with a token fallback, backed by an augmentable registry and
   theme-published `--<x>-<name>` vars) is now the **shipped** architecture — see
   [text.css.ts](src/styles/recipes/text.css.ts) and [vars.css.ts](src/styles/vars.css.ts).
2. The **motivation** — apps scattering inline `style={{ lineHeight, … }}` overrides
   because there's no way to name a typographic value — is largely solved. Each
   property is now an open vocabulary a consuming app can extend.

In particular, the old rejection of an "open `size`" (below) is **inverted**: `size`
is now open, exactly like `font`. A consumer registers hero/figure sizes via the
theme's `sizes` option + `FontSizeRegistry`.

**What's left for `textStyle`** is therefore _only the bundling_: letting one
app-declared name set several of these props at once, so a consumer writes
`textStyle="title"` instead of repeating `size="…" lineHeight="…" weight="…"
font="…"` on every title. That is a genuine ergonomic win, but a far smaller delta
than the original plan implied — see [What `textStyle` still adds](#what-textstyle-still-adds).
Whether the bundle earns its keep over the now-open per-property props is an open
question (see [Open questions](#open-questions)).

## What already ships (the per-property open vocabularies)

Each dimension follows the _same_ three-seam pattern `font` established. `Text` and
`Heading` both delegate to `InternalText`, so every prop lands in one place.

| Prop            | Theme option(s)                          | Registry                | Published var                                            | Instance var (recipe reads)         |
| --------------- | ---------------------------------------- | ----------------------- | -------------------------------------------------------- | ----------------------------------- |
| `font`          | `fonts`, `defaultFont`                   | `FontRegistry`          | `--font-<name>`                                          | `--textFont`                        |
| `size`          | `sizes`                                  | `FontSizeRegistry`      | `--fontSize-<name>` (+ paired `--sizeLineHeight-<name>`) | `--textSize` (+ `--textLineHeight`) |
| `lineHeight`    | `lineHeights`                            | `LineHeightRegistry`    | `--lineHeight-<name>`                                    | `--textLineHeight`                  |
| `weight`        | `weights`, `defaultWeight`               | `FontWeightRegistry`    | `--fontWeight-<name>`                                    | `--textWeight`                      |
| `letterSpacing` | `letterSpacings`, `defaultLetterSpacing` | `LetterSpacingRegistry` | `--letterSpacing-<name>`                                 | `--textLetterSpacing`               |

- **Built-ins stay token-backed.** Each vocabulary always publishes its built-in
  names (`xs`…`9xl`, `none`…`loose`, `default`/`semibold`/…, `sans`/`mono`,
  `tighter`…`widest`) from the theme contract; registry entries by those reserved
  names are ignored. Customise the built-ins via `BrandSeed` tokens, not the option.
- **The recipe base is one indirection per property.** `textSizeRecipe.base`
  ([text.css.ts:77](src/styles/recipes/text.css.ts:77)) resolves each dimension as
  `fallbackVar(<instanceVar>, <token default>)`. `Text`/`Heading` set the instance
  var inline to `var(--<x>-<name>)`; unset, it falls through to the token default.
- **`size` owns the size↔leading pair.** A `size` sets both `--textSize` and (from
  its paired `--sizeLineHeight-<name>`) `--textLineHeight`; the `lineHeight` prop
  overrides only the leading. A consumer `size` entry may be a bare `font-size`
  string or a `{ fontSize, lineHeight }` pair — see [fontSizes.ts](src/theme/fontSizes.ts).
- **Defaults can be seeded at the root.** `defaultFont` / `defaultLetterSpacing` /
  `defaultWeight` set the corresponding `--text…` instance var on the theme root so
  bare text picks them up ([createTheme.ts:108](src/theme/createTheme.ts:108)).
- **Theme plumbing is done.** `createDesignSystemTheme` and `createInlineTheme`
  already spread all five vocabularies' vars onto the theme root
  ([createTheme.ts:189](src/theme/createTheme.ts:189),
  [createTheme.ts:213](src/theme/createTheme.ts:213)); `CreateThemeOptions` extends
  every `*Options` interface.
- **Dev warning is shared.** A dev-only `console.warn` (the `warnIfVarUnset` helper
  in [InternalText](src/internal/components/InternalText/index.tsx)) fires when a
  name points at a var the theme never published.

## What `textStyle` still adds

The one thing the per-property props can't do: **name a reusable role that sets
several properties at once.** Today a consumer defining a "title" role registers a
`hero` size, a `title` leading, etc., and then must repeat the combination on every
element:

```tsx
<Heading level={1} size="hero" lineHeight="title" weight="bold" font="serif" />
```

`textStyle` would collapse that to:

```tsx
<Heading level={1} textStyle="title" />
```

where `title` is one theme-published bundle of `{ size?, lineHeight?, weight?,
font?, letterSpacing? }`. This is the "type token" ergonomic — the value is
_composition + a single name_, not any new low-level capability.

## The contract (precedence)

A `textStyle` is a **baseline bundle**; explicit props always win:

```
explicit prop  >  textStyle  >  Heading level default  >  base token default
```

Example: `<Heading level={1} textStyle="title" size="4xl">` renders the `title`
bundle, nudged to `4xl`.

Mechanically this falls out of ordering, exactly as it does for the per-property
props today: a `textStyle` sets the `--text…` instance vars (or the per-property
selections) first, and an explicit `size`/`weight`/`font`/… spreads **after** in the
same `style` object, so it wins. The base token default is the innermost
`fallbackVar` fallback when neither is set.

## The mechanism

`textStyle` **composes over the seam that already exists** — it does not introduce
one. Two viable shapes:

1. **Bundle → instance vars (simplest).** `textStyleVars(textStyles)` publishes,
   per style, the `--text…` instance-var values it defines (e.g.
   `--textStyle-title-size: var(--fontSize-hero)`), and `InternalText`, when
   `textStyle` is set, points each `--textFont`/`--textSize`/`--textLineHeight`/
   `--textWeight`/`--textLetterSpacing` at the bundle's value. Omitted properties
   never get set, so they fall through to the base token via `fallbackVar` — the
   same var-chaining every per-property prop already relies on. Explicit props
   spread after and override.
2. **Bundle → per-property names (reuses more).** A `textStyle` resolves to a set of
   existing vocabulary selections (`{ size: "hero", lineHeight: "title", … }`) that
   `InternalText` applies through the _same_ code paths the individual props use.
   More reuse, slightly more indirection.

Either way there is **no new recipe/var/theme-plumbing work** — those landed with
#86–#95. The remaining work is the bundle type, the theme option, and the
`InternalText` wiring.

## File-by-file changes (net-new bundle work only)

Most of the original file list is **already done** by #86–#95 (`vars.css.ts` vars,
the `textSizeRecipe` fallbacks, `createTheme` options + var spreading, the
`InternalText` plumbing, and the theme exports). What a `textStyle` bundle would
still need:

### 1. `src/theme/textStyles.ts` (new — mirror `fonts.ts` / `fontSizes.ts`)

- `interface TextStyleRegistry {}` (empty; consumers augment) + `TextStyleName`
  type resolving to `string` until augmented (copy the `FontSizeName` pattern at
  [fontSizes.ts:60](src/theme/fontSizes.ts:60)).
- `interface TextStyleDef { size?: FontSizeName; lineHeight?: LineHeightName;
weight?: FontWeightName; font?: FontName; letterSpacing?: LetterSpacingName }` —
  each field references an _existing_ vocabulary name, so a bundle is a named tuple
  of already-open selections.
- `textStyleVars(textStyles)` → `Record<string,string>` emitting, per style, the
  `--text…` instance-var value for each property it defines (resolving `size`→
  `var(--fontSize-<name>)`, `lineHeight`→`var(--lineHeight-<name>)`, etc.). Mirror of
  `fontSizeVars` at [fontSizes.ts:101](src/theme/fontSizes.ts:101).

### 2. `src/theme/createTheme.ts`

- Add a `TextStyleOptions { textStyles?: Record<string, TextStyleDef> }` interface
  and fold it into `CreateThemeOptions` (and `createInlineTheme`'s option union),
  alongside the existing `FontOptions`/`FontSizeOptions`/… siblings.
- Spread `textStyleVars(options.textStyles)` in both var payloads
  ([createTheme.ts:189](src/theme/createTheme.ts:189) and
  [createTheme.ts:213](src/theme/createTheme.ts:213)), next to `fontSizeVars` etc.

### 3. `src/internal/components/InternalText/index.tsx`

- Accept optional `textStyle?: TextStyleName`.
- When set, seed the five `--text…` instance vars from the bundle **before** the
  existing per-prop var assignments, so an explicit `size`/`weight`/`font`/… still
  wins (they're spread after — same ordering trick as today).
- Reuse the shared `warnIfVarUnset` dev guard for an unpublished `textStyle`.

### 4. `src/components/Text/index.tsx` & `src/components/Heading/index.tsx`

- Add `textStyle?: TextStyleName` to props.
- **Suppress the built-in defaults when `textStyle` is present** so the bundle can
  own them. Both components still apply defaults unconditionally today: Text
  defaults `size = "md"` ([Text:94](src/components/Text/index.tsx:94)); Heading
  defaults `size`/`weight` from the level
  ([Heading:71](src/components/Heading/index.tsx:71)). Gate each on `textStyle` —
  e.g. Text: `size = props.size ?? (props.textStyle ? undefined : "md")`; Heading:
  the same for `size` (vs `HEADING_LEVEL_SIZE`) and `weight` (vs
  `HEADING_LEVEL_WEIGHT`) — so the bundle governs unless an explicit prop overrides.

### 5. `src/theme/index.ts` / package `index.ts`

- Export `TextStyleRegistry`, `TextStyleName`, `TextStyleDef`, `textStyleVars`,
  alongside the existing `FontSize*`/`LineHeight*`/`FontWeight*` exports.

## Open questions

1. **Is the bundle still worth it?** With `size`/`weight`/`lineHeight`/`font`/
   `letterSpacing` all open per-property, `textStyle` buys only "one name for a
   combination." Weigh that ergonomic against a second, overlapping way to configure
   the same five vars (and the precedence surface area it adds). A consumer can
   already get 80% of the way by registering a paired `size` (`{ fontSize,
lineHeight }`) — a "custom size" bundles font-size + leading today.
2. **var-chaining for omitted props** — assigning an instance var to a bundle value
   only for the properties a style defines, and letting the rest fall through to the
   base `fallbackVar`, is the same behavior the per-property props already ship and
   test. Reuse those tests; no new browser-vs-jsdom risk beyond what exists.
3. **Confirm the precedence table** — specifically that a Heading's level-derived
   size/weight should yield to `textStyle` (believed yes; the intuitive reading).

## Tests & stories

- `InternalText.test.tsx`: `textStyle` sets the instance vars; explicit
  `size`/`weight`/`font`/`lineHeight`/`letterSpacing` override; omitted bundle props
  fall back to the token default; unknown `textStyle` warns once (dev). Mirror the
  existing per-property tests in [fontSizes.test.ts](src/theme/fontSizes.test.ts),
  [lineHeights.test.ts](src/theme/lineHeights.test.ts), etc.
- `Text.textStyle.stories.tsx`: a themed root with
  `textStyles={{ title: {...}, lyric: {...} }}`, alongside the existing `Custom*` /
  `LineHeights` stories added in #95.

## App follow-up (separate, after Baritone lands & `sync-baritone.sh`)

Consuming app (e.g. RhymeLab). Note the per-property vocabularies are available
**now**, so an app can already replace scattered inline `lineHeight` styles with the
`lineHeight`/`size`/… props without waiting for `textStyle`:

- `src/baritone.d.ts`: augment `TextStyleRegistry` with `title`, `lyric`, `badge`
  (and/or the individual `FontSizeRegistry`/`LineHeightRegistry`/… if using the
  per-property props directly).
- `__root.tsx` (bundle form):
  ```ts
  textStyles={{
    title: { lineHeight: "title", font: "serif" },
    lyric: { size: "xl", lineHeight: "loose", font: "serif" },
    badge: { size: "sm", lineHeight: "none" },
  }}
  ```
- Replace the scattered inline `lineHeight` styles with `textStyle="…"` (or the
  individual `lineHeight="…"` / `size="…"` props).

## Context / reference

- `font` was the original model for the open-vocabulary seam; #86–#95 generalized it
  to `size`, `weight`, `lineHeight`, and `letterSpacing`. Each has a sibling file:
  [fonts.ts](src/theme/fonts.ts), [fontSizes.ts](src/theme/fontSizes.ts),
  [fontWeights.ts](src/theme/fontWeights.ts), [lineHeights.ts](src/theme/lineHeights.ts),
  [letterSpacings.ts](src/theme/letterSpacings.ts).
- The rationale for why these vocabularies can't be compiled recipe variants (they're
  consumer-defined and only exist at the app's build/runtime) is documented at the
  head of each of those files and in the closing note of
  [text.css.ts:154](src/styles/recipes/text.css.ts:154).
- Typography recipes live in [text.css.ts](src/styles/recipes/text.css.ts):
  `textIntentRecipe` (colour), `textSizeRecipe` (the shared base + built-in `size`
  variant), `typographyWeight` (built-in `weight` class), `typographyDecoration`
  (italic).
- `Text`/`Heading` both delegate to `InternalText`, so the prop lands in one place
  and both get it.
  </content>
  </invoke>
