---
"@saintly-software/baritone": minor
---

Add an icon-only arm to `<Link appearance="button">` — a square, label-less
button-styled link carrying a single glyph — the anchor mirror of `Button`'s
icon-only look.

```tsx
<Link
  appearance="button"
  icon={<Icon>…</Icon>}
  aria-label="Back to entry details"
  render={<RouterLink to="/entries/42" />}
/>
```

`ButtonLinkProps` is now discriminated on the presence of `icon`, exactly like
`Button` splits its labelled arms from `IconButtonProps`:

- **Labelled arm** (`LabelledButtonLinkProps`) is unchanged: `children` required,
  `startIcon`/`endIcon`/`width` allowed, and `aria-label` a type error (the
  visible label is the accessible name).
- **Icon-only arm** (`IconButtonLinkProps`) is selected by `icon` +
  `aria-label`: `aria-label` is **required** (there's no visible text to name
  it), and `children`/`startIcon`/`endIcon`/`width` are all `never`. `width`
  drops out because the square treatment pins a 1:1 `aspect-ratio`, so `fill`
  would inflate the link into a container-sized square. `icon` is typed
  `NonNullable<React.ReactNode>` (the same tightening applied to `Button`'s
  `IconButtonProps`), so a nullish value can't select the icon-only arm and
  render an unnamed control.

> **Types (source-only migration; no runtime change).** `ButtonLinkProps` is now
> a union (`LabelledButtonLinkProps | IconButtonLinkProps`) rather than a single
> interface, and both arms are exported. If you `extend`ed `ButtonLinkProps`,
> extend `LabelledButtonLinkProps` instead; if you read
> `children`/`startIcon`/`endIcon`/`width` off a `ButtonLinkProps` value, narrow
> on `icon` first.

It reuses the existing styling path (`InternalButton` /
`InternalGenericButtonAnchor`) rather than duplicating the square recipe, so an
icon-only button-link is **pixel-identical** to an icon-only `Button` at the same
`intent`/`saliency`/`size`. Both destination seams still work — `href` for a
plain external `<a>`, `render` for a router link, and the ambient `LinkProvider`
when neither is set. `loading`, `disabled`, and `disabledReason` behave as on the
labelled button-link: disabled collapses to an inert, role-less element that keeps
the button styling and is out of the a11y tree as a link. Because the icon-only
arm has no visible text, its name is re-exposed there as visually-hidden
_content_ (`aria-label` is prohibited on a role-less element), so the disabled
control stays perceivable — matching how the labelled arm's visible text does.

This removes a footgun: an icon-only navigation control previously had to be
built by passing an `<Icon>` as `children` to the labelled arm — producing an
anchor with no accessible name — with the only fix being to smuggle an
`aria-label` in through the `render` element, sidestepping the very type
constraint meant to protect the name. `appearance="text"` stays label-only (a
bare underlined glyph reads as neither a link nor a button) and
`appearance="chip"` keeps its decorative `icon`/`trailIcon` alongside a required
label; neither gains an icon-only arm.
