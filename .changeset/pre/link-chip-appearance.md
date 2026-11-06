---
"@saintly-software/baritone": minor
---

Add a chip-styled `appearance="chip"` arm to `Link`.

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
