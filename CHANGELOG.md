# @saintly-software/baritone

## 1.0.0-alpha.1

### Major Changes

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

### Minor Changes

- d4cd7d9: Add `icon` and `chip` props to `Accordion.ItemHeader`, mirroring `Card.Header`.

  - **`icon`** — a leading glyph (typically an `<Icon>`) before the title/subtitle
    stack.
  - **`chip`** — a trailing element (typically a status `<Chip>`) after the title,
    sitting just inside the disclosure chevron.

  Both render inside the item's trigger `<button>`, so keep them decorative — the
  title remains the trigger's accessible name. Headers with neither prop are
  unchanged.

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
