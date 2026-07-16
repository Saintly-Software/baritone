# baritone

`@saintly-software/baritone` — a whitelabel-first React design system. Colours are expressed as **intents** and
**saliencies** (not raw palettes), interaction states are derived from tokens
with **oklch relative-colour math**, and theming is just swapping a CSS class.

Built on **vanilla-extract** (recipes + sprinkles) and **base-ui** (React 19).

---

## Concepts

### Intent + Saliency

Instead of "colours", components take an **intent** (the semantic role) and a
**saliency** (how bold/attention-grabbing it should be).

- **Intents:** `primary`, `secondary`, `neutral`, `warning`, `negative`,
  `positive`.
- **Saliencies:** `high` (bold, the main shade), `mid` (washed/pastel),
  `low` (transparent background + border). Surfaces only have `high`/`low`.

```tsx
<Chip intent="negative" saliency="high">
  Delete
</Chip>
// renders the same colour scheme as a Button with the same props
```

### Element types

| Type         | Components (starter) | Colour API                       |
| ------------ | -------------------- | -------------------------------- |
| Surface      | `Card`               | `intent` + `saliency` (high/low) |
| Text         | `Text`, `Heading`    | `intent` + `saliency`            |
| Form control | `TextInput`          | `state`                          |
| "Component"  | `Chip`, `Icon`       | `intent` + `saliency`            |

Form controls take a `state` instead: `neutral | warning | invalid | valid`
(`invalid` → negative, `valid` → positive).

Every form control is built on the **`Field`** primitive, which owns the label /
help / error layout and the ARIA wiring — so they all share one contract:
`label` / `aria-label` / `aria-labelledby` (mutually exclusive — pass exactly
one), `helpText` (wired to `aria-describedby`, and combined with any you set
yourself), `errorMessage`, `state`, `disabled`, `labelPosition`, and
`slotProps.label` / `slotProps.helpText`. Compose it directly to build your own:

```tsx
<Field label="Email" helpText="We'll never share it.">
  <Field.Control render={<input />} />
</Field>
```

### Interaction states via oklch

Hover/active are **not** tokens. The `default` colour lives in a CSS variable and
hover/active are computed at use-site with [CSS relative colour syntax]:

```css
background: oklch(
  from var(--c) calc(l + var(--oklch-operator) * 0.02) calc(c + var(--oklch-operator) * 0.01) h
);
```

`--oklch-operator` is `-1` on light themes (darken on interaction) and `+1` on
dark themes (lighten) — set once per theme. Low-saliency (transparent) elements
hover to the intent's `mid` shade instead.

> **Browser support:** relative colour syntax is [Baseline 2024]. The system
> already requires oklch, so this is the supported floor; there is no Sass/JS
> precomputation fallback.

---

## Install

```sh
pnpm add @saintly-software/baritone
# peers:
pnpm add react react-dom @base-ui/react
```

Import the pre-compiled stylesheet **once** at your app root, then apply a theme
class:

```tsx
import "@saintly-software/baritone/styles.css";
import { lightTheme, Chip } from "@saintly-software/baritone";

export function App() {
  return (
    <div className={lightTheme}>
      <Chip intent="primary" saliency="high">
        Save
      </Chip>
    </div>
  );
}
```

The pre-compiled CSS means consumers do **not** need the vanilla-extract bundler
plugin.

---

## Theming / whitelabeling

1. **The contract.** The token shape is defined once as a vanilla-extract
   `createThemeContract` (`vars`). It is the contract between design and code.
2. **Default themes.** `lightTheme` / `darkTheme` are shipped, fully-authored
   reference themes (also a copy-paste starting point — see
   `buildDefaultTokens`).
3. **Author a brand (build time).** Use the factory inside a `.css.ts` file:

   ```ts
   // brand.css.ts
   import { createDesignSystemTheme, buildDefaultTokens } from "@saintly-software/baritone";

   export const acmeLight = createDesignSystemTheme(
     { ...buildDefaultTokens("light") /* override any tokens */ },
     { scheme: "light", name: "acme-light" },
   );
   ```

   `createDesignSystemTheme` sets `oklchOperator` from `scheme` and returns a
   theme **class**. Apply it to a root element; swap it to switch brand or
   light/dark. Nesting is supported, so a subtree can use a different brand.

4. **Runtime-unknown brands.** When a tenant's colours only arrive at runtime,
   skip the compiler and map tokens to inline CSS variables:

   ```tsx
   import { createInlineTheme } from "@saintly-software/baritone";

   const style = createInlineTheme(tenantTokens, { scheme: "light" });
   return <div style={style}>...</div>;
   ```

Light/dark is **the consumer's call** — the package never auto-switches on
`prefers-color-scheme`; it just produces both classes.

---

## Accessibility

- **Contrast:** because tokens are dev-supplied, a build-time WCAG AA check
  (`findContrastIssues` / `warnOnContrastIssues`) warns on failing
  text-on-background pairings rather than silently shipping low contrast. It runs
  automatically (non-production) inside `createDesignSystemTheme`.
- **Focus:** a shared `focusRingRecipe` draws the ring with `outline` (so layout
  never shifts) from the element's `focus` token, exposed as `--focusRingColor`.
  Its `type` variant picks `:focus-visible` (the element itself) or
  `:focus-within` (a descendant), so each component opts into one model.
- **Disabled:** every interactive component models disabled with `aria-disabled`
  (not the native `disabled` attribute) so the element stays in the tab order and
  keyboard-reachable — e.g. a disabled control can still be focused to surface an
  explanatory tooltip/reason. Form controls (`Checkbox`, `Switch`, `RadioGroup`,
  `CheckboxGroup`, `TextInput`) pair it with `readOnly`, which vetoes the
  change/toggle while keeping focus. This is a hard rule, enforced by a test
  (`src/test/aria-disabled-convention.test.ts`) and documented for contributors in
  [`AGENTS.md`](./AGENTS.md).
- **Motion:** all transitions are gated behind
  `@media (prefers-reduced-motion: reduce)`.

---

## Component API conventions

- Colour props: `intent` (default `neutral`) + `saliency` (default `mid` for
  components/text, `low` for surfaces, `high` for headings). Form controls take
  `state`.
- `size` (`sm | md | lg`, default `md`) on `Chip`, `Icon`, and `TextInput`.
- **Polymorphism** via base-ui's `render` prop (no `asChild`): pass an element to
  render _as_ (props/refs/classNames are merged) or a function for full control.
- `className` is merged last; there's no token-bypassing `style` escape hatch on
  the colour API.
- Every variant prop is backed by a vanilla-extract recipe variant, so the
  type-safe API is the source of truth.

---

## Non-colour tokens

Spacing, radius, border width, shadow, z-index, motion, and typography all live
in the same contract. **Breakpoints** are static constants (CSS variables can't
be used in `@media` conditions) and wire into the Sprinkles `atoms()` responsive
props.

---

## Scripts

```sh
pnpm build            # Vite library build (ESM + single styles.css + d.ts)
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest
pnpm storybook        # component docs across intents/saliencies/states
pnpm changeset        # add a changeset (semver + changelog)
```

## Not used

By request: no shadcn / shadcn-ui, no Tailwind, no Sass/SCSS.

[CSS relative colour syntax]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors
[Baseline 2024]: https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility
