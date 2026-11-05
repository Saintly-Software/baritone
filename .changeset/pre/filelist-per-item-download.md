---
"@saintly-software/baritone": minor
---

Add per-item `download` and `FileList.Item` composition to `FileList`.

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
