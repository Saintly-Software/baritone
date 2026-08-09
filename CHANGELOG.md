# @saintly-software/baritone

## 1.0.0-alpha.4

### Minor Changes

- 536aded: Add `Lightbox` — a surface that opens an image at full size in a dialog centred
  over a dimmed page.

  - Opens from a **`<Lightbox.Trigger>`** (a `Button`, so all of Button's
    intents / saliencies / sizes / icons are available) passed via `trigger`.
  - Dismissed by clicking the backdrop, pressing Escape, or a built-in close
    button pinned to the image's corner (`closeLabel` names it, default
    `"Close"`); clicking the image itself does not close it.
  - Built on base-ui's `Dialog`, so it is modal (an always-rendered backdrop) with
    managed focus and ARIA. Its accessible name comes from `alt` (falling back to
    `"Image"`).
  - Supports controlled `open` / `defaultOpen` / `onOpenChange`, the shared
    `useOverlayHandle(Lightbox)` imperative handle, and `initialFocus` /
    `finalFocus`. `className` / `ref` target the `<img>`; optional `children`
    render below the image as a caption.

- 1ba7959: Add a chip-styled `appearance="chip"` arm to `Link`.

  `LinkProps` gains a third `appearance`: the default inline styled anchor
  (`"text"`), a link that looks like a `Button` (`"button"`), and now a link that
  looks like a `Chip` (`"chip"`). A `<Link appearance="chip">` reuses `Chip`'s
  recipe wholesale (through the shared `InternalChip` / `chipBoxClassName`), so
  there's **no style duplication** — it's visually identical to a `Chip` with the
  same `intent` / `saliency` / `size` / `shape` / `width`, plus decorative
  `icon` / `trailIcon` — but the rendered element is a real navigable anchor.

  This is how you make a _whole chip navigate_ — e.g. tag chips that link to a
  filtered index page — without putting an `href` on `Chip`. Navigation stays on
  `Link` (where it belongs), so `Chip` keeps its "tag, not a control" role and
  avoids the invalid nested-interactive-element problem an `<a>` wrapping its
  clickable adornments / remove button would create.

  ```tsx
  // Plain / string URL — routed by LinkProvider for internal hrefs:
  <Link appearance="chip" intent="primary" saliency="low" size="sm" href="/notes?tags=music">
    Music
  </Link>

  // Typed router navigation — via the render escape hatch (TanStack Router shown):
  <Link
    appearance="chip"
    intent="primary"
    saliency="low"
    size="sm"
    render={<RouterLink to="/notes" search={{ tags: ["music"] }} />}
  >
    Music
  </Link>
  ```

  - **Element is a link, not a button:** supply the destination the usual way —
    `href` for an external `<a>`, or `render` with your framework's link (which also
    carries _typed_ router descriptors a plain `href` can't express) for
    client-side navigation. `InternalGenericButtonAnchor` renders the chip chrome
    onto that anchor.
  - **Router integration matches the other appearances:** wrap the app in a
    `LinkProvider` and every internal chip-link routes through your router; external
    / new-tab / `download` links stay a plain `<a>`, and a per-link `render` always
    wins.
  - **One anchor by design:** an optional decorative `icon` / `trailIcon` on each
    side of the label and nothing else — no interactive adornments, remove button,
    or `onClick` / `popover` label semantics (those stay on `Chip`).
  - **Disabled degrades honestly:** a disabled chip-link has no valid HTML form, so
    it collapses to an inert element (out of the a11y tree as a link) while keeping
    the chip styling, and can still explain itself via `disabledReason`.
  - **Accessible name** is always the visible label — `aria-label` is `never`, as
    on `Chip` / `Button`.

  Internally, the chip's root-box look is now factored into a single shared
  `chipBoxClassName`; both `Chip` and the new chip-link render from it, so the two
  can't drift. `Chip` is otherwise unchanged.

- 7656443: Add a `List` component (with a `List.Item` part) — a semantic list (`<ul>`, or
  `<ol>` when `ordered`) whose items are laid out with either flexbox or CSS grid.

  - **`layout`:** `flex` (default) or `grid`, the discriminant of the prop union —
    the layout-specific knobs only type-check for the matching layout. `List`
    delegates to `Flex` / `Grid` via the base-ui `render` pattern, so the layout
    props behave exactly as they do on those primitives.
  - **Flex knobs (`layout="flex"`):** `direction`, `align`, `justify`, `wrap`,
    and `gap`.
  - **Grid knobs (`layout="grid"`):** `columns`, `rows`, `areas`, `justify`, and
    `gap` — place items in named areas with `List.Item`'s `area` (sets
    `grid-area`).
  - **`ordered`:** render an `<ol>` (semantic sequence) rather than a `<ul>`. The
    marker is stripped either way (it doesn't flow through flex/grid tracks), so
    `ordered` only changes the element.
  - **`items` or children:** pass an `items` array (each entry a `List.Item`'s
    props, keyed by `id` falling back to index) or compose `List.Item` children;
    the data array wins when provided.
  - **Real list semantics:** the `<ul>`/`<ol>` margin, padding, and marker are
    reset so the layout drives all spacing, and a `role="list"` is kept explicitly
    (Safari strips it under `list-style: none`); each `List.Item` is an `<li>` with
    an explicit `role="listitem"`. Use `render` to swap the element.

- a366107: Add a plain `Table` component — renders a set of `columns` and `rows` as a
  semantic `<table>` (`<thead>`/`<tbody>`, real `<th scope="col">` and `<td>`) with
  no sorting, filtering, or pagination. Reach for `DataTable` when you need those;
  use `Table` when the data is ready to show as-is.

  - **The columns are the contract:** `Table` infers the union of the columns'
    `key`s and types `rows` against it, so a row that carries a key no column maps
    — or omits one a column needs — is a compile error. The strictness runs in both
    directions and needs no helper: write plain object literals for `columns` and
    `rows`.
  - **Cells:** every row field is a `TableValue` (anything React can render). A
    column's optional `cell(value, row)` renderer wraps its value in any element
    (e.g. a `Link`, a currency-formatted number). When a column needs to _know_ its
    value is a `number` and format it with type safety, that's `DataTable`'s
    typed-accessor job; this plain table trades that for the strict key contract.
  - **Alignment:** set a column's `align` (`start` / `center` / `end`), a real
    style recipe variant.
  - **Naming & keys:** an optional `caption` renders a `<caption>` (which also names
    the table); pass `aria-label` / `aria-labelledby` (forwarded to the `<table>`)
    to name one without a visible caption. `getRowKey` derives stable React keys.
  - **No new dependencies:** ships from the main entry point (unlike `DataTable`,
    which lives on its own subpath to keep the `@tanstack/react-table` peer out of
    the main barrel).

- ce2a070: Make `Text`/`Heading`'s `size` and `weight` props **dynamic and consumer-defined**,
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

  A consumer `size` can carry its own paired leading too, Tailwind-style: a `sizes`
  entry is either a bare `font-size` (`{ hero: "4rem" }`, leading falls back to `md`)
  or a `{ fontSize, lineHeight }` pair (`{ hero: { fontSize: "4rem", lineHeight: "1.05" } }`)
  whose line-height becomes the size's default (still overridden by the `lineHeight`
  prop). The exported `SizeValue` type names the pair form.

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

- b26adf6: Make `Text`/`Heading`'s `letterSpacing` (tracking) prop **dynamic and
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

- b3f2290: Add a `Toast` component and a `BaritoneProvider` that wires it up.

  Toasts are fired imperatively with `useToast()` and rendered by a viewport that
  `BaritoneProvider` mounts for you — there's no toast element to place inline.
  Each toast's UI is a `Notice`, so it inherits the full `intent` / `saliency` /
  `icon` / `title` / `description` / `actions` / dismiss surface.

  - **`BaritoneProvider`** — the client-side application provider (the counterpart
    to the server-renderable, token-only `BaritoneTheme`). Wrap your app in it and
    `useToast()` works anywhere below. Takes `toastTimeout` / `toastLimit` /
    `toastManager`. The viewport portals to `<body>`, so — like every other
    overlay — it's themed via the theme class on `<body>`.
  - **`useToast()`** — returns `add` / `update` / `close` / `promise` / `toasts`.
    `add({ title, description, intent, saliency, icon, actions, timeout, priority,
id, onClose })` shows a toast and returns its id; `promise()` drives a single
    toast through loading → success/error.
  - **Accessibility** — built on base-ui's `Toast`. The viewport owns the live
    region that announces toasts; each toast is a `dialog` / `alertdialog` labelled
    by its title and described by its description. The `Notice` is presentational
    so it never becomes a second live region.
  - Toasts stack bottom-right as a smooth, always-expanded list (newest at the
    bottom), swipe right/down to dismiss, hover to pause the auto-dismiss timers,
    and respect `prefers-reduced-motion`.

- 9c56c9d: Add an opt-in `clearable` prop to `ToggleGroup` for a null (unselected) value.

  By default `ToggleGroup` stays strictly single-select — exactly one segment is
  always selected, and re-pressing the active segment is vetoed. Pass `clearable`
  to allow an empty state:

  - **`value` widens to `T | null`:** pass `null` to render the group with nothing
    selected (e.g. a control that starts empty).
  - **Re-pressing the active segment clears it:** `onChange` widens to
    `(value: T | null, event) => void` and fires with `null` when the current
    selection is toggled off.

  The prop is discriminated: without `clearable`, `value`/`onChange` keep their
  strict `T` types, so existing usage is unchanged. When nothing is selected there
  is no roving tab-stop marker, so Tab lands on the first segment.

- 4abd9d6: Add an optional **`aria-label`** to `ToggleGroupItem`, an escape hatch for
  authoring a segment's accessible name when its `children` would flatten
  misleadingly.

  A `ToggleGroupItem` renders a `<button>` whose accessible name is derived from
  its content, so rich `children` — e.g. a label paired with a trailing count
  `Badge` — would announce as the concatenated text ("Comments" + "3" →
  "Comments 3"). Passing `aria-label` overrides that with an authored name while
  `children` stays purely visual:

  ```tsx
  <ToggleGroupItem value="comments" aria-label="Comments">
    Comments <Badge>3</Badge>
  </ToggleGroupItem>
  ```

  Opt-in and non-breaking — omit it and the segment names itself from `children`
  exactly as before. Because it replaces the whole accessible name, it should
  still contain the visible label text (WCAG 2.5.3 _Label in Name_).

  Internally the name rides the `InternalButton` `htmlAttrs` seam rather than
  `consumerProps`: a text button's `consumerProps.aria-label` is intentionally
  stripped (its name must be the visible label), whereas `htmlAttrs` merges under
  the button's own props — which never set `aria-label` here — so the authored
  name survives.

### Patch Changes

- 8f130e8: `LinkProvider` now leaves a **fragment-only** `href` (`#footnote-1`) a plain
  `<a>` instead of routing it.

  `isInternalHref` classified any href that wasn't scheme-prefixed or
  protocol-relative as internal, so a bare `#hash` was handed to the consumer's
  router `render`. But a same-document jump to an anchor is browser behaviour, not
  a navigation any client router should own — and routers with structured APIs
  mishandle it: TanStack Router, for instance, resolves `to="#foo"` as a relative
  _path_ against the current pathname. Fragment-only links now fall through to a
  plain anchor for both the inline and `appearance="button"` / `"chip"` arms.

  A path that merely _carries_ a fragment (`/a#foo`) is a real navigation and is
  unchanged — it stays internal and still routes through your `render`.

  **Behaviour change.** If you relied on same-page `#…` links being routed through
  your provider (e.g. a custom scroll handler in your `render`), they now render as
  plain anchors. Pass the provider a custom `isInternal` that returns `true` for
  `#`-prefixed hrefs to restore the old classification.

## 1.0.0-alpha.3

### Minor Changes

- 60dfd6f: Add a themeable `letterSpacing` (tracking) prop to `Text` and `Heading`, backed
  by a new `text.letterSpacing` token scale — closing the last typographic gap that
  forced consumers to reach for a custom `style` (e.g. an uppercase eyebrow).

  - **`letterSpacing`** (`tighter` | `tight` | `normal` | `wide` | `wider` |
    `widest`) — like `textAlign` / `whiteSpace` / `overflowWrap` / `textTransform`,
    it's a plain `letter-spacing` passthrough backed by the sprinkles atoms
    (responsive-capable), so it's opt-in and additive — omitting it leaves tracking
    untouched. `widest` (0.1em) is the go-to for small uppercase labels.
  - Adds a **`text.letterSpacing`** token group to the theme contract, with
    `em`-based defaults (Tailwind's tracking scale) so a step tracks the font-size
    across the whole ramp. Override per brand via the new `BrandSeed.letterSpacing`
    (e.g. `letterSpacing: { widest: "0.14em" }`).

## 1.0.0-alpha.2

### Major Changes

- 77c49ee: Give every form control the same change-callback shape: **the plain value comes
  first, the raw event comes last.** Previously the value-first controls dropped
  the event entirely, and `TextInput` did the opposite — it forwarded the native
  event only. Now they agree.

  - `Checkbox`, `Switch`, `RadioGroup`, `CheckboxGroup`, `Select`, `ToggleGroup`
    call `onChange(value, event)`, and `Combobox` calls `onValueChange(value, event)`.
    The second argument is base-ui's raw DOM `Event` (from its `eventDetails.event`)
    — for `Select`, the clear button forwards its click's `nativeEvent`.
  - **`TextInput` is the breaking one.** Its `onChange` no longer forwards the
    native React event by itself — it is now `onChange(value: string, event)`, where
    `event` is the raw `React.ChangeEvent`. Read the text from the **first**
    argument; `event.target.value` still works but the value arg is the point.
  - `FileUpload`'s event is optional: `onChange(value, event?)`. A picker `change`
    or a drag-and-drop passes the raw `React` event (`FileUploadChangeEvent`, newly
    exported); removing a staged file passes no event (`undefined`).

  Migration:

  ```tsx
  // TextInput — before
  <TextInput value={v} onChange={(e) => setV(e.target.value)} />
  // TextInput — after
  <TextInput value={v} onChange={(value) => setV(value)} />
  // (or simply onChange={setV})
  ```

  Callbacks that only use the value — `onChange={setValue}` and friends — need no
  change; the extra argument is additive for them.

- 015b267: Rename `Text`/`Heading`'s `variant` prop to `size` and unify typography on one
  token-driven scale.

  - **Breaking — `variant` → `size`** on `Text` and `Heading` (and `Lockup`'s title
    slot). The `base` value is renamed `md`, which is also the new default.
  - **Breaking — new size scale** `xs sm md lg xl 2xl 3xl 4xl 5xl 6xl 7xl 8xl 9xl`
    (Tailwind-style). `3.5xl` is removed; `5xl`–`9xl` are new. `Text` and `Heading`
    share the full scale — there is no more body/title split.
  - **Breaking — token API:** `text.variant.{body,title}.<size>` is replaced by a
    flat `text.size.<size>` (`{ fontSize, lineHeight }`) plus two increment tokens
    `text.fontStep.{lower,upper}`. Each per-size font-size is `calc()`-derived from
    the `md` anchor + the increments, so the whole ramp re-themes at runtime by
    changing three tokens — or override any single `text.size.<size>` leaf.
    `BrandSeed` gains a `fontScale` option. Defaults match Tailwind for `xs`–`2xl`
    (font-size) and use Tailwind's per-size line-heights.
  - **Breaking — constants/recipe:** removed `BODY_SIZES`/`TITLE_SIZES` and
    `BodySize`/`TitleSize` (use `TEXT_SIZES`/`TextSize`); `HEADING_LEVEL_VARIANT` →
    `HEADING_LEVEL_SIZE`; the `textVariantRecipe` recipe (and `TextVariantVariants`)
    → `textSizeRecipe`/`TextSizeVariants`, and its `family` variant is gone.
  - Weight is now independent of `size`: `Heading` keeps its customary per-level
    weight (via the new `HEADING_LEVEL_WEIGHT`); large `Text` is no longer
    auto-bolded — use the `weight` prop.
  - **Breaking — `align`/`wrap`/`wordBreak` → layout atoms.** These `Text`/`Heading`
    props are replaced by the `textAlign` / `whiteSpace` / `overflowWrap` atoms
    (e.g. `wrap="nowrap"` → `whiteSpace="nowrap"`, `wrap="wrap"` →
    `whiteSpace="normal"`, `wordBreak="break-word"` → `overflowWrap="break-word"`).
    `mono` / `italic` / `weight` remain, now backed by the split `typographyFont` /
    `typographyDecoration` / `typographyWeight` recipes.

  `Text` and `Heading` now delegate to a shared internal `InternalText` primitive.

### Minor Changes

- fd73b93: Stop `Chip` button adornments from leaking their click to a clickable ancestor,
  with a `forcePropagation` opt-out.

  - **Button adornments now stop propagation by default** — a `Chip.Adornment`
    rendered as a `<button>` (`onClick`), plus the built-in `handleRemove` "×" and
    `contentToCopy` buttons, is its own hit target, so its click no longer bubbles
    past the chip. Wrapping a `Chip` / `ChipList` in a clickable row and removing a
    chip (or clicking any button adornment) acts on that control alone and no longer
    also fires the row's handler. This realises the existing "the label and any
    adornments are independent hit targets" design intent.
  - **`Chip.Adornment` gains `forcePropagation`** (button adornments only) — set it
    to let the click bubble up to an ancestor as before. Link adornments (`href`)
    keep bubbling and don't take the prop; a disabled/inert adornment still swallows
    its click regardless.

- 9379c08: Add a `LinkProvider` to wire `Link` to your app's router once, for the whole tree.

  Previously every router-driven `Link` needed its own `render`
  (`render={<NextLink href="…" />}`). `LinkProvider` hoists that to the app root:
  wrap your tree once and every _internal_ `Link` — inline or `appearance="button"` —
  renders through your router's link, keeping the system's styling while the router
  owns client-side navigation.

  ```tsx
  import Link from "next/link";

  <LinkProvider render={(props) => <Link {...props} />}>
    <App />
  </LinkProvider>;

  // …no per-link render needed:
  <Link href="/dashboard">Dashboard</Link>;
  ```

  - **Router-agnostic.** The provider's `render` receives the resolved link props
    (`href`, `className`, `children`, …); map `href` onto whatever prop your router
    uses — `href` for Next.js, `to` for React Router / TanStack Router
    (`render={({ href, ...props }) => <RouterLink to={href} {...props} />}`).
  - **Safe to wrap everything.** Only _internal_ links route; external URLs
    (`https:`, `mailto:`, `tel:`, …), new-tab (`target`), and `download` links stay
    plain anchors. The internal test is `isInternalHref` (exported) — purely
    syntactic, so it's SSR-safe — overridable via the provider's `isInternal` prop.
  - **Escape hatch preserved.** A per-link `render` still wins over the provider,
    and a `Link` outside any provider behaves exactly as before.
  - Exposes `useLinkRender` for building your own router-aware link-like components
    (the same hook `Link` uses).

- 9bb98f1: Add `SegmentedBar` — one bar divided into the parts that make up a whole, with a
  legend naming each part (time by project, spend by category, storage by type).
  Where `Meter` shows one value against a range, this shows one whole split up.

  - `segments` take a `label` and a raw `value`; the shares are computed, so callers
    pass counts rather than percentages. `total` sets the denominator explicitly —
    pass a number above their sum (a quota, a target) to leave the difference as
    unfilled track. Slices are sized by `flex-grow`, so they divide the track
    exactly, with a minimum width that keeps a sliver visible and a 2px gap
    separating neighbours instead of a stroke around each one.
  - Each segment is coloured by `intent` × `saliency`, defaulting to a fixed
    sequence of intents so a bar is legible with nothing but labels and values.
    Assignment is by position — give segments an explicit colour when the set can
    change, or a filtered-out segment repaints the ones after it. A per-segment
    `color` is the escape hatch for fills that are _data_ (a user-chosen category
    colour), mutually exclusive with `intent`/`saliency` as `Badge`'s is.
  - The legend is a real list, one item per segment carrying its label, share, and
    value; the track duplicates it, so the track is `aria-hidden` and colour is
    never the only thing carrying identity. `showLegend={false}` therefore hides it
    _visually only_ — it stays in the accessibility tree, since it's the only thing
    announcing the numbers. `showPercent` / `showValue` trim its columns.
  - A visible `label` (which names the legend list) and an optional `showTotal`
    read-out sit above the track, mirroring `Meter`'s header; `size` sets the track
    thickness, `format` / `locale` format the values, and `slotProps` re-tune each
    `Text` slot.

  Also exports `SegmentedBarProps`, `SegmentedBarSegment`, `SegmentedBarSegmentBase`,
  `SegmentedBarSegmentIntentColour`, `SegmentedBarSegmentCustomColour`, and
  `SegmentedBarSlotProps`.

- b3afea8: Add a dynamic, consumer-defined `font` prop to `Text` and `Heading`.

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

- a3a159c: Add a `textTransform` prop to `Text` and `Heading` (`none` | `uppercase` |
  `lowercase` | `capitalize`). Like `textAlign`, `whiteSpace`, and `overflowWrap`,
  it's a plain `text-transform` passthrough backed by the sprinkles atoms, so it's
  opt-in and additive — omitting it leaves the rendered casing untouched.
- 3591373: `useRender` now delegates to base-ui's own `useRender` instead of a parallel
  hand-rolled implementation, inheriting base-ui's ref-merging, event-handler
  chaining, and `preventBaseUIHandler` support.

  **Breaking:** `defaultElement` is now typed as — and restricted to — an intrinsic
  tag name (`keyof JSX.IntrinsicElements`) rather than any `ElementType`. The old
  implementation rendered a component-valued `defaultElement` via `createElement`;
  base-ui renders only string tags, so a component default is no longer accepted at
  either the type level or runtime. To render _as_ a component, use the `render`
  prop (`render={<Component />}`) — always its intended role.

  One more note for direct `useRender` consumers: an element that defaults to
  `<button>` now receives `type="button"` unless you pass a `type`, matching
  base-ui (keeps an in-form button from submitting).

## 1.0.0-alpha.1

### Major Changes

- 85b549e: Redesign the `Card` header API and make its padding responsive.

  **Breaking changes:**

  - **`padding` prop removed** (and the `CardPadding` type): a card's internal
    padding is no longer configurable. It's now **responsive** — the `4` spacing
    token up to the `md` breakpoint (768px) and `6` beyond — driven through the same
    `--surfacePadding` the surface reads, so `Card.Bleed` / `Card.Divider` stay in
    sync at every width.

  **New — string-`header` shorthand (replaces `Card.Layout`):**

  - **`header` as a string:** renders a styled header title (a `Heading`) instead
    of raw text. An interactive (`onClick` / `href`) or `collapsible` card still
    turns that title into its overlay control.
  - **`subheader`:** a tight caption shown beneath a string `header`, in the header
    block.
  - **`description`:** a supporting body paragraph, rendered beneath the header and
    above any `children` (works with any header).
  - **`action`:** a trailing control (e.g. a `<Button>`) at the end of a string
    `header`'s row.
  - **`level`:** document-outline level for a string `header`'s title (default `3`).
  - **`children` is optional**, so `header` + `description` / `action` alone make a
    complete card.

  **Deprecated:**

  - **`Card.Layout`** is now `@deprecated` (still functional). Prefer the
    string-`header` shorthand, which covers the same title / subtitle / action
    shapes without a wrapping element and also wires up an interactive card's
    overlay link.

- d4cd7d9: Expand `Chip` with adornments, a clickable label, shapes, and a loading state.

  **Breaking change:**

  - **`children` is now text-only** — typed as `string | string[]` (was
    `React.ReactNode`). A Chip wraps its label in its own truncating element, so
    icons and actions move out of the children and into adornments (below).
    Anything that previously passed JSX children (an inline `<Icon>`, an
    interpolated `{count} items`, a nested element) must move that content to
    `leadAdornments` / `trailAdornments` or render plain text.

  **New:**

  - **`Chip.Adornment` compound part:** small icons slotted before/after the label
    via `leadAdornments` / `trailAdornments`. Each is one of three kinds — a regular
    (decorative or `label`-named) icon, a clickable `<button>` (`onClick` + required
    `label`), or a link `<a>` (`href` + required `label`, with the base-ui `render`
    prop for router links). Adornments inherit the chip's colour through
    `--iconColor`, or take their own `intent` to tint just that adornment.
  - **`handleRemove`:** a shortcut for the common removable chip — appends a
    built-in clickable remove "×" as the _last_ trailing adornment, after any
    `trailAdornments` you supply.
  - **Clickable label:** pass `onClick` to render the text label as a real
    `<button>` (keyboard-focusable, Enter/Space-activated). The label and any
    adornments are independent hit targets.
  - **`shape`:** `square` (default — the shared component radius) or `pill` (fully
    rounded ends, a Bootstrap-style badge).
  - **`loading`:** replaces the chip's entire content — both adornment lists and the
    label — with a centred spinner and marks the chip `aria-busy` + inert. The chip
    keeps its height; its width collapses to the spinner.
  - **Disabled propagates to clickable adornments:** a disabled chip drags its
    clickable adornments (and the `handleRemove` button) along — they go inert but
    stay keyboard-focusable (`aria-disabled`, never the native attribute — see
    AGENTS.md).

  `FileList` now renders its file-type icon and remove button as `Chip.Adornment`s
  internally; its own API is unchanged.

- 258d2ab: Add the `Field` primitive and compose every form control on it, so label /
  help / error layout and ARIA wiring live in one place instead of being
  re-derived per component.

  `Field` pairs a label and help / error text with an arbitrary control:

  ```tsx
  <Field label="Email" helpText="We'll never share it.">
    <Field.Control render={<input />} />
  </Field>
  ```

  - **Naming is now mutually exclusive.** `label`, `aria-label`, and
    `aria-labelledby` are a union (`FieldLabellingProps`): passing more than one is
    a compile error, and `assertExclusiveNames` **throws** in dev/test for the JS
    callers the types can't reach (dev-gated, so a mislabelled control never becomes
    a white screen in production). There is no precedence order to remember any
    more — previously `label` silently beat `aria-label` on some controls and
    `aria-labelledby` silently beat `label` on others.
  - **One message slot.** `helpText` renders a `HelpText`, wired to the control's
    `aria-describedby` and combined with any you set yourself. `state="invalid"`
    reddens _that_ line (with `HelpText`'s warning glyph) rather than revealing a
    second one — so there's one line to read and no question about which of two
    messages wins.
  - **`fieldControlAttrs(props, labelId?)`** returns every naming + description
    attribute a control's focusable element needs, in one spread — and only the keys
    that are actually set, which is what keeps base-ui's `mergeProps` from clobbering
    the field context with an explicit `undefined`.
  - **`labelPosition`** (`top` — default — / `start` / `end`) inlines the label,
    reusing the existing `LABEL_POSITIONS` vocabulary. `start`/`end` are
    inline-logical and keep the help text aligned under the _control_.
  - **`fit`** (`fill` — default — / `content`) claims the line or shrink-wraps.
  - **`required`** marks the label with an asterisk. The marker is decorative and
    sits _beside_ the `<label>`, never inside it, so the control's accessible name
    (and `getByLabelText`) stay exactly the label's text. The announced half lives
    on the control, which every form control here sets too.
  - **`info`** hangs an `InfoButton` beside the label (moved off `TextInput` /
    `FileUpload`, which duplicated it).
  - **`slotProps`** re-tunes the `label` / `helpText` / `info` slots.
  - Controls base-ui's field context can't reach (a bare `<div role="group">`) take
    their wiring from the render-prop form of `children`:
    `{({ nameAttrs, describedBy }) => …}`.

  **Fixes**

  - **`CheckboxGroup`'s help text was wired to nothing.** Its group is a plain
    `<div role="group">`, which base-ui's field context doesn't reach, so
    `aria-describedby` was never set and the help / error text was rendered but
    never announced. It is now wired (and covered by tests).
  - **`Select`, `ToggleGroup`, and `FileUpload` ignored a disabled `Fieldset`.**
    They didn't read `useIsFieldDisabled()`, contrary to what `Fieldset`'s own docs
    claimed. All three now inherit it.

  **Breaking**

  - `description` → **`helpText`** on `TextInput`, `Select`, `Combobox`,
    `RadioGroup`, `CheckboxGroup`, `ToggleGroup`, and `Switch` (`Checkbox` and
    `FileUpload` already used `helpText`). `Card`, `Notice`, and `Meter` keep
    `description` — they aren't form controls.
  - `slotProps.description` → **`slotProps.helpText`** (`TextInput`);
    `slotProps.help` → **`slotProps.helpText`** (`FileUpload`).
  - **`errorMessage` is gone** from every control. `state="invalid"` now reddens the
    single `helpText` line instead. Migrate by swapping the copy yourself:
    `helpText={error ?? "We'll never share it."}`.
  - Passing more than one of `label` / `aria-label` / `aria-labelledby` no longer
    compiles. Drop the redundant one — it was already being ignored.
  - `Switch`'s and `FileUpload`'s `invalid?: boolean` → **`state?: FormState`**,
    matching `Checkbox`. `invalid` becomes `state="invalid"`. `FileUpload`'s
    dropzone now renders all four states (its recipe is generated from
    `FORM_STATES`, like `formControlRecipe`, so it can't fall behind again), and
    gained the `errorMessage` the other controls have.
  - Re-typing a control's props needs the new **`DistributiveOmit`** /
    `DistributivePartial` helpers instead of the built-ins. `Omit`/`Partial` over a
    union collapse it into one object carrying every arm's keys, which breaks the
    mutually-exclusive labelling arms.

  **Visual**

  - The label→control and control→help gaps are now a consistent 8px everywhere.
    `TextInput`, `Select`, `Combobox`, `Checkbox`, and `Switch` previously used 4px.
  - An invalid field shows one negative line, not a neutral help line plus a
    negative error line.
  - A `required` field now shows an asterisk after its label. `RadioGroup` and
    `CheckboxGroup` gained a `required` prop (they had none).
  - `errorMessage` now renders through `HelpText`, so it picks up that component's
    automatic warning glyph.
  - A disabled field dims its label and help text (previously only `Checkbox` /
    `Switch` dimmed their row labels).

  `Field` deliberately has no `id` prop: an `id` on base-ui's `Field.Root` doesn't
  reach the control (base-ui generates one regardless), so it would be a lie. Put
  `id` on the control, where it already works.

- 8f10d21: Overlays no longer carry a `z-index`. Base UI portals `Tooltip`, `Popover`,
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

- 85b549e: Add an `as` prop to `Text` and change its default element.

  - **`as`:** a shorthand to pick a plain element tag — `div`, `p`, `label`, or
    `span`. It's typed mutually exclusive with `render` (the full base-ui escape
    hatch), so passing both is a compile error.
  - **Breaking — default element:** `Text` now renders a `<div>` by default (was a
    `<span>`), so bare `<Text>` is block-level. Use `as="span"` where you need
    inline text.

  Colour behaviour is unchanged: `Text` still inherits the ambient `--textColor`
  from a surrounding surface/component and falls back to neutral/mid when
  standalone.

### Minor Changes

- 1e978fd: Add an accessible `Tooltip` component. Unlike `InaccessibleTooltip`, its trigger
  is always a real `<Tooltip.Trigger>` button, so the hint is reachable by hover,
  keyboard focus, **and** touch.

  - Built on base-ui's `Tooltip`, sharing the exact surface styling of the
    system's internal hints. It opens on hover/focus (never click) and respects
    `prefers-reduced-motion`.
  - `trigger` takes a `<Tooltip.Trigger>` (renders a `Button`, with all of Button's
    intents / saliencies / sizes / icons, plus `delay` / `closeDelay`).
  - `content` is a `string` or `string[]` (rendered one line per entry).
  - Controllable via `open` / `defaultOpen` / `onOpenChange`; `disabled` prevents
    it from ever opening. `side` / `align` / `sideOffset` position it.
  - `aria-describedby` wiring (the tooltip describes its trigger) comes for free
    from base-ui.

  Content must stay supplemental — anything a user actually needs to read belongs
  in a `Popover`.

- d4cd7d9: Add `icon` and `chip` props to `Accordion.ItemHeader`, mirroring `Card.Header`.

  - **`icon`** — a leading glyph (typically an `<Icon>`) before the title/subtitle
    stack.
  - **`chip`** — a trailing element (typically a status `<Chip>`) after the title,
    sitting just inside the disclosure chevron.

  Both render inside the item's trigger `<button>`, so keep them decorative — the
  title remains the trigger's accessible name. Headers with neither prop are
  unchanged.

- 9c15efe: Add `color` to `Badge` — an escape hatch that paints the badge any CSS colour,
  replacing `intent` × `saliency`.

  For a badge whose fill is _data_ rather than a design decision: a per-tag
  colour, a customer-chosen label colour, a language/category swatch. The palette
  can't enumerate those, because they aren't the system's to choose.

  ```tsx
  <Badge text="NEW" color="#7c3aed" />
  <Badge count={8} color="var(--tag-colour)" />
  ```

  Takes anything CSS `color` does — a hex/rgb/oklch value, a custom property,
  `currentColor` — and works with every content kind (`icon` / `count` / `text` /
  blank) and both shapes.

  **The foreground is derived, not asked for.** You supply the fill; the badge
  reads its oklch lightness and snaps the text/icon to black or white, whichever
  survives on it. A caller passing a brand colour shouldn't also have to work out
  the readable pairing.

  **Mutually exclusive with `intent`/`saliency`** (a type error, not a silent
  override): the hatch replaces the token-driven scheme outright, so accepting
  both would leave one doing nothing.

  **Prefer `intent`/`saliency`.** Everything the palette can express should go
  through it — an `intent` badge re-themes with the rest of the system, a
  `color` badge is frozen at whatever you pass, and nothing checks that fill
  against the surface behind it.

  `BadgeProps` is now the content-kind union intersected with a colour union
  (`BadgeColourProps`). Both axes are orthogonal to the content, so they
  intersect the four kinds rather than multiplying them into sixteen arms.
  Existing `intent`/`saliency` usage is unaffected.

- 0ad1697: Add a `Badge` component — a small "component" element type indicator sharing the
  `intent` / `saliency` / `size` colour scheme with `Chip`/`Button`.

  Its content is one of four mutually-exclusive shapes:

  - **`icon`** — an icon (typically an `<Icon>`, which inherits the badge colour).
  - **`count`** — a number. Pair with **`max`** to cap it: when `count` exceeds
    `max` the badge renders `{max}+` (e.g. `count={100} max={99}` → `99+`).
  - **`text`** — a short string (e.g. `NEW`).
  - **none** — a bare dot indicator.

  A single glyph stays circular; wider content (a multi-digit count, short word)
  grows into a pill.

- 894892a: Give `Badge` a `shape` axis (`round` — default — or `square`) that is orthogonal
  to its content kind, so every kind can be squared: `4` content kinds × `2` shapes.

  - **`round`** keeps the fully-rounded pill/circle silhouette.
  - **`square`** swaps in softly-rounded corners.

  The content-less kind is renamed from **dot** to **blank** (a square content-less
  badge isn't a dot): a round blank still renders as a small dot, a square blank as
  a small rounded square. The exported `BadgeDotProps` type is accordingly renamed
  to `BadgeBlankProps`, and a new `BadgeShape` type is exported.

- a16a0f0: Add a `Box` component — a plain element primitive so spacing doesn't have to
  reach for `atoms` directly. It's the layout-neutral sibling of `Flex`: no
  `display: flex`, just a box you can pad, margin, and style.

  Renders a `<div>` by default and maps friendly props onto the spacing tokens:

  - **Spacing shorthands:** `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` (margin,
    supports `auto`) and `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl` (padding),
    wired straight to the spacing scale (each responsive-capable).
  - **`as`:** render as a different tag — `div` (default), `span`, `section`, or
    `article`.
  - `className`, `ref`, `children`, and the rest of `HTMLAttributes` flow through.

- 8e7184d: Add a `ButtonGroup` component (with `ButtonGroup.Item`).

  A visually-joined cluster of buttons that share sizing and, by default,
  intent/saliency — a row of real `<button>`s rendered through the same
  `InternalButton` as `Button`, so every member matches a standalone `Button`
  with the same props but with its inner corners squared off.

  - **Joined surface:** the two ends keep the resting surface radius while the
    inner corners collapse to `0` (via logical corner properties, so it's
    RTL-correct), and abutting borders overlap into a single hairline seam
    (hover/focus lifts the active member's border and outline above its
    neighbours).
  - **`items` API:** members are passed as `ButtonGroup.Item` elements — a
    config-only element the group reads props off of — in array order, which is
    also the DOM/keyboard tab order (ordinary tab stops, no roving tab stop).
  - **Group-owned sizing:** `ButtonGroup.Item` is the `Button` API **minus
    `size`**; the group owns `size` so all members match. Group-level `intent` /
    `saliency` are defaults each member may override.
  - **Independent actions:** unlike `ToggleGroup`, each member keeps its own
    `onClick`, icons, `loading`, and focusable-`aria-disabled` state (with the
    `disabledReason` tooltip).

- 70b29fb: Add `width` to `Button` and `Link` — the same `fill` / `fit` / `inherit`
  shorthand `Box` and `Flex` already take.

  A button is `inline-flex` and hugs its label, so the full-width form submit and
  the mobile CTA — both routine — had to reach past the prop API for a
  `className` or a stretching wrapper. `WidthShorthand` already existed; it just
  wasn't wired in here.

  ```tsx
  <Button width="fill">Save changes</Button>
  <Link appearance="button" href="/signup" width="fill">Get started</Link>
  ```

  The label stays centred (the recipe's own `justify-content`).

  **Where it isn't offered**, because the box couldn't honour it:

  - **Icon-only `Button`** (`icon` + `aria-label`) — the square treatment pins a
    1:1 `aspect-ratio`, so `fill` wouldn't widen the button, it would inflate it
    into a container-sized square.
  - **`appearance="text"`** — the underline spans the element's full width, so a
    filled text button drags its underline across the whole row with the label
    stranded at one end.

  Both reject `width` at the type level rather than rendering something broken.

- 1dfb21e: Add a hyperlink-style `appearance="text"` to `Button`.

  `ButtonProps` is now discriminated on `appearance`: the default filled control
  (`"solid"`) or the new text look (`"text"`). A `<Button appearance="text">`
  drops the component chrome (background, border, control height, padding) and
  renders as underlined text coloured by the `text.color` tokens — reading like a
  `Link` but staying a real `<button>` driven by `intent`/`saliency`.

  - **Typography via `variant`:** the text appearance takes a body typography size
    (`xs`–`xl`) via `variant` in place of `size`, which is typed away.
  - **No spinner:** `loading` is unsupported (typed `never`) — there's no chrome to
    overlay a spinner on — and is ignored even if forced through at runtime.
  - **No icon-only mode:** an unlabelled underlined glyph reads as neither link nor
    button, so `icon` + `aria-label` stay unavailable (`aria-label` is already
    `never`).
  - **Unchanged behaviour:** `disabled` (via `aria-disabled`, keyboard-reachable),
    `disabledReason` tooltips, `onClick`, and `startIcon`/`endIcon` all work as they
    do on the default appearance. Hover/active derive from the resolved colour with
    the same oklch relative-colour math; disabled dims to the shared control opacity
    since `text.color` has no disabled shade.

- d6e8452: Add a `CheckboxGroup` component.

  A "form control" element type for picking _any number_ of values from a small
  set — the multi-select sibling of `RadioGroup`: same `Field`-wrapped label /
  description / error layout, same type-safe compound API, but the selection is
  an array and each option is an independent checkbox (no roving focus — every
  box is its own tab stop).

  - **Type-safe compound component:** the group is generic over the value type
    `T` (inferred from `value`), and hands its render-prop a `CheckboxGroupItem`
    bound to that `T` — so an option outside the union/enum is a compile error.
  - **Per-row behaviour:** each row is the same box + label as the standalone
    `Checkbox` (base-ui's `Checkbox.Root` + `InternalCheckbox`); the group itself
    is a labelled `role="group"`, so the whole control reads as one named set.
  - **Validation:** `state` accepts `neutral` / `invalid` / `valid`; `invalid`
    shows `errorMessage` through `Field.Error` and is announced.
  - **Layout:** `orientation` lays options out in a column (default) or a row.

- d4cd7d9: Make `Card.Header` semantic for sectioning cards, and add `Card.Layout`.

  - **`Card.Header` renders a real `<header>`** when the card root is sectioning
    content (`as="article"` / `as="section"`) or `main`, scoping the header to that
    section. A plain `div` card (and a collapsible card, whose root isn't
    sectioning) keeps a `<div>` header — a `<header>` there would instead be exposed
    as the page's `banner` landmark.
  - **`Card.Layout`** — a split content row for the common "text + a trailing
    action" shapes: `title` + `subtitle` + `action`, a bare `title` + `action`, or
    (omit the `title`) `description` + `action`. It's the standalone, body-content
    sibling of a rich `Card.Row`: the same leading-text / trailing-action split, but
    a plain `<div>` rather than a `<dt>`/`<dd>` inside a `<dl>`. So a whole
    `<Card as="article">` (e.g. a teaser in a list of posts) can simply _be_ one
    row — the `title` is the article's heading and the action its content — without
    borrowing the `header` slot for content that isn't a header.

- 85b549e: Add a `CardList` component — renders a set of `Card`s as a semantic vertical
  list.

  - **Real list semantics:** a `<ul>` (`role="list"`) with each child card wrapped
    in its own `<li>` (`role="listitem"` — set explicitly so Safari keeps the list
    role under `list-style: none`), so it's announced as a list with one item per
    card.
  - **`gap`:** spacing between cards, from the spacing scale. Default `4`.
  - **Required accessible name:** pass `aria-label` **or** `aria-labelledby` — a
    union type makes providing neither a compile error.

- 9c7a92a: Add router-aware link support to a linkable `Card`.

  A linkable `Card` (`href`) now also accepts `download` — a plain anchor attribute
  forwarded to the card's overlay `<a>`: `download` (boolean) saves the target using
  the server/URL filename, or a string sets a suggested filename. It's omitted for
  `false` / unset, so an ordinary linkable card is unaffected.

  - **Router integration stays via `render`.** The Card remains router-agnostic — no
    framework navigation props (`to` / `params` / `search` / `preload`) leak into the
    DS type. To wire it to your app's router, keep `href` (the resolved URL — it
    names the link and is the no-JS fallback) and pass your router's link component
    through `render`, which owns navigation while keeping the stretched-overlay
    styling. `render` already routed to the overlay link; this documents the recipe
    (JSDoc + an `AsRouterLink` story).
  - **`download`** is threaded through the header's link control to the overlay `<a>`
    and only applies to the linkable mode (the clickable / static / collapsible modes
    type it as `never`).

- 2f4b109: Add a `selected` state to `Card`.

  A new optional `selected` boolean marks a card as chosen — for a card holding a
  checked `Checkbox`, or one picked in a multi-select grid. It accents the surface
  edge (the hairline border is recoloured to the primary focus colour and an inset
  ring thickens it to a deliberate ~2px outline), with a `forced-colors` fallback
  to the system `Highlight`.

  The accessibility follows the semantics of each card mode, so the state is never
  conveyed by colour alone:

  - **Static card** (the default): `selected` is _visual_. A plain container can't
    validly carry `aria-selected`/`aria-pressed`, so the real selected control
    inside — e.g. the checked `Checkbox` — is what conveys state to assistive tech;
    the accent reinforces it for sighted users.
  - **Clickable card** (`onClick`): the overlay title button becomes a toggle,
    gaining `aria-pressed={selected}` — so the whole surface is an announced
    selection target. A plain clickable card (no `selected`) stays an ordinary
    button.
  - **Linkable card** (`href`): the overlay title link marks itself the current
    choice with `aria-current` when selected (and nothing when not).

- a4b30a5: `Checkbox` gains a tri-state, inline help, and label-less naming — bringing it in
  line with `TextInput` / `RadioGroup` / `CheckboxGroup`.

  - **`indeterminate`** — shows the "mixed" dash and reports `aria-checked="mixed"`
    (the usual "select all" parent for a partly-selected set). Toggling still fires
    `onChange` with a resolved boolean.
  - **`helpText` / `errorMessage`** — an inline line beneath the box. `helpText`
    wires the control's `aria-describedby`; `errorMessage` shows (and is announced)
    only when `state` is `invalid`.
  - **`aria-label` / `aria-labelledby`** — name a label-less box (a table-row
    selector, say). A visible `label` still wins and names the box itself.

  **Breaking:** the boolean `invalid` prop is replaced by `state?: FormState`
  (`neutral` | `warning` | `invalid` | `valid`), matching the other form controls.
  Replace `invalid` with `state="invalid"`.

  `value` stays a single `boolean` (the checked state). Rain separates a boolean
  `checked` from a string form `value`; we deliberately did **not** add a separate
  form `value` here, to avoid silently repurposing the existing `value` prop —
  `indeterminate` is layered on top as presentation only.

- 24e9a80: Add three convenience props to `Chip`, all additive — the existing
  `intent` / `saliency` / `size` / `shape` / `icon` / adornment / `onClick` /
  `popover` / `handleRemove` API and the `Chip.Adornment` part are unchanged.

  - **`contentToCopy`** — appends a built-in copy-to-clipboard trailing adornment.
    It's a labelled ("Copy") clickable `Chip.Adornment` that writes the string to
    the clipboard via the Clipboard API and briefly swaps to a checkmark + "Copied"
    as success feedback. Being clickable it inherits the chip's disabled state
    (inert but focusable). Sits after `trailIcon`, before the `handleRemove` "×".
  - **`trailIcon`** — a trailing-icon shorthand mirroring the lead `icon`: a
    decorative `Chip.Adornment` appended after any `trailAdornments`.
  - **`width`** — `"fit"` (default, `inline-flex` hugging content) or `"fill"`
    (block `flex` stretching to the container's full width); the label truncates
    either way.

- 85b549e: Add an `icon` shorthand prop to `Chip`.

  `icon` is a convenience for a single leading `Chip.Adornment`: pass an icon and
  it renders as the **first** lead adornment, ahead of anything in
  `leadAdornments`. It's decorative and inherits the chip's colour like any
  adornment — equivalent to prepending `<Chip.Adornment icon={…} />` yourself.

- d4cd7d9: Add a `ChipList` component for rendering a set of `Chip`s as a semantic list.

  - **`items`** — each entry is a `Chip`'s props (`ChipListItem`), so chips keep
    their full API (adornments, clickable label, popover, remove "×"). Keyed by an
    optional `id`, falling back to the array index.
  - **`intent` / `saliency`** apply to every chip and can be overridden per item.
  - **`size`** applies to every chip and cannot be overridden per item; it also
    tunes the spacing between chips (smaller chips pack tighter).
  - **`orientation`** flows the chips in a wrapping row (`horizontal`, default) or
    stacks them in a column (`vertical`).
  - **`max`** caps how many chips show inline; the rest collapse behind a trailing
    "See more" chip whose `Popover` lists the remainder. Customise the chip's text
    via `seeMoreLabel` (a string, or a function of the hidden count).

  The list renders as a real `<ul>` (`role="list"`) of `<li>`s (`role="listitem"`),
  with the roles set explicitly so Safari keeps the list semantics under
  `list-style: none`.

- d4cd7d9: Add a `popover` prop to `Chip` for opening a `<Popover>` from the chip's text label.

  - **`Chip` gains `popover`** — pass a fully configured `<Popover>` element and the
    chip slots itself in as that popover's `trigger`, rendering its text label as a
    real `<button>` that base-ui wires up. The label button carries the popup a11y
    attributes (`aria-haspopup` / `aria-expanded` / `aria-controls`) and toggles the
    surface; only the label is the trigger, so adornments keep their own actions.
  - A disabled chip's label trigger stays keyboard-focusable (`aria-disabled`) but
    swallows the click, so the popover won't open. The prop composes with `onClick`
    (which still fires) and has no effect without text `children` or while `loading`.

- 231b7ca: Add a `Combobox` component — a typeahead / autocomplete "form control" built on
  base-ui's `Combobox`, mirroring the other form controls' `state` / `size` /
  `label` / `description` / `errorMessage` API.

  - **Single or multiple** selection, discriminated on `multiple`, with a
    string-based `value` / `onValueChange` (single: `string | null`; multiple:
    `string[]`). `name` submits the option `value`(s).
  - **Synchronous options** (`options`) get built-in typeahead filtering.
  - **Async search** via the `search` object (`{ loading, error, copy, results,
onSearch }`): internal filtering is disabled and the popup shows a spinner /
    error / empty state. `onSearch` fires with the query on each input change —
    debounce and wire up an `AbortController` in your handler.
  - **`freeText`** surfaces an "Add …" row so users can commit values not in the
    list.
  - **`virtualized`** windows long lists, mounting only the visible rows.
  - **`hideClearButton`** hides the inline clear (✕) control.

  Follows the system conventions: colours come from the shared `form` /
  `surface` / `text` tokens (no hardcoded colours), variants are backed by
  vanilla-extract recipes, the popup reuses `surfaceRecipe`, focus uses
  `focusRingRecipe`, and disabled is modelled with `aria-disabled` + `readOnly`
  so the field stays keyboard-focusable. Listbox options (never tab stops) use
  base-ui's `disabled` for per-option `aria-disabled`, allowlisted in the
  disabled-convention guard.

- 7310a6e: Add a **grid view** to `Combobox` via a new `columns` prop. Pass a whole number
  ≥ 2 to tile the options into that many columns instead of a single column;
  arrow keys then navigate in two dimensions. Best for short, tile-like options
  (colours, icons, emoji).

  - Built on base-ui's `grid` mode: the popup becomes a `role="grid"` of
    `role="row"`s of `role="gridcell"`s, and base-ui infers the columns from the
    DOM rows for 2-D arrow-key navigation.
  - Fully backwards-compatible — omitting `columns` (or passing `< 2`) keeps the
    single-column list. Takes precedence over `virtualized` (whose flat-row
    windowing can't tile).
  - Works with **groups** (each group tiles under its own heading), typeahead
    filtering (rows re-chunk as the list narrows), `freeText` (the "Add …" cell
    gets its own full-width row), and single / multiple selection.
  - Selected cells read without relying on colour alone: a border ring plus a
    corner check, on top of the shared `data-selected` wash.

  Also adds an optional **`icon`** to `ComboboxOption` (a `React.ReactNode`,
  typically an `<Icon>`) — mirroring `Menu`'s item icon. It shows above the label
  as a caption in the grid and as a leading glyph in the list; it's decorative, so
  `label` stays the accessible name and the typeahead text and search still works
  by name.

  Follows the system conventions: the column count is the one caller-chosen value
  a recipe can't enumerate, so it reaches CSS as a single dedicated `createVar`
  set inline via `assignInlineVars` — the same single-hole pattern the colour
  escape hatches use. Cell highlight / select washes reuse the list item's oklch
  tokens, and grid cells (never tab stops) use base-ui's `disabled` for per-cell
  `aria-disabled`, allowlisted in the disabled-convention guard.

- 4592d79: Add option **groups** to `Combobox` and `Select`. Both components' `options`
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

- 5536689: Add an `InfoButton` component.

  A small icon-only "i" button that opens an informational `Popover` — the "more
  about this" affordance next to a label or field. It composes the exported
  `Popover` (so focus management, `Escape` / outside-click dismissal, and ARIA
  wiring come for free) with an icon-only trigger built on the very same
  `InternalButton` that powers `Button`.

  - **Required `aria-label`:** the button is icon-only, so its accessible name is
    required — the mirror image of `Button`, which _forbids_ `aria-label` because
    its visible label is already the name.
  - **`children`** are the popover body; **`header`** adds a title that also names
    the popover.
  - **`icon`** defaults to an info glyph; **`intent`** (excludes `positive`,
    default `neutral`), **`saliency`** (default `low`), and **`size`** (default
    `sm`) style the trigger, shared with `Button` / `Chip`. The floating surface
    stays the default neutral `Popover`.
  - **`side` / `align`** place the popover; **`disabled`** uses `aria-disabled`
    (keyboard-reachable, can surface `disabledReason`).

- 783a78c: Add a `DataTable` component — renders a set of columns and rows as a semantic
  `<table>`, built on TanStack React Table v9.

  - **Headless engine, house markup:** TanStack owns the row/column model; the
    component owns the `<table>`/`<caption>`/`<thead>`/`<tbody>` markup, the
    vanilla-extract styling, and the accessibility. This first version renders the
    columns you pass — sorting / filtering / pagination are v9 feature plugins that
    register into the same feature set later, without changing this prop surface.
  - **TanStack-native columns:** pass `data` and `columns` (TanStack `ColumnDef`s).
    Build the columns with the exported `createDataTableColumnHelper<T>()` — a
    helper pre-bound to the component's feature set, so callers never repeat the
    feature generic — for full per-column value inference and custom `cell`
    renderers. Raw `createColumnHelper` / `ColumnDef` stay importable from
    `@tanstack/react-table` for advanced use.
  - **Required accessible name:** pass exactly one of `caption` (a visible
    `<caption>` that also names the table), `aria-label`, or `aria-labelledby` — a
    union type makes providing none, or two, a compile error (mirrors `CardList`).
  - **Column alignment:** set a column's `meta.align` (`start` / `center` / `end`),
    wired through v9's type-only `columnMeta` slot so it stays a real style recipe
    variant rather than a parallel column API.
  - **`getRowId`** for stable, reorder-proof row keys, and an **`empty`** slot
    rendered as a single cell spanning every column when there are no rows.
  - **New peer dependency:** `@tanstack/react-table` (`^9.0.0-beta.53`). Consumers
    installing `DataTable` must add it alongside the existing `@base-ui/react` peer.

- d77dda7: Move `DataTable` to its own entry point — import it from
  `@saintly-software/baritone/datatable` instead of the package root.

  **Breaking (for `DataTable` consumers):** `DataTable`, `dataTableFeatures`,
  `createDataTableColumnHelper`, and the DataTable types are no longer re-exported
  from `@saintly-software/baritone`. Update imports:

  ```diff
  -import { DataTable, createDataTableColumnHelper } from "@saintly-software/baritone";
  +import { DataTable, createDataTableColumnHelper } from "@saintly-software/baritone/datatable";
  ```

  Nothing else moves — every other component still imports from the package root,
  and styles remain a single `@saintly-software/baritone/styles.css`.

  **Why:** `@tanstack/react-table` is a peer dependency, but the build was bundling
  it into the main entry rather than leaving it external like the other peers. That
  pulled its CJS `require("react")` interop into the ESM output, which throws in a
  pure-ESM consumer (`Calling require for "react" in an environment that doesn't
expose the require function`) — even for consumers that never touch `DataTable`.
  The table engine is now (a) left external, so consumers resolve their own copy,
  and (b) reachable only through the `/datatable` subpath, so importing anything
  else from the package never references it.

- 9cd532a: Add `Divider` — a standalone rule for separating content, built on base-ui's
  `Separator` (`role="separator"` plus the `aria-orientation` wiring).

  - **Colour:** `intent` × `saliency` read the `component` _border_ ramp, so the
    default `neutral` / `low` is a quiet hairline and a louder intent is there when
    the split itself carries meaning. `thickness` (`thin` / `thick`) picks a
    `borderWidth` token.
  - **Orientation:** `horizontal` (default) or `vertical`, which stretches to its
    flex row's height without an explicit height.
  - **Labels:** `children` breaks the rule around a label, placed by
    `labelPosition` (`start` / `center` / `end`) and tunable through
    `slotProps.label`. A string label doubles as the divider's accessible name — a
    `separator`'s children are presentational, so the visible text alone would
    never be announced; pass `aria-label` to name it any other way.
  - **Spacing:** the shared `MarginProps` (`my` / `mx` / …) space the rule from its
    neighbours.

  `Card.Divider` is unchanged — it stays the edge-to-edge rule that negates a
  card's padding.

- ea1aad4: Add `Drawer.Action` — a menu-style action row for a drawer's header, footer, or
  inline action lists (DES-49).

  - Borrows `Menu.Item`'s look and its button/link semantics: renders a real
    `<button>` for `onClick`, or an `<a>`/router link for `href`/`render` (via
    `InternalGenericButtonAnchor`), with a leading `icon` (`ReactNode`) and an
    `intent` (`neutral` / `secondary` / `warning` / `negative`).
  - Unlike `Menu.Item`, it needs no menu context: it's an ordinary tab stop in the
    drawer's focus order (keyboard reachable with Tab), with its highlight wash
    driven by `:hover`/`:focus-visible` and keyboard focus drawn by the shared
    focus ring.
  - `disabled` follows the house rule — `aria-disabled` (stays focusable), never
    the native attribute, with activation swallowed. Wrap in `<Drawer.Close>` if an
    action should also close the drawer.

- f456568: Rework `Drawer`'s action affordances and drop the surface `intent` prop.

  **Breaking:** the `Drawer.Action` subcomponent and its `DrawerActionProps` type
  have been removed, along with `Drawer`'s surface `intent` prop. In their place,
  actions now live on the header and footer slots directly:

  - `<Drawer.Header actions={…} actionsLabel="…">` renders an overflow `Menu`
    behind an icon-only "more options" trigger at the header's end. Each entry is a
    `Menu.Item`'s props (falsy entries are skipped). `actionsLabel` names the
    trigger (default `"Actions"`). Use this for secondary, per-item actions.
  - `<Drawer.Footer actions={…}>` renders the primary button row as a joined
    `ButtonGroup` at the footer's end. Each entry is a `ButtonGroup.Item` element.
  - The surface always renders `surfaceRecipe`'s default neutral shade — matching
    `Popover`/`Modal`, `Drawer` no longer accepts `intent` (only `saliency` /
    `padding`).

  Migration: replace stacked `<Drawer.Action>` rows with the header `actions`
  (overflow menu) and/or footer `actions` (button row) props, and drop any `intent`
  passed to `<Drawer>` itself.

- 866439d: Add `width` to `Drawer` — the panel's width, on a five-step scale.

  - **`width`** — `xs` (14rem / 224px), `sm` (26rem / 416px), `md` (default,
    38rem / 608px), `lg` (52rem / 832px), or `xl` (64rem / 1024px). Every step
    keeps the existing viewport cap, so a wide drawer shrinks to fit on narrow
    screens rather than overflowing.

  **Visual change:** the panel was previously a fixed 22rem (352px). The new `md`
  default is 38rem (608px), so drawers that don't pass `width` get noticeably
  wider. Pass `width="sm"` (26rem / 416px) for the closest step to the old width.

- d4cd7d9: Add an `Accordion` component.

  A vertical stack of collapsible items, built on base-ui's `Accordion` (each item
  gets a heading + disclosure `button` + a `region` panel, with the ARIA wiring and
  keyboard handling done for you). Each item is a "surface" (like `Card`); its
  `header` is typically an `<Accordion.ItemHeader />` and its `children` are the
  panel content.

  - **Type-safe over its values (like `Tabs`):** generic over `T`, inferred from
    the `items` array with a `const` type parameter so string/number literals
    survive without `as const`. Each item's `value` and the open-value props are
    bound to that same union/enum — a stray value is a compile error (`NoInfer`
    keeps `T` coming from `items` alone).
  - **`multiple` is a discriminated union (like `FileUpload`):** omitted/`false`
    keeps one item open at a time, so `value` / `onChange` / `initialValue` speak a
    single `T | null`; `multiple` lets any number open, so they speak a `T[]`. A
    mismatched pair is a type error.
  - **Controlled vs uncontrolled is a discriminated union (like `Tabs`):** pass
    `value` + `onChange` to drive it, or `initialValue` (or nothing) to let it
    manage its own state.
  - **`Accordion.ItemHeader`:** renders an item's trigger content as a `title` with
    an optional `subtitle`; the surrounding `<h3>`, `<button>`, and disclosure
    chevron are supplied by `Accordion` itself.
  - **`disabled`:** dims a single item or the whole group and vetoes toggling, but
    every trigger stays keyboard-reachable (`aria-disabled` on the root + a per-item
    veto via base-ui's open-change event, never the native attribute — see
    AGENTS.md).

- d6e8452: Add a `RadioGroup` component.

  A "form control" element type for picking one value from a small set. Built on
  base-ui's `RadioGroup` (roving focus, arrow-key navigation, ARIA `radiogroup`
  wiring) and wrapped in a `Field` for label / description / error association,
  like `TextInput`.

  - **Type-safe compound component:** the group is generic over the value type
    `T` (inferred from `value`), and hands its render-prop a `RadioGroupItem`
    bound to that `T` — so an option outside the union/enum is a compile error.
    Works for any enum, not just one.
  - **Validation:** `state` accepts `neutral` / `invalid` / `valid`; `invalid`
    shows `errorMessage` through `Field.Error` and is announced.
  - **Layout:** `orientation` lays options out in a column (default) or a row.
  - **Labelling:** each item's visible label doubles as its accessible name via
    explicit `aria-labelledby`, since the `role="radio"` element isn't the one a
    wrapping `<label>` would otherwise name.

- 8af6169: Add a `Fieldset` component — groups related controls under a shared legend and an
  optional shared disabled context. Built on Base UI's `Fieldset`, so it renders a
  real `<fieldset>` and wires the legend as the group's accessible name.

  - **`disabled`** — disables every nested control at once. It propagates through
    React context (not the native `<fieldset disabled>` attribute, which would drop
    the controls out of the tab order), so disabled controls keep the system's
    focusable `aria-disabled` model. Nesting composes: an inner fieldset can add to,
    but never undo, an outer fieldset's disabled state.
  - **`FieldsetLegend`** — the group's visible heading, styled like the form-group
    labels and dimmed when the fieldset is disabled. Or label the group with an
    existing element via `aria-labelledby`.
  - **`useIsFieldDisabled()`** — the hook controls read to inherit the fieldset's
    disabled state. Every form control in the package (`TextInput`, `Checkbox`,
    `Switch`, `RadioGroup`, `CheckboxGroup`, `Combobox`) and `Button` now ORs it
    into their own `disabled`, so wrapping them in a disabled `Fieldset` disables
    them while keeping each one focusable.

- e13c4fd: Add per-item `download` and `FileList.Item` composition to `FileList`.

  - **Per-item `download`:** `FileInfo` (and `FileList.Item`) gains an optional
    `download?: boolean`. Flagged files get a download button when the list is
    given an `onDownload` handler, which — like `onRemove` — calls back with the
    item's `id`. Unflagged files (or a list without `onDownload`) show no download
    affordance. The button inherits the chip's disabled state (inert but
    focusable) like the remove "×".
  - **`FileList.Item` element form:** compose rows directly
    (`<FileList><FileList.Item … /></FileList>`) instead of the `items` array for
    advanced cases. Items inherit the list's chip `intent` / `saliency` / `size`,
    `disabled`, and the `onRemove` / `onDownload` handlers through context, and can
    override the visual props (and `disabled`) per item. The `items` array wins
    when both are supplied.
  - Keeps baritone's group `intent` / `saliency` / `size` / `orientation` /
    `disabled` props unchanged.

- 7fd8a2e: Add `info`, `name`, and `slotProps` to `FileUpload`.

  - **`info`** — extra explanation surfaced in an `InfoButton` (the "i" affordance)
    next to the `label`. Only rendered when there's a visible `label`. Name the
    button via `slotProps.info["aria-label"]` (defaults to "More information").
  - **`name`** — native form field `name` on the underlying file `<input>`, so the
    control participates in `<form>` submission / `FormData`.
  - **`slotProps`** — per-slot overrides for the `label` / `help` / `info` pieces.
    A `className` set on a slot merges onto (doesn't replace) the built-in class.

- 2b17b92: Add sizing + responsive-visibility shorthands to `Flex` and `Box`.

  - **`Flex` + `Box`:** `hideOn` / `showOn` for responsive breakpoint visibility
    (accept one breakpoint or a set of `"mobile" | "sm" | "md" | "lg" | "xl"`), and
    a friendly `width` shorthand (`"fill"` → 100%, `"fit"` → fit-content,
    `"inherit"`).
  - **`Flex`:** `grow` (`flex-grow` on the container itself, for a `Flex` nested in
    another flex layout), plus `height` / `maxWidth` / `minHeight` wired to the
    atoms sizing scale.
  - All backed by vanilla-extract sprinkles conditions and fully type-safe. Because
    the breakpoint conditions are `min-width`, `hideOn` / `showOn` emit every
    condition explicitly so hiding at one breakpoint never leaks into the next.
  - `render` remains the escape hatch for full polymorphism; the new `maxWidth`
    atom and `inherit` dimension value are also exposed on `atoms`.

- 85b549e: Add a `Flex` component — a flexbox container primitive so common layouts don't
  have to reach for `atoms` directly.

  Renders a `<div>` with `display: flex` (or `inline-flex` via `inline`) and maps
  friendly props onto the spacing/flex tokens:

  - **`align` / `justify`:** friendly values (`start` / `center` / `end` /
    `between` / `around` / `evenly`, plus `stretch` / `baseline` for `align`)
    mapped to the `align-items` / `justify-content` keywords.
  - **`direction`:** `row` (default) or `column`. The `*-reverse` directions are
    intentionally unsupported — they flip the visual order without touching the
    DOM order, desyncing reading/tab order from the screen. Reorder children
    instead.
  - **`gap`, `wrap`, `inline`:** the gap token, `flex-wrap`, and `inline-flex`.
  - **Spacing shorthands:** `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` and
    `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl`, wired straight to the spacing
    scale (each responsive-capable).
  - **`render`:** swap the element via the base-ui `render` pattern.

- fe2b247: Add a `Flex.Item` sub-component — a flex child exposing per-child layout knobs so
  a single child can override the container without reaching for `atoms` directly.
  It's purely optional: plain children still work fine inside `Flex`.

  Renders a `<div>` by default and maps friendly props onto the atoms scale:

  - **`align` / `alignSelf`** — `align-self` in friendly terms (`start` / `center`
    / `end` / `stretch` / `baseline` / `auto`). `alignSelf` wins if both are set.
  - **`grow` / `shrink`** — `flex-grow` / `flex-shrink` as booleans (`grow` → `1`,
    `shrink={false}` → `0`).
  - **`width` / `height` / `minWidth` / `minHeight`** — sizing from the atoms scale
    (spacing tokens plus `full`, `auto`, `fit-content`, `max-content`,
    `min-content`), each responsive-capable.
  - **Spacing shorthands** (`m` / `mx` / … and `p` / `px` / …) wired to the spacing
    scale, plus `render`, `className`, `ref`, `children`, and the rest of
    `HTMLAttributes`.

  The sizing atoms (`alignSelf`, `flexGrow`, `flexShrink`, `height`, `minWidth`,
  `minHeight`, and an expanded `width`) are also available via `atoms`.

- ea80937: Add `minWidth` to `Flex` — `min-width` from the atoms sizing scale
  (responsive-capable), matching the `maxWidth` / `minHeight` knobs already on the
  container.

  Closes an asymmetry: `Flex.Item` has taken `minWidth` since it shipped, and
  `Flex` itself already took `maxWidth` and `minHeight` — `minWidth` was the one
  missing corner, so a `Flex` needing it had to drop to `atoms` or `className`.

  ```tsx
  <Flex direction="column" minWidth="16" gap="2">
    …
  </Flex>
  ```

  The most common use is `minWidth="0"`, which lets a nested flex container
  actually shrink below its content's intrinsic width (so long text can truncate
  instead of overflowing its parent).

- d6e8452: Keep disabled form controls keyboard-focusable.

  `Checkbox`, `Switch`, `RadioGroup`, and `CheckboxGroup` now model their disabled
  state with `aria-disabled` instead of the native `disabled` attribute, matching
  `Button` and `TextInput`. The native attribute drops an element out of the tab
  order, so a disabled control couldn't be focused to explain _why_ it's disabled;
  these controls now stay tabbable while still rejecting interaction.

  - Disabled is applied as `aria-disabled` plus base-ui's `readOnly` (which vetoes
    the toggle/selection — click, Space, Enter — while keeping the control in the
    tab order). `Field.Root` no longer receives `disabled`, since base-ui would
    re-apply the native attribute to its controls.
  - **Behaviour change:** because these controls are no longer natively
    `disabled`, a disabled control's value is now included in native form
    submission (consistent with how `TextInput`'s `readOnly`-based disabled already
    behaves). The visible dimmed styling is unchanged.

  This is now a system-wide rule: a new convention test
  (`src/test/aria-disabled-convention.test.ts`) fails CI if the native `disabled`
  attribute is applied to any interactive control, and the pattern is documented in
  `AGENTS.md`.

- d6e8452: Add a `FileList` component.

  Renders a set of files as a list of `Chip`s, stacked vertically (default) or
  flowed horizontally (`orientation`).

  - **Files as data:** pass `items` — an array of `FileInfo` (`{ id, file }`),
    where `id` is unique/stable and `file` is the browser `File`. The chip shows
    `file.name`, keyed by `id`.
  - **File-type icon:** each chip leads with a small monochrome glyph derived from
    the `File`'s MIME type (falling back to its extension) — image, audio, video,
    pdf, spreadsheet, archive, document, or a generic file. It inherits the chip's
    colour/size and is `aria-hidden` (the filename names the entry).
  - **Removable:** pass `onRemove` to give each chip a remove "×" button; it calls
    back with the file's `id`. Omit it for a read-only list.
  - **Focusable when disabled:** the remove button models disabled with
    `aria-disabled` (never the native attribute), so a disabled list's buttons stay
    keyboard-reachable; clicks are suppressed.
  - **Truncation:** long filenames ellipsize when the list is width-constrained.
  - **Chip passthrough:** `intent` / `saliency` / `size` flow to the underlying
    chips.

- a16a0f0: Add a `Grid` component — the CSS-grid counterpart to `Flex`, so common
  two-dimensional layouts don't have to reach for `atoms` directly.

  Renders a `<div>` with `display: grid` (or `inline-grid` via `inline`) and maps
  friendly props onto the grid/spacing tokens:

  - **`columns` / `rows`:** a number expands to that many equal tracks
    (`repeat(n, minmax(0, 1fr))`), or pass any `grid-template-*` string
    (`"200px 1fr"`, `"repeat(auto-fill, minmax(8rem, 1fr))"`) verbatim.
  - **`areas`:** `grid-template-areas` without the footguns. Pass a 2D array of
    cells (`[["header", "header"], ["nav", "main"]]`), an array of rows
    (`["header header", "nav main"]`), or a multi-line string — you write the cell
    names and Grid adds the required per-row quotes (and inter-cell spacing for the
    2D form), leaving already-quoted rows alone and ignoring blank/indented lines.
    Exposed standalone as `toGridTemplateAreas` too.
  - **`align` / `justify`:** friendly values (`start` / `center` / `end` /
    `between` / `around` / `evenly`, plus `stretch` / `baseline` for `align`)
    mapped to the `align-items` / `justify-content` keywords.
  - **`gap`, `inline`:** the gap token and `inline-grid`.
  - **Spacing shorthands:** `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` and
    `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl`, wired straight to the spacing
    scale (each responsive-capable).
  - **`render`:** swap the element via the base-ui `render` pattern.

  Also adds `inline-grid` to the `display` sprinkle.

- 591c240: Expose `Text`'s token-backed typographic props on `Heading`, reusing the shared
  `textTypographyRecipe`: `weight`, `italic`, `align`, `wrap`, and `wordBreak`.

  Each prop is opt-in and additive — omitting it leaves the heading's default
  styling (including the weight baked into the title `variant`) untouched.

- 54e9f8d: Add a `HelpText` component — a single inline help / validation line (icon + text)
  for use under a form control or standalone. It composes the `Text` and `Icon`
  primitives, so the glyph inherits the line's resolved colour and scales with the
  type size.

  - **Colour** via `intent` + `saliency` (default `neutral` / `mid`), plus two
    convenience flags for the common form states: `invalid` → `negative` and
    `disabled` → a dimmed `neutral` (`disabled` wins over `invalid`).
  - **Auto glyph** — a warning triangle shows automatically on the attention
    intents (`warning` / `negative`, incl. `invalid`) when no `icon` is passed;
    supply your own `icon`, or `hideIcon` to drop it. The icon is decorative
    (`aria-hidden`) since the message carries the meaning.
  - **`variant`** (`xs` | `sm` | `md` | `lg`, default `sm`) scales the message and
    icon together; **`render`** for polymorphism (defaults to a `<p>`).

- 709fd04: Add an `InaccessibleTooltip` component.

  A consumer-facing escape hatch for attaching a tooltip to an _arbitrary_ element
  on hover/focus. It composes the (still-unexported) `InternalTooltip`, so it
  reuses the system's tooltip surface for visual consistency.

  - **Bluntly named on purpose:** tooltips are kept off the public surface because
    the pattern is easy to misuse (invisible to touch, easy to overlook). This
    hands consumers the pattern anyway, under a name that keeps the tradeoff
    visible at every call site.
  - **Accessibility is on the caller:** the tooltip is only keyboard/focus
    reachable when the wrapped element is itself focusable. Wrapping a plain
    `<div>` / `<span>` makes it mouse-hover only — never put information here that
    the UI can't function without.
  - **Same surface, same knobs:** forwards `content`, `side` / `align` /
    `sideOffset`, `delay` / `closeDelay`, controlled `open` state, and `disabled`
    through to `InternalTooltip`.

  For anything a user actually needs to read, prefer `Popover` (once it lands).

- 169c0c7: Add an icon-only variation of `Button` — a square, label-less button carrying a
  single glyph — rather than a separate component (DES-37).

  - Pass `icon` + `aria-label` (and no `children`) to select it, e.g.
    `<Button aria-label="Add item" icon={<Icon>…</Icon>} />`. Because there's no
    visible text to name it, `aria-label` is **required** here — the mirror of the
    labelled arms, which forbid `aria-label` since their label already is the name.
  - It's a variation of the filled (`solid`) control, so `intent` / `saliency` /
    `size` / `loading` / `disabled` / `disabledReason` all behave exactly as on a
    labelled `Button`. The button stays a 1:1 square at every `size`.
  - Only offered on the default look: `appearance="text"` stays label-only, since a
    bare underlined glyph reads as neither a link nor a button. `children` and
    `startIcon`/`endIcon` are unavailable on the icon-only arm (the `icon` slot is
    the whole content) — all enforced at the type level.

- 709fd04: Add a `Modal` component.

  A "surface" element type shown in a panel centred over the page. Its API mirrors
  `Drawer` — it composes `header` / `footer` props (or `<Modal.Header>` /
  `<Modal.Footer>` children) around its content and takes the same `intent` /
  `saliency` / `padding` surface knobs (via `surfaceRecipe`). Built on base-ui's
  `Dialog`, so ARIA wiring and focus management are handled for you.

  - **Trigger:** `trigger` accepts a `<Modal.Trigger>`, which renders a `Button`
    (all of Button's intents / saliencies / sizes / icons apply) wired with the
    right `aria-haspopup` / `aria-expanded`.
  - **Header labels the modal:** `<Modal.Header>` renders its `title` / `subtitle`
    through base-ui's `Dialog.Title` / `Dialog.Description`, so they become the
    modal's accessible name and description.
  - **Close from inside:** `<Modal.Close>` renders a `Button` that dismisses the
    modal — drop it in a `<Modal.Footer>` for actions.
  - **Size:** `size` sets the panel's max width — `sm`, `md` (default), or `lg`.
  - **Loading state:** `loading` overlays a spinner on the body content (the header
    and footer stay live so the modal can still be closed) and marks the panel
    `aria-busy`.
  - **Disabled state:** `disabled` makes the modal non-dismissable — Escape and the
    close button are both vetoed while a blocking action is in flight.
  - **Modal with an always-on backdrop:** the backdrop is force-rendered (even for
    nested modals), the page behind is inert, and clicking outside never closes the
    modal.

- 6657a5a: Add a button-styled `appearance="button"` arm to `Link`.

  `LinkProps` is now discriminated on `appearance`: the default inline styled
  anchor (`"text"`) or a link that looks like a `Button` (`"button"`). A
  `<Link appearance="button">` reuses `Button`'s recipe wholesale (through the
  shared `InternalButton`), so there's **no style duplication** — the same
  `intent` / `saliency` / `size` / `loading` / `startIcon` / `endIcon` /
  `disabledReason` knobs apply, but the rendered element stays a real anchor.

  ```tsx
  <Link appearance="button" intent="primary" href="/dashboard">Go to dashboard</Link>
  <Link appearance="button" render={<NextLink href="/settings" />}>Settings</Link>
  ```

  - **Element is a link, not a button:** supply the destination the usual way —
    `href` for an external `<a>`, or `render` with your framework's link for
    client-side navigation. `InternalGenericButtonAnchor` renders the button chrome
    onto that anchor.
  - **Disabled degrades honestly:** a disabled button-link has no valid HTML form,
    so it collapses to an inert element (out of the a11y tree as a link) while
    keeping the button styling, and can still explain itself via `disabledReason`.
  - **Loading** makes the link inert and overlays the spinner, keeping the label in
    place for width and accessible name.
  - **Accessible name** is always the visible label — `aria-label` is `never`, as
    on `Button`.

  The default inline `Link` is unchanged (omitting `appearance`, or `"text"`,
  renders the same styled `<a>` as before).

- 46d9fe6: Add a public `LoadingIndicator` component (spinner).

  - Wraps the system's shared `InternalSpinner` (the same pure-CSS ring behind
    `Button`/`Chip` loading states) in a standalone, accessible shell.
  - By default it announces an `SrOnly` **"Loading"** label under `role="status"`,
    keeping the ring itself decorative (`aria-hidden`). Pass a custom `label` to
    reword the announcement.
  - Pass `aria-hidden` to render the ring purely decoratively — the label, `role`,
    and live region are all dropped — for hosts that convey the busy state
    themselves (e.g. via `aria-busy`).
  - `size` (`sm`/`md`/`lg`) tracks `Icon`'s ramp; colour comes from `intent` /
    `saliency` when standalone, or follows the surrounding text inside
    `Text`/`Chip` (via `--iconColor`). A `variant` axis is reserved (only
    `"spinner"` today).
  - Honours `prefers-reduced-motion` (the ring eases to a slow rotation), and
    supports the `render` prop for polymorphism.

- 0ad1697: Add a `Lockup` component — an icon locked up with a title and optional subtitle,
  after the logo-design idea of a fixed "lockup" of mark and wordmark. A flexible
  media object: the mark sits inline with the stacked text, each of the three
  pieces (`icon` / `title` / `subtitle`) is optional, and each renders as a system
  primitive (`Icon`, `Text`) you can tune through `slotProps`. Colours are
  inherited from the surrounding surface, so a lockup drops into a coloured
  `component` / `surface` and matches automatically. Swap the root element via the
  base-ui `render` prop.
- 665ba6b: Add `hideText`, `slots`, and title-`level` switching to `Lockup`.

  - **`hideText`** — visually hide the text column while keeping it in the
    accessible tree, for an icon-only lockup a screen reader still announces.
  - **`slots`** — ReactNode overrides (`icon` / `title` / `subtitle`) that replace
    a slot's content entirely, complementing the existing `slotProps` tweaks.
  - **`slotProps.title.level`** — set a `HeadingLevel` to render the title as a
    semantic `Heading` (`h1`–`h6`) instead of a `Text`; a pure semantics switch, so
    the visual size is unchanged (still driven by `variant`, default `lg`).

- 709fd04: Add a `Link` component.

  A router-agnostic inline link. Renders an `<a>` by default; pass your router's
  link via the base-ui `render` prop (`render={<NextLink href="…" />}`,
  `render={<RouterLink to="…" />}`, …) to integrate with any framework while
  keeping the system's styling.

  - **Always underlined:** the underline (not colour alone) is what signals the
    link, so it stays distinguishable for users who can't perceive the colour
    difference.
  - **Primary intent colour:** locked to the `primary` text token for one
    consistent, predictable link colour across the app, with oklch-derived
    hover/active states and the shared `:focus-visible` ring.
  - **Inherits typography:** picks up the surrounding font/size so it blends
    naturally into `Text`/paragraph copy.

