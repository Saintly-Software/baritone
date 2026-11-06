---
"@saintly-software/baritone": patch
---

Margin props (`m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`) now take effect on `Text` and `Heading`. The typography recipe's `margin: 0` reset is now zero-specificity (`:where()`), so it still strips the browser's default `<p>`/`<h*>` margins but no longer overrides the margin atoms. The same applies to other surfaces built on `textSizeRecipe`.
