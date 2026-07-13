## How to build with Baritone

Baritone is a **props-and-tokens** design system built on Base UI + vanilla-extract. There are **no utility CSS classes** — you style by passing props to components and, for one-off values, by reading the exported `vars` token object. Never invent class names and never hardcode hex colours or raw `var(--…)` (the CSS custom properties are hashed and unstable).

### Required setup — theme scope + stylesheet (or everything renders unstyled)

Two things must be present or components fall back to unstyled defaults:

1. **Link the stylesheet once** at the app root: `import "@saintly-software/baritone/styles.css"` (bound copy: `_ds/<folder>/styles.css`, which `@import`s the tokens, fonts, and component CSS).
2. **Establish a theme scope**, one of:
   - Apply an exported theme **class** to a root element: `<div className={lightTheme}>` (also `darkTheme`). The class defines the token CSS variables the components read.
   - Or wrap in the **`BaritoneTheme`** provider for runtime/per-tenant tokens: `<BaritoneTheme tokens={buildDefaultTokens("light")} scheme="light">…</BaritoneTheme>` (`buildDefaultTokens(scheme, brandSeed?)` accepts a small `BrandSeed` — hue/chroma per intent, fonts, radius — and fills in the rest).

**Overlay gotcha:** Modal, Drawer, Popover, Menu, Combobox, Select, and Tooltip portal to `document.body`, _outside_ your React tree. Put the theme class on `<html>`/`<body>` (or use `<BaritoneTheme render={<body />}>`) or open overlays render unthemed.

### The design language — shared props

Most components accept these (see each component's `.d.ts` for its exact set):

- `intent`: `primary` | `secondary` | `neutral` | `warning` | `negative` | `positive`
- `saliency`: `high` | `mid` | `low` (prominence: `high` = filled, `mid` = tinted, `low` = outline)
- `size`: `sm` | `md` | `lg`
- Buttons also take `appearance` (`solid` | `text`); typography (`Text`) takes `variant` (`xs`|`sm`|`base`|`lg`|`xl`), `Heading` takes `level` (1–6).

**Layout** is done with components, not raw divs + CSS: `Box`, `Flex`, `Grid` (with `Card`, `CardList`, `Lockup`, `MetricCard` for surfaces). Compose real Baritone components for the controls; use `Box`/`Flex`/`Grid` for arrangement.

**One-off values** come from the exported **`vars`** token object, e.g. `style={{ background: vars.surface.color.neutral.low.default.bgc, color: vars.text.color.neutral.mid }}`. `cx(...)` joins classNames when you need to.

### Where the truth lives

- The stylesheet closure: `_ds/<folder>/styles.css` and its imports (read before styling).
- Per component: `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants) and `<Name>.d.ts` (full prop types).

### Idiomatic snippet

```tsx
import "@saintly-software/baritone/styles.css";
import {
  lightTheme,
  Card,
  Heading,
  Text,
  Button,
  Flex,
  TextInput,
} from "@saintly-software/baritone";

<div className={lightTheme}>
  <Card saliency="high" style={{ display: "grid", gap: 16, width: 320 }}>
    <Heading level={3}>Account</Heading>
    <Text saliency="mid">Everything here is themed by the wrapping scope.</Text>
    <TextInput label="Display name" placeholder="Ada Lovelace" />
    <Flex gap="2">
      <Button intent="primary" saliency="high">
        Save
      </Button>
      <Button intent="neutral" saliency="low">
        Cancel
      </Button>
    </Flex>
  </Card>
</div>;
```