- bd0d720: Round out the `Menu` component (`Menu` / `Menu.Item` / `Menu.Trigger`).

  Builds on the initial `Menu` with the rest of the DES-69 API:

  - **`Menu.Item` gains the `secondary` intent** alongside `neutral`/`warning`/
    `negative`, so a row can carry the same accent as a `secondary` `Chip`/`Button`.
  - **`keepOpen` on a row** holds the menu open after it activates (via base-ui's
    `closeOnClick`), for a repeatable, non-navigating action like a stepper. Rows
    still dismiss on click by default.
  - **`items` accepts falsy entries** (`null` / `false` / `undefined`), which are
    filtered out — so a row can be included conditionally inline
    (`canDelete && { children: "Delete", … }`) without a wrapper.
  - **`Menu.Trigger` gains `openOnHover`** (plus `delay` / `closeDelay`) to open
    the menu on pointer hover, not just click/keyboard.
  - **`Menu.Trigger` accepts a base-ui `render`** for a fully custom, non-Button
    trigger (an avatar, an icon-only control) that still receives the popup wiring
    — the house `render` polymorphism convention, never `asChild`.

  `disabled` / `loading` on the trigger were already covered by `Menu.Trigger`'s
  `Button` props. Keyboard navigation, type-ahead, and focus return to the trigger
  on close come from base-ui and now have explicit test coverage.

