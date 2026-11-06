---
"@saintly-software/baritone": minor
---

Add `Tabs.Panel` panel-content composition to `Tabs` (DES-50), and confirm the
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
