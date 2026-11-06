---
"@saintly-software/baritone": minor
---

Give `Badge` a `shape` axis (`round` — default — or `square`) that is orthogonal
to its content kind, so every kind can be squared: `4` content kinds × `2` shapes.

- **`round`** keeps the fully-rounded pill/circle silhouette.
- **`square`** swaps in softly-rounded corners.

The content-less kind is renamed from **dot** to **blank** (a square content-less
badge isn't a dot): a round blank still renders as a small dot, a square blank as
a small rounded square. The exported `BadgeDotProps` type is accordingly renamed
to `BadgeBlankProps`, and a new `BadgeShape` type is exported.