- a37a3db: Add `positive` to `Menu.Item`'s `intent` — a menu row can now read as
  confirming/constructive (Publish, Approve, Restore), the counterpart to the
  `negative` row that was already there.

  ```tsx
  <Menu
    trigger={<Menu.Trigger>Actions</Menu.Trigger>}
    items={[
      { children: "Publish", intent: "positive", onClick: publish },
      { children: "Delete", intent: "negative", onClick: remove },
    ]}
  />
  ```

  `MenuItemIntent` is now `neutral | secondary | warning | negative | positive`.
  It's a widening, so no existing usage changes.

  `primary` remains excluded, and now says why in the source: it's the
  call-to-action colour, and a row in a list of peers isn't a CTA — a
  primary-coloured row would out-shout the menu's own trigger.

- ba339fd: Add `slotProps.bar.color` to `Meter` — a colour escape hatch for the indicator.

  - **`slotProps.bar.color`** — paint the filled indicator any CSS colour,
    overriding the `intent` × `saliency` palette default. Accepts anything CSS
    `color` takes (a hex/rgb value, a custom property, `currentColor`). Prefer
    `intent` / `saliency` so the bar stays on the system palette — reach for this
    only when you need a colour outside it, and mind contrast against the track.

  Applied inline over the indicator's fill custom property, so only the colour
  changes — the radius, width transition, and track are untouched. Meters without
  `slotProps.bar` render exactly as before.

