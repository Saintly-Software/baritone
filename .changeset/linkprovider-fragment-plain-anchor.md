---
"@saintly-software/baritone": patch
---

`LinkProvider` now leaves a **fragment-only** `href` (`#footnote-1`) a plain
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
