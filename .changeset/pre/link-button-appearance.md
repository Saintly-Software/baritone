---
"@saintly-software/baritone": minor
---

Add a button-styled `appearance="button"` arm to `Link`.

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