- 0ad1697: Add a `Meter` component — a static, read-only gauge for a value within a known
  range (storage used, score, capacity), built on base-ui's `Meter` for the
  semantics (`role="meter"`, the `aria-value*` wiring, the value→percentage math)
  with the system's colour scheme on top.

  The filled indicator is coloured by `intent` × `saliency` — the same vocabulary
  as `Chip` / `Button` — over a neutral track. Supports a visible `label` (wired up
  as the accessible name) or `aria-label` / `aria-labelledby`, plus
  `aria-valuetext` as either a fixed string or a function of the formatted and raw
  value.

  It is _not_ a progress bar: use it for a measurement, not the completion of a
  task.

- 488643e: Add `description`, a value read-out, and per-slot overrides to `Meter`.

  - **`description`** — supporting text beneath the track, wired to the meter as
    its `aria-describedby`.
  - **`showValue`** — render the current value at the end of the header row
    (decorative / `aria-hidden`; the value still reaches assistive tech via
    `aria-valuenow` / `aria-valuetext`). Customise it with `format` /
    `locale` (an `Intl.NumberFormat` bag) or take full control with `formatValue`.
  - **`slotProps`** — `Partial<TextProps>` overrides for the `label` / `value` /
    `description` `Text` slots.

  The existing `aria-valuetext` formatter is unchanged. Meters with none of the
  new props render as before.

- b1367f4: Add a `MetricCard` component.

  A `Card` variant for the "big number + label" stat / KPI tile (dashboards,
  summaries). Renders a large `value`, a `label` naming it, and an optional
  `caption` and leading `icon`, on a neutral `Card` surface.

  - **No bare-number headings:** the `value` is a styled `<span>` (the title
    typography without the semantics), not a heading — so a grid of tiles doesn't
    flood the document outline with context-free numbers and drown the real section
    headings. Metrics are meant to sit in a **named `CardList`** (each tile a
    `listitem` under a real heading), which is the documented usage.
  - **Interactive, accessibly:** `onClick` (a `<button>`) or `href` (an `<a>`, or a
    router link via `render`) turns the value + label into the card's single
    control, stretched over the whole surface with an `::after` overlay (the
    Inclusive Components card pattern) so a click anywhere activates it while the
    control is named by the value **and** the label ("Active goals, 2"). The
    `caption` stays outside that control, so it isn't folded into the name.
  - **`disabled`** is modelled the focusable way — `aria-disabled` + swallowed
    activation, never the native attribute (per AGENTS.md), so it stays tabbable.
  - **`intent`** tints the value (e.g. `positive` / `negative` for a good / bad
    number); **`valueSize`** picks the figure size from the title scale.
  - **`trend`** adds a delta badge (`▲ 12%`) beneath the label. The arrow is
    decorative — the badge is exposed as a single `role="img"` with a composed text
    alternative ("increased 12%"), never read as a glyph name. Sentiment colour
    defaults from the direction but can be overridden for _inverted_ metrics (churn,
    latency) where a fall is good. Like the caption, it stays outside an interactive
    card's control name.

- d4cd7d9: Add a `ToggleButton` component.

  An icon-only button with an on / off (`aria-pressed`) state, for toolbar-style
  toggles (bold, mute, pin, …). It's a thin wrapper over the very same
  `InternalButton` that powers `Button`: `value` / `onChange` drive the
  `aria-pressed` flag and the click, and the `icon` is the button's only content.

  - **Pressed state expressed through saliency:** `intent` / `saliency` describe
    the _on_ look, and the _off_ look drops to `low` (ghost) saliency, so the two
    states are visibly distinct while reusing the shared `component` colour recipe
    (no toggle-specific colours). `saliency` defaults to `high` (filled).
  - **Required `aria-label`:** the button is icon-only and has no visible text, so
    its accessible name is required — the mirror image of `Button`, which _forbids_
    `aria-label` precisely because its visible label is already the name.
  - **`intent` / `saliency` / `size`:** the pressed look, shared with `Button` /
    `Chip`; square at every size.
  - **Focusable when disabled:** uses `aria-disabled` rather than the native
    attribute, so a disabled toggle stays keyboard-reachable (and can surface
    `disabledReason`); clicks and keyboard activation are vetoed.
  - **`disabledReason`:** shows a tooltip when a disabled toggle is tabbed to or
    hovered.

- 34c07f1: Round out `Notice` into a full banner/alert surface with dismiss, actions, a
  status chip, and inline/disabled/margin props. All additive — the existing
  `intent` / `saliency` / `shape` / `icon` / `description` / `actions` API and the
  `Notice.Icon` part are unchanged.

  - **`close`** + **`Notice.Close`** — a top-right "×" dismiss. Pass a handler for
    the built-in button (`close={onClose}`), or a `<Notice.Close>` element to set
    its accessible `label` (default "Dismiss") or glyph. It's a real focusable
    `<button>`.
  - **`Notice.Action`** — a typed control for the `actions` row that looks like a
    small `Button` (it shares the `component` colour/size recipes and the focus
    ring). It's a `<button>` (`onClick`) or a link (`href`, or a router link via
    `render`), and either text (`children`, with an optional leading `icon`) or
    icon-only (`icon` + a required `label`). The `actions` prop still accepts any
    node, so dropping in a plain `<Button>` keeps working.
  - **`chip`** + **`Notice.Chip`** — a status chip on the title line. `Notice.Chip`
    is a thin `Chip` preset defaulting to the compact `sm` size; every other `Chip`
    prop passes through.
  - **`inline`** — compact `inline-flex` layout that shrinks to its content instead
    of filling the container like a full-width block banner.
  - **`disabled`** — dims the notice and makes its `actions` / `close` inert. Uses
    `aria-disabled` (never the native attribute), so the controls stay focusable;
    the state reaches them through context.
  - **Margin props** (`m` / `mx` / `my` / `mt` / …) via the shared spacing scale,
    matching the layout primitives.
  - **`role` / `aria-live`** — the notice is a live region so assistive tech
    announces it when it appears or changes: `role="alert"` (assertive) for
    `negative` / `warning` intents, `role="status"` (polite) otherwise. Pass your
    own `role` (or `aria-live`) to override.

- 8e70fc7: Add `Overflow` — a single row (or column) of controls that scrolls instead of
  wrapping, built on base-ui's `ScrollArea`. Three affordances appear only when
  there's actually more to see in a given direction:

  - **Floating nav buttons** pinned to the start/end edges. A click slides to the
    next clipped control (`scrollBy="item"`, the default — never leaves a control
    half-cut) or by a whole viewport (`scrollBy="page"`, like Page Up/Down).
    They're pointer conveniences kept out of the tab order: the keyboard path is to
    Tab through the controls, which scrolls each focused control into view. Their
    visibility is pure CSS off base-ui's `data-overflow-*` edge attributes — no
    React state — and `prefers-reduced-motion` swaps the smooth scroll for a jump.
  - **Gradient edge fades** that grow in as content hides past an edge (driven live
    by base-ui's per-edge overflow metrics) and stay crisp at a flush edge.
  - **A hover-reveal scrollbar** for pointer dragging.

  `orientation` (`"horizontal"` (default) | `"vertical"`) picks the flow/scroll
  axis; `gap` spaces the controls from the spacing scale; `previousLabel` /
  `nextLabel` name the nav buttons (sensible per-orientation defaults otherwise).
  A horizontal `Overflow` just needs a bounded width (its container's is enough); a
  vertical one needs a bounded `height` **or** `max-height` — the root is a flex
  column so a cap makes the row grow to it and then scroll.

  Also exports `OverflowProps`, `OverflowOrientation`, and `OverflowScrollMode`.

- cc561d3: Add an imperative close escape hatch to the overlay surfaces (`Modal`,
  `Popover`, `Drawer`) via a new `useOverlayHandle` hook.

  Baritone's overlays stay declarative first — a `.Close` part plus controlled
  `open` / `onOpenChange`. This adds the small escape hatch for the one case that
  model handles awkwardly: closing after an `await` without lifting `open` into
  component state.

  ```tsx
  const modal = useOverlayHandle(Modal);
  // ...
  <Modal handle={modal} trigger={<Modal.Trigger>Edit</Modal.Trigger>}>
    <Modal.Footer>
      <Button
        onClick={async () => {
          await save();
          modal.close();
        }}
      >
        Save
      </Button>
    </Modal.Footer>
  </Modal>;
  ```

  - `useOverlayHandle(Modal | Popover | Drawer)` returns a stable handle;
    `handle.close()` / `handle.isOpen` control the overlay imperatively.
  - Each overlay gains a `handle` prop (pass the handle here) and a matching
    `<Overlay>.createHandle` for the rare detached / module-scope case.
  - Built on base-ui's native `handle` API, so `handle.close()` routes through the
    same path as every other dismissal: it fires `onOpenChange`, respects a
    controlled `open`, and is still vetoed while a `Modal` / `Drawer` is
    `disabled`. The declarative `.Close` part and controlled model are unchanged.

- f456568: Remove the surface `intent` / `saliency` props from `Popover` and `Modal`.

  **Breaking:** both components previously accepted `intent` and `saliency` to tint
  the floating surface. In practice the surface should always read as the default
  neutral, low-saliency shade — a coloured Popover/Modal surface is a Notice/Toast
  job, not an overlay one — so those knobs have been dropped. The surface now always
  renders `surfaceRecipe`'s `neutral` / `low` default; `padding` is unchanged.

  - `<Popover>` and `<Modal>` no longer take `intent` or `saliency`.
  - The `intent` / `saliency` on `<Popover.Trigger>` / `<Popover.Close>` (and the
    `Modal` equivalents) are **unaffected** — those are `Button` props and still
    colour the trigger / footer buttons.
  - `InfoButton` is unaffected: it already only passed `intent` / `saliency` to its
    trigger button, never to the Popover surface.

  Migration: drop the `intent` / `saliency` props from any `<Popover …>` /
  `<Modal …>` usage. To colour the _trigger_, keep passing them to
  `<Popover.Trigger>` / `<Modal.Trigger>` instead.

- 709fd04: Add a `Popover` component.

  A "surface" element type shown in a floating layer, anchored to a trigger. Its
  API mirrors `Card` — it composes `header` / `footer` props (or
  `<Popover.Header>` / `<Popover.Footer>` children) around its content and takes
  the same `intent` / `saliency` / `padding` surface knobs (via `surfaceRecipe`).
  Built on base-ui's `Popover`, so ARIA wiring, focus management, and dismissal
  are handled for you.

  - **Trigger:** `trigger` accepts a `<Popover.Trigger>`, which renders a `Button`
    (all of Button's intents / saliencies / sizes / icons apply) wired with the
    right `aria-haspopup` / `aria-expanded`.
  - **Header labels the popover:** `<Popover.Header>` renders its `title` /
    `subtitle` through base-ui's `Popover.Title` / `Popover.Description`, so they
    become the popover's accessible name and description.
  - **Close from inside:** `<Popover.Close>` renders a `Button` that dismisses the
    popover — drop it in a `<Popover.Footer>` for actions.
  - **Non-modal by default:** clicking outside or pressing `Escape` closes the
    popover while the rest of the page stays interactive; pass `modal` to lock
    scroll and trap focus.
  - **Positioning:** `side` / `align` / `sideOffset` place it against the trigger
    (base-ui defaults: `bottom` / `center`, with an `8`px offset here).

  This is the consumer-facing disclosure pattern the system pointed `InternalTooltip`
  / `InaccessibleTooltip` toward; it is now exported.

- dfda9f5: Add `ScrollArea` — a scrollable region built on base-ui's `ScrollArea`, with two
  of the docs' recipes baked in by default:

  - **Gradient scroll fade.** Content fades out at any edge it can still scroll
    toward and stays crisp at an edge it's flush against, driven live by base-ui's
    per-edge overflow metrics. `orientation="both"` composites the two axis masks
    (`mask-composite: intersect`) to round the fade off on all four edges.
  - **Hover-reveal scrollbars.** Native scrollbars are hidden; a slim neutral thumb
    fades in only while the area is hovered or scrolled (base-ui's `data-hovering` /
    `data-scrolling`), then lingers briefly and fades back out.

  `orientation` (`"vertical"` (default) | `"horizontal"` | `"both"`) picks which
  axes scroll; `both` also renders the corner where the two scrollbars meet. A
  scrollbar only appears for an axis whose content actually overflows. Give the
  area a bounded size via `className` / `style`.

  Also exports `ScrollAreaProps` and `ScrollAreaOrientation`.

- cc4761e: Add a `Select` component — a "form control" element type for choosing from a
  list, built on base-ui's `Select` (listbox semantics, keyboard navigation,
  typeahead) and wrapped in a `Field` for label / description / error association,
  like `TextInput` and `RadioGroup`. It takes a `state` (not intent/saliency).

  Discriminated on `multiple`, so `value` / `onChange` stay in lockstep:

  - **single** (`multiple` omitted / `false`) — `value: string | null`,
    `onChange: (v: string | null) => void`; the chosen option shows a trailing
    check.
  - **multiple** (`multiple`) — `value: string[]`,
    `onChange: (v: string[]) => void`; each option composes an `InternalCheckbox`
    reflecting whether it's selected.

  Options are `ReadonlyArray<{ label; value; disabled? }>`. A per-option `disabled`
  maps to base-ui's `aria-disabled` (never the native attribute), keeping the
  option in the listbox's accessibility tree.

  Also supports `label`, `description`, `errorMessage`, `size` (`sm | md | lg`),
  `placeholder`, `required`, `name`, `loading` (busy spinner in place of the
  chevron), and a clear button (suppress with `hideClearButton`). Disabled follows
  the system convention — `aria-disabled` + base-ui's `readOnly`, so the trigger
  stays keyboard-focusable.

- d6e8452: Add a `Checkbox` component.

  A single boolean "form control", built on base-ui's `Checkbox` for behaviour
  (role, keyboard, form wiring) and wrapped in a `Field` for ARIA, the same way
  `TextInput` and `RadioGroup` are.

  - **Visual is `InternalCheckbox`:** slotted in via base-ui's `render` prop —
    base-ui owns the focusable `role="checkbox"` element and feeds it
    `data-checked` / `data-disabled` / `data-invalid`, while `InternalCheckbox`
    owns the look (box, glyph, focus ring).
  - **Explicit labelling:** because base-ui's hidden `<input>` is `aria-hidden`, a
    wrapping `<label>` would only name _it_, not the box — so the box is named
    explicitly with `aria-labelledby` pointing at the visible label.
  - **Smaller API than `RadioGroup`:** a checkbox is one boolean, so `value` is a
    `boolean` and validation is a plain `invalid` flag rather than a full
    `FormState`.

- e1026c5: Extract the margin/padding props into reusable `MarginProps` and `PaddingProps`
  interfaces, and add spacing props to `Text` and `Heading`.

  - **`MarginProps` / `PaddingProps`:** the `m` / `mx` / `my` / `mt` / `mr` / `mb`
    / `ml` (margin, supports `auto`) and `p` / `px` / `py` / `pt` / `pr` / `pb` /
    `pl` (padding) prop sets, wired to the spacing scale (each responsive-capable),
    now live in one shared place and are exported from the package root. `Box`,
    `Flex`, and `Grid` consume them instead of re-declaring the props inline — no
    change to their public API.
  - **`Text` / `Heading`:** gain the full margin/padding shorthand props, so text
    and titles can be spaced without wrapping them in a layout primitive.

- d4cd7d9: Expand `Card` with interactive roots, a collapsible mode, and new compound parts.

  **New:**

  - **Clickable / linkable roots:** pass `onClick` or `href` (with optional
    `target` / `rel`, and the base-ui `render` prop for router links) to make the
    whole card activate / navigate. Following
    [Inclusive Components](https://inclusive-components.design/cards/), the card
    itself stays a plain container and its `Card.Header` **title** becomes the one
    real `<button>` / `<a>`, stretched over the whole surface with an `::after`
    overlay. So the accessible name is just the title (not the card's whole
    contents), and — unlike a card that _is_ a single control — you can still nest
    other controls (footer buttons, row actions): they sit above the overlay and
    stay independently clickable. Keyboard focus outlines the whole card, and the
    disabled model is the focusable one (`aria-disabled` + swallowed activation,
    never the native attribute — see AGENTS.md). `CardProps` is a discriminated
    union over the static / clickable / linkable modes, so the three are mutually
    exclusive.
  - **Collapsible card:** set `collapsible` (+ `open` / `defaultOpen` /
    `onOpenChange`) to collapse the content + footer away, leaving the header
    visible. A disclosure **button** in the header (the chevron, labelled by the
    title) toggles it — only that button, not the whole header, so the header can
    carry its own interactive content (chips, actions). Built on base-ui's
    `Collapsible`; a disabled collapsible card keeps its trigger keyboard-focusable
    but vetoes the toggle.
  - **`Card.Rows` + `Card.Row`:** a description list (`<dl>`) of rows, passed as a
    child of `Card`. Each `Card.Row` is one of two shapes — `term` + `description`
    (a `<dt>`/`<dd>` pair) or a rich `title` (+ optional `subtitle`) + `actions` row.
    A plain term/value row highlights on hover; a row that carries its own action
    does not (its action's hover is the affordance that matters).
  - **`Card.Actions`:** a row of buttons (the `actions` array) anchored to a `side`
    (`start` / `end`, default `end`). Drop it into a `Card.Footer` or a rich
    `Card.Row`.
  - **`Card.Header` `icon` + `chip`:** a leading glyph and a trailing element (e.g. a
    status `Chip`) alongside the title/subtitle.
  - **`Card.Footer` `actions`:** an actions slot (typically a `Card.Actions`),
    rendered after any footer children.

  The shared `surfaceRecipe` gains an `interactive` variant (hover/active washes
  computed in oklch from the default background) that powers the clickable/linkable
  card's surface.

  **Note:** an interactive `Card` is a container, not the control itself — its
  `Card.Header` title is the rendered `<button>` / `<a>` (and the `render` prop for a
  router link targets that link). A clickable/linkable card therefore needs a
  `Card.Header` with a `title` for the control's accessible name.

- 38e646d: Add an `SrOnly` utility component — visually-hidden text that stays in the
  accessibility tree.

  Use it to expose content to screen readers that is redundant or purely visual
  for sighted users: an accessible name for an icon-only control, extra context on
  a terse link (`Read more<SrOnly> about pricing</SrOnly>`), or a polite live
  region for status announcements.

  The content is hidden with the standard clip/rect technique — collapsed to a
  1×1px, clipped, out-of-flow sliver — deliberately **not** `display: none` or
  `visibility: hidden`, both of which would drop the node from the a11y tree.
  Renders a `<span>` by default; retarget it with the base-ui `render` prop.

- 709fd04: Add a `Button` component.

  A "component" element type sharing the colour scheme/recipe with `Chip`
  (`componentIntentRecipe` + `componentTypographyRecipe` + `focusRingRecipe`), so
  all 6 intents × 3 saliencies and the `sm` / `md` / `lg` sizes come for free.

  - **Required label:** `children` is required and is always the accessible name.
  - **No `aria-label`:** intentionally unsupported (typed as `never` and stripped
    at runtime) so the visible label can't be silently overridden.
  - **Focusable when disabled:** uses `aria-disabled` rather than the `disabled`
    attribute, so a disabled button stays keyboard-reachable; clicks and keyboard
    activation are suppressed.
  - **Loading:** `loading` disables interaction, sets `aria-busy`, and overlays a
    spinner on the label (the label stays in place to preserve width and the
    accessible name).
  - **Icons:** `startIcon` / `endIcon` render before/after the label and inherit
    the resolved foreground.
  - **Disabled explanation:** `disabledReason` shows a tooltip when a disabled
    button is tabbed to or hovered (suppressed while loading).

- 709fd04: Add a `Drawer` component.

  A "surface" element type shown in a panel that slides in from the edge of the
  screen. Its API mirrors `Popover` — it composes `header` / `footer` props (or
  `<Drawer.Header>` / `<Drawer.Footer>` children) around its content and takes the
  same `intent` / `saliency` / `padding` surface knobs (via `surfaceRecipe`).
  Built on base-ui's `Drawer`, so ARIA wiring, focus management, and
  swipe-to-dismiss are handled for you.

  - **Trigger:** `trigger` accepts a `<Drawer.Trigger>`, which renders a `Button`
    (all of Button's intents / saliencies / sizes / icons apply) wired with the
    right `aria-haspopup` / `aria-expanded`.
  - **Header labels the drawer:** `<Drawer.Header>` renders its `title` /
    `subtitle` through base-ui's `Drawer.Title` / `Drawer.Description`, so they
    become the drawer's accessible name and description.
  - **Close from inside:** `<Drawer.Close>` renders a `Button` that dismisses the
    drawer — drop it in a `<Drawer.Footer>` for actions.
  - **Side:** `side` slides the panel in from the `right` (default) or `left`; the
    swipe-to-dismiss gesture follows it.
  - **Loading state:** `loading` overlays a spinner on the body content (the header
    and footer stay live so the drawer can still be closed) and marks the panel
    `aria-busy`.
  - **Disabled state:** `disabled` makes the drawer non-dismissable — Escape, the
    close button, and swipe are all vetoed while a blocking action is in flight.
  - **Modal with an always-on backdrop:** the backdrop is force-rendered (even for
    nested drawers), the page behind is inert, and clicking outside never closes
    the drawer.

- 71ad145: Add `labelPosition`, `description` / `errorMessage`, and `aria-label` /
  `aria-labelledby` to `Switch`, bringing it in line with the other form controls.

  - **`labelPosition`** — `"top" | "start" | "end"` (default `end`). Placed with
    flex direction only, so `start`/`end` are inline-logical (RTL-safe) and the DOM
    order — and the accessible name — never move.
  - **`description`** — inline help under the row, wired to the control via
    `aria-describedby` (like `TextInput` / `RadioGroup`). Named `description` to
    match the rest of baritone's form controls rather than Rain's `helpText`.
  - **`errorMessage`** — validation text shown and announced under the row when the
    switch is `invalid`.
  - **`aria-label` / `aria-labelledby`** — name the control when there's no visible
    `label` (e.g. an icon-only switch); a visible `label` and an explicit
    `aria-labelledby` both take precedence over `aria-label`.

  The `value` prop remains the _checked state_, not a form-submission value — the
  same design note as `Checkbox`; base-ui's native string `value` is intentionally
  not surfaced.

- 3e43619: Add optional thumb icons to `Switch`.

  A glyph can now ride inside the sliding thumb, via a discriminated union so the
  two spellings can't be mixed:

  - **`icon`** — a single glyph reused for _both_ states; it stays in the thumb
    whether the switch is on or off.
  - **`activeIcon` + `inactiveIcon`** — a _different_ glyph per state (e.g. a check
    when on, a cross when off); both are required together.

  The glyph is decorative — the switch's accessible name still comes from `label`.
  Pass a bare `currentColor` `<svg>` (or an `<Icon>`); it's sized to the thumb and
  recoloured with the track's surface so it reads as a cut-out against the solid
  thumb fill (accent when checked, neutral when off). The presentational
  `InternalSwitch` gains the matching `activeIcon` / `inactiveIcon` props.

- 9d37894: Add `Tabs.Panel` panel-content composition to `Tabs` (DES-50), and confirm the
  existing `intent` / `saliency` / `initialValue` / `disabled` parity (DES-39).

  - `<Tabs>` now accepts `children`: pass one `<Tabs.Panel value={…}>` per tab
    `value` and base-ui shows the active one and wires the
    `aria-controls` / `aria-labelledby` pair both ways. Omit `children` to keep the
    old behaviour — just the tab strip, with the content for each `value` placed
    yourself.
  - `Tabs.Panel` renders a `role="tabpanel"` region. Panels are **lazy** by default
    (mounted on first activation); pass `keepMounted` to keep a panel in the DOM
    while hidden so it preserves state (scroll position, form input, an in-flight
    fetch) across tab switches.
  - Panel `value` is `string | number` — it isn't bound to the `Tabs` generic
    (panels are separate children), so keep it in sync with a tab's `value`.
  - No change to the tab strip itself: the `tabs` array, per-item
    `leadIcon` / `trailIcon`, `intent` / `saliency`, and controlled/uncontrolled
    (`initialValue`) modes all behave exactly as before — verified by new stories
    and tests covering panels with icons in both modes.

- 984a5c5: Add a `Tabs` component.

  A horizontal tablist for switching the active view, built on base-ui's `Tabs`
  (roving focus, arrow-key navigation, `tablist` / `tab` ARIA wiring). It renders
  only the tab strip — the content for each `value` is yours to show — and styles
  the active tab with the "component" colour family (`intent` x `saliency`).

  - **Type-safe over its values (like `RadioGroup`):** generic over `T`, inferred
    from the `tabs` array with a `const` type parameter so string/number literals
    survive without `as const`. Each tab's `value`, the controlled `value`, and the
    uncontrolled `initialValue` are all bound to that same union/enum — a stray
    value is a compile error (`NoInfer` keeps `T` coming from `tabs` alone).
  - **Controlled vs uncontrolled is a discriminated union:** pass `value` +
    `onChange` to drive it, or `initialValue` (or nothing — it seeds to the first
    enabled tab) to let it manage its own state. Mixing the two is a type error.
  - **`saliency`** (+ `intent`, default `neutral`): the active tab takes the
    `high` (filled) / `mid` (washed) / `low` (transparent + border) colour block,
    matching `Chip` / `Button`.
  - **`Tabs.Item` props** (`tabs` array entries): `value`, `label`, plus optional
    `disabled` and `leadIcon` / `trailIcon`.
  - **`disabled`:** dims the whole strip and vetoes selection, but the active tab
    stays keyboard-reachable (`aria-disabled`, never the native attribute — a
    disabled tab's selection is cancelled via base-ui's change event). A single
    `disabled` tab stays focusable-but-inert the same way.

- d6e8452: Add a `Switch` component.

  A single boolean "form control", built on base-ui's `Switch` for behaviour
  (role, keyboard, form wiring) and wrapped in a `Field` for ARIA, the same way
  `Checkbox`, `TextInput`, and `RadioGroup` are.

  - **Visual is `InternalSwitch`:** slotted in via base-ui's `render` prop —
    base-ui owns the focusable `role="switch"` element and feeds it
    `data-checked` / `data-disabled` / `data-invalid`, while `InternalSwitch`
    owns the look (track, sliding thumb, focus ring).
  - **Explicit labelling:** because base-ui's hidden `<input>` is `aria-hidden`, a
    wrapping `<label>` would only name _it_, not the track — so, exactly like
    `Checkbox`, the track is named explicitly with `aria-labelledby` pointing at
    the visible label.
  - **Same shape as `Checkbox`:** a switch and a checkbox are the same control
    (one boolean), so the API is deliberately identical — `value` is a `boolean`
    and validation is a plain `invalid` flag.

- 9000884: Add typographic props to `Text`, each backed by a vanilla-extract recipe variant
  with values sourced from tokens (no ad-hoc CSS):

  - **`weight`** (`default` | `semibold` | `bold` | `superbold`) — reads the new
    `text.weight` tokens and overrides the weight baked into the `variant`.
  - **`italic`** — renders the text in italics.
  - **`align`** (`start` | `center`) — horizontal text alignment.
  - **`wrap`** (`wrap` | `nowrap`) — whether the text wraps onto multiple lines.
  - **`wordBreak`** (`break-word` | `normal`) — how long words break.

  Adds a `superbold` (800) step to the font-weight scale and a `text.weight` token
  group to the theme contract.

- 138ba2b: Add `multiline`, `info`, and `slotProps` to `TextInput`.

  - **`multiline`** — renders a native `<textarea>` instead of an `<input>`, as a
    discriminated-union arm. Its height is driven by `rows` (default `3`); `rows`
    and the single-line `size` are mutually exclusive at the type level. The
    textarea is vertically resizable and keeps the same `state` model, ARIA wiring,
    and `aria-disabled` + `readOnly` disabled behaviour as the input.
  - **`info`** — extra explanation surfaced in an `InfoButton` (the "i" affordance)
    next to the `label`. Only rendered when there's a visible `label`. Name the
    button via `slotProps.info["aria-label"]` (defaults to "More information").
  - **`slotProps`** — per-slot overrides for the `label` / `description` / `info`
    pieces. A `className` set on a slot merges onto (doesn't replace) the built-in
    class.

  Also exports `TextInputSlotProps`, `SingleLineTextInputProps`, and
  `MultilineTextInputProps`.

- a36752b: Add a `ConfirmationModal` component — a focused confirm/cancel dialog built on
  `Modal` (DES-61).

  - Composes `Modal`, so the focus trap, Escape/backdrop behaviour, and ARIA wiring
    come for free. Adds an intent-tinted `icon` + `header`, the body, and a footer
    with a **cancel** button (dismisses) and a **confirm** button.
  - `intent` (`secondary` | `warning` | `negative`, default `negative`) colours the
    icon and the confirm button; the confirm's own `intent` is limited to the same
    set.
  - Actions take full `Button` props via `confirm` / `cancel`, or the
    `handleConfirm` / `handleCancel` callback shorthands. Confirm dismisses by
    default; call `event.preventDefault()` in the handler to keep it open for an
    async confirm.
  - `loading` shows the confirm spinner and locks the dialog (Escape / cancel /
    confirm can't dismiss it) while the action is in flight; `disabled` locks it for
    an unmet precondition. Both keep the buttons focusable via `aria-disabled`.
  - Controlled (`open` / `onOpenChange`, optional `trigger`) or uncontrolled
    (`trigger` required). Exposes `ConfirmationModal.Trigger` / `.Close` (the same
    parts as `Modal`).

- 984a5c5: Add a `ToggleGroup` component.

  A single-select segmented control — a row of toggle buttons where exactly one is
  selected — built on base-ui's `ToggleGroup` / `Toggle` (roving focus, arrow-key
  navigation, `group` ARIA wiring) and rendered with the same `InternalButton` that
  powers `Button`. The selected segment takes the "component" colour family
  (`intent` x `saliency`); unselected segments drop to a neutral `low` ghost.

  - **Type-safe over its values (like `RadioGroup`):** generic over `T`, inferred
    from `value`, with a render-prop that hands back a `ToggleGroupItem` bound to
    that same `T` — so a segment's `value` can only ever be a member of the same
    union/enum, and a stray value is a compile error. `T` is constrained to
    `string` (base-ui keys toggles by string).
  - **`intent` / `saliency` / `size`:** the selected segment's look, shared with
    `Button` / `Chip`. `saliency` defaults to `high` (filled).
  - **Keyboard — a toolbar-style roving tab stop, not a radio group (selection is
    manual, not on focus):** Tab moves into the group and lands on the _selected_
    segment; the arrow keys move focus between segments _without_ selecting; Enter
    (or Space) selects the focused segment.
  - **`disabled`:** dims the whole group and vetoes selection, but every segment
    stays keyboard-reachable — you can still Tab in and arrow between segments, you
    just can't change the value. Modelled with `aria-disabled` on the container + a
    veto in the change handler, never the native attribute (see AGENTS.md).

- cfb2aa3: Add uncontrolled mode and state-aware callback slots to `ToggleButton`. All
  additions are non-breaking — the existing controlled `value` + `onChange` API
  stays valid.

  - **Uncontrolled mode** — omit `value` and the component tracks its own pressed
    state, seeded from the new optional `defaultValue?: boolean`. `onChange` is
    now optional in both modes (a callback slot, not the source of truth).
  - **State-aware slots** — `icon` and `aria-label` may each be a function of the
    pressed state (`(pressed: boolean) => ReactNode | string`), so the glyph / name
    can flip with the toggle (e.g. Mute ⇄ Unmute).
  - **`onChange` now exposes the DOM event** — its signature is
    `(value: boolean, event: React.MouseEvent<HTMLButtonElement>) => void`.

- cff41a9: Add form-control affordances to `ToggleGroup` so it works as a **labelled form
  control**, not just a toolbar segmented control. All opt-in and non-breaking —
  the toolbar `intent` / `saliency` / `size` props are untouched.

  - **`label`** — a visible group label. When present the control renders field
    semantics: the group is named by the label (via `aria-labelledby`, taking
    precedence over `aria-label`) and the whole thing wraps in a `Field` for
    consistent label / help / error layout.
  - **`description`** — inline help under the group, wired to the group via
    `aria-describedby` (like `TextInput` / `RadioGroup`). Because the group isn't a
    base-ui `Field` control, the ARIA is wired explicitly rather than through
    `Field`'s auto-association.
  - **`errorMessage`** — validation text shown and announced under the group when
    `state` is `invalid`.
  - **`state`** — a `FormState` (`neutral | warning | invalid | valid`, default
    `neutral`). `invalid` flags the group `aria-invalid` and reveals the
    `errorMessage`; the toolbar `intent` / `saliency` still own the segment colours.
  - **`required`** — sets `aria-required` on the group.

  Disabled is unchanged — still modelled with `aria-disabled` + a change-handler
  veto (never the native attribute), so segments stay keyboard-reachable.

- f456568: `Tooltip`'s `content` now accepts only a `string`.

  **Breaking:** `content` previously also accepted a `string[]` to render each
  entry on its own line (backed by the internal `tooltipLines` style). That
  multi-line affordance has been removed — a tooltip should stay a short,
  supplemental hint; anything longer belongs in a `Popover`.

  Migration: pass a single `string`. If you were relying on multi-line tooltip
  content, move that copy into a `Popover` instead.

- 984a5c5: Add a `FileUpload` component.

  A "form control" element type for staging file(s) for upload: a dashed dropzone
  that opens the system file picker on click and accepts drag-and-drop. Staged
  files render below as a removable `FileList`. Built on base-ui's `Field` for
  label association and `invalid` → `aria-invalid` wiring, like `TextInput`.

  - **Discriminated union on `multiple`:** `value` / `onChange` are kept in lockstep
    — `multiple` ⇒ `FileInfo[]` (new selections/drops append), otherwise a lone
    `FileInfo | null` (a new pick replaces it). A mismatched pair is a compile error.
  - **Native drag-and-drop, no new dependency:** uses the HTML5 DnD API. A
    transparent file `<input>` overlays the zone to own clicks + keyboard, while
    drops are intercepted on the zone so they can be filtered against
    `acceptedFileTypes` (the native `accept` only constrains the picker).
  - **`acceptedFileTypes`:** a `string[]` in the HTML `accept` grammar — extensions
    (`.pdf`), wildcard MIME (`image/*`), or exact MIME (`application/pdf`); enforced
    on both the picker and the drop path.
  - **`invalid` / `required`:** negative accent + `aria-invalid`, and
    `required` / `aria-required` on the input.
  - **`disabled`:** dims the dropzone and vetoes the picker/drops, but the input
    stays keyboard-focusable (`aria-disabled`, never the native attribute — a file
    input ignores `readOnly`, so the picker is blocked by cancelling the click) and
    staged chips stay focusable-but-inert.
  - **`helpText`:** supplementary guidance shown beneath the dropzone, wired to the
    input as its accessible description (`aria-describedby`).
  - **Labelling:** a visible `label`, or `aria-label` / `aria-labelledby` for an
    external label.

### Patch Changes

- dac51d1: Stop a static `Badge` from advertising a hover it can't perform.

  `Badge` takes its colour from the shared `componentIntentRecipe` but never
  passed `interactive`, so it fell through to that recipe's `control` default and
  shifted its background on `:hover`/`:active` — an affordance on a `<span>` that
  is not a hit target. It now passes `interactive: "auto"`, resolving the
  affordance from the rendered element: the default `<span>` stays inert, while a
  badge given a `render` that makes it a link or button keeps the shift.

  This is the `Chip` fix (#68) applied to the other consumer of those recipes that
  wanted it. `Badge` never used `componentTypographyRecipe`, so it never took the
  `cursor: pointer` half — only the background.

- 75cc8c2: Fix `Chip`'s box metrics, and stop a static chip from advertising a click it
  can't perform.

  `Chip` borrows the shared `component` recipes from `Button` but only partly
  overrode them, so it inherited a control's proportions and affordances:

  - **The label didn't fit the chip.** Heights were 12/16/20px against a label line
    box needing 18/21/24px, so the text overflowed the border box at every size.
    They're now 20/24/28px — a step under the `Button` sizes they share a recipe
    with (24/32/40) and a step over `Badge` (16/20/24), which is the intended
    order: badge < chip < button.
  - **Adornment glyphs ignored the chip.** An `<Icon>` sizes its `1em` box from an
    absolute rem, so every glyph rendered a fixed 20px — taller than an `sm` chip
    is tall. A `Chip.Adornment` now takes the chip's `size` from context and scales
    its glyph (12/16/16), whichever glyph kind it's handed.
  - **Padding and gap were Button-sized** (8/12/16px inline, 8px gap) and are now
    tightened to a chip's density.
  - **The chip body no longer poses as a control.** Its hit targets are the label
    (given `onClick`/`popover`) and the adornments, each with their own
    affordances; the body itself took a pointer cursor and a hover background,
    promising a click that did nothing, and made its own text unselectable. A chip
    is now inert and selectable unless a `render` makes it a link, in which case
    both come back.

  The shared `componentIntentRecipe` / `componentTypographyRecipe` gain an
  `interactive` variant to express that last point (`control`, the default, is
  what every other consumer already did — `Button`, `Tabs`, and `Notice` are
  unaffected; `auto` resolves the affordances from the rendered element).

- f456568: `FileList` now sets stable `key`s on each item's download/remove actions and lead
  adornment, fixing the missing-key React warnings emitted when rendering a file
  list.
- f456568: `Select` now anchors its listbox consistently below the trigger. The positioner
  pins `side="bottom"`, `align="start"`, and `alignItemWithTrigger={false}`, so the
  popup always opens downward and start-aligned rather than overlaying the selected
  item on top of the trigger.

## 1.0.0-alpha.0

### Major Changes

- a07cffd: Refactor recipes for granularity, redesign the Card API, and upgrade base-ui.

  **Breaking changes:**

  - **base-ui:** the peer dependency moves from `@base-ui-components/react` to
    `@base-ui/react` (now `^1.6.0`). Update your install accordingly.
  - **Heading:** `level` is now **required** and is a number `1`–`6` (was an
    optional `'h1'`–`'h6'` string defaulting to `'h2'`). The number maps to the
    matching `h1`–`h6` tag.
  - **Text recipe:** `textRecipe` is split into `textIntentRecipe` (text + icon
    colour) and `textVariantRecipe` (typography variant). Compose both.
  - **Text colour:** `Text` no longer hard-codes a neutral/mid colour. By default
    it now inherits the ambient `--textColor` published by a surrounding `surface`/
    `component` (so text inside a coloured surface matches automatically), falling
    back to the neutral/mid token when standalone. Pass `intent` and/or `saliency`
    to override. `Text` placed inside a coloured surface will therefore change
    colour where it previously stayed neutral/mid.
  - **Component recipe:** `componentRecipe` is split into `componentIntentRecipe`
    (border / background / text / icon colour) and `componentTypographyRecipe`
    (layout, type, sizing). Compose both, plus `focusRingRecipe` for the ring.

  **New:**

  - **Ambient text colour:** new `textColorVar` (`--textColor`), the text-colour
    analogue of `iconColorVar`. The `surface` and `component` recipes publish their
    resolved foreground to it, and `Text` reads it by default — so a nested `Text`
    matches its surface/component without being told the intent.
  - **Focus ring recipe:** `focusRingRecipe` renders the focus ring from
    `--focusRingColor`. Its `type` variant selects `:focus-visible` or
    `:focus-within` so a component can choose its focus model.
  - **Card API:** `Card` is now a compound component — `Card.Header`
    (`title` / `subtitle`), `Card.Footer`, `Card.Bleed` (full-width content that
    negates the card padding), and `Card.Divider` (edge-to-edge rule). New
    `header` / `footer` props and an `as` prop (`div` | `section` | `main` |
    `article`).

- 9d3799e: Initial release: intent/saliency colour model with oklch relative-colour
  interaction states, a vanilla-extract theme contract + `createDesignSystemTheme`
  factory, shipped light/dark default themes, runtime inline theming, a build-time
  WCAG contrast check, and starter components (Chip, Text, Heading, Card,
  TextInput, Icon) on base-ui + React 19.
