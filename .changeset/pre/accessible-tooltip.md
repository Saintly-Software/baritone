---
"@saintly-software/baritone": minor
---

Add an accessible `Tooltip` component. Unlike `InaccessibleTooltip`, its trigger
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
