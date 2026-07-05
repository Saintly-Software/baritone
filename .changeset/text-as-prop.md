---
"@saintly-software/baritone": major
---

Add an `as` prop to `Text` and change its default element.

- **`as`:** a shorthand to pick a plain element tag — `div`, `p`, `label`, or
  `span`. It's typed mutually exclusive with `render` (the full base-ui escape
  hatch), so passing both is a compile error.
- **Breaking — default element:** `Text` now renders a `<div>` by default (was a
  `<span>`), so bare `<Text>` is block-level. Use `as="span"` where you need
  inline text.

Colour behaviour is unchanged: `Text` still inherits the ambient `--textColor`
from a surrounding surface/component and falls back to neutral/mid when
standalone.
