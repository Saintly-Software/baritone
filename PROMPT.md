Hi there AI Friend, I would like for you to build a design system.

> **A note on the `> Proposed:` blocks.** Throughout this document you'll see
> blockquotes marked **Proposed**. These are decisions I (the prompt author)
> have made to close gaps that would otherwise force you to guess. Treat them as
> binding requirements *unless* they're internally contradictory, in which case
> stop and ask me.

## Colours

### Intents

I like the concept of "Intent" instead of colour as it helps with whitelabeling.

Each intent maps to a set of colours – a single colour and a bunch of shades around that colour.

These intents are:

- Primary: matches the brand colour; should only be used for elements that represent the MAIN ACTION, e.g. submitting a form
- Secondary: a secondary brand colour; used more often than primary because it's not as "important"; can represent most non-primary actions, non-destructive actions, etc.
- Neutral: often grayscale, similar use case to Secondary
- Warning: an action that is reversible but significant; think "locking a credit card". It's reversible but it has a big impact!
- Negative: an action that is irreversible and significant – permanently deleting an entity
- Positive: an action that indicates something was successful (often used for toasts)

### Saliency

Not all components will use the exact same set of colours; sometimes actions are "less destructive" than others. For example, hitting "Back" on a form. You will lose your changes, sure, but it doesn't need to be BRIGHT ORANGE. It could be a more dulled shade of orange.

I describe these levels of "boldness" as saliency.

- High saliency: used to draw attention to, often the main button in an area
- Mid saliency: somewhat important but often a "secondary" action, or the main action in a section but not on an entire page
- Low saliency: for all other uses

### Examples of colour + saliency

Here's some examples (illustrative of what high/mid/low should *look* like — the actual values come from the dev-supplied tokens):

| Intent    | Saliency | Colour      |
|-----------|----------|-------------|
| Primary   | High     | #6cffe6     |
| Primary   | Mid      | #e2fffa     |
| Primary   | Low      | transparent |
| Secondary | High     | #a46bff     |
| Secondary | Mid      | #dbc4ff     |
| Secondary | Low      | transparent |

### The colour system

Assume that the token colours are supplied to you in the `oklch` colour space. This lets us use oklch math to derive hover & active states from a token's `default` value, instead of needing separate hover/active tokens.

The `h` value will remain consistent – only the `l` and `c` will be used to modify existing shades. These are relatively small values: 0.02 for `l` and 0.01 for `c`. So a hover state would be a delta of `0.02 l` and `0.01 c` from the original value, whereas an active state would be a delta of `0.04 l` and `0.02 c`.

On light themes, the values will decrease (darken). On dark themes, the values will increase (lighten).

> **Proposed — how to actually implement the oklch math (this was a real
> tension with vanilla-extract, which is static and can't do runtime math):**
>
> Use **CSS relative colour syntax** rather than pre-computing hover/active into
> tokens. The base (`default`) colour lives in a CSS variable; hover/active are
> computed in the recipe at use-site:
>
> ```css
> /* default colour stored as e.g. var(--c) = oklch(...) */
> background: oklch(from var(--c)
>   calc(l + var(--oklch-operator) * 0.02)
>   calc(c + var(--oklch-operator) * 0.01)
>   h);
> ```
>
> - **Theme direction** is handled by the single per-theme `oklchOperator`
>   token (CSS var `--oklch-operator`): `-1` on light themes (darken on
>   interaction), `+1` on dark themes (lighten). This puts the light/dark
>   direction logic in exactly one place.
> - **Clamping:** oklch clamps `l` to `[0,1]` and `c` to `≥0` automatically, so
>   deltas at the extremes are safe, but verify the active state of the darkest
>   and lightest shades still reads as a state change.
> - **Hover/active are therefore NOT tokens.** The token tree only stores
>   `default` and `disabled` (see structure below); interaction states are
>   computed from `default`.
> - **Transparent (low-saliency) backgrounds are special.** A `bgc` of
>   `transparent` has alpha 0, so the L/C deltas above produce no visible
>   change. For low saliency, **hover** uses the intent's `mid.default.bgc`
>   (the washed-out shade) as the background, and **active** applies the active
>   delta to *that* colour — not to the transparent `default`.
> - **Browser support:** relative colour syntax is Baseline-2024-ish. Since the
>   whole system already requires oklch, this is an acceptable floor. Document
>   it. Do not build a Sass/JS pre-computation fallback unless I ask.

### Design system tokens

Design system tokens lead to a better developer experience, in my opinion, as well as more functional communication between devs and designers.

> **Proposed — the dev supplies these tokens directly.** Rather than supplying a
> raw palette that the system maps into semantic roles, **the developer supplies
> the design system tokens themselves** (matching the structure below). The
> system does not derive them from a palette. In my experience a lot of palette
> shades go unused anyway, so the semantic token set *is* the colour input.
> `high`/`mid`/`low` and the intents remain the vocabulary the dev authors
> against; the Examples table above shows the intended look of each saliency.

The design system tokens "structure" should be like the following:

```json
{
    "surface": {
        "color": {
            "<intent>": {
                "<saliency>": {
                    "default": {
                        "bgc": "oklch(...)",
                        "text": "oklch(...)",
                        "border": "oklch(...)",
                    },
                    "disabled": {
                        "bgc": "oklch(...)",
                        "text": "oklch(...)",
                        "border": "oklch(...)",
                    },
                }
            }
        },
        "borderRadius": "...",
        "focus": {
            "<intent>": "oklch(...)"
        }
    },
    "component": {
        "color": {
            "<intent>": {
                "<saliency>": {
                    "default": {
                        "bgc": "oklch(...)",
                        "text": "oklch(...)",
                        "border": "oklch(...)",
                    },
                    "disabled": {
                        "bgc": "oklch(...)",
                        "text": "oklch(...)",
                        "border": "oklch(...)",
                    },
                }
            }
        },
        "borderRadius": "...",
        "focus": {
            "<intent>": "oklch(...)"
        }
    },
    "form": {
        "color": {
            "<state>": {
                "background": "oklch(...)",
                "border": "oklch(...)",
                "placeholder": "oklch(...)",
            }
        },
        "borderRadius": "...",
        "focus": {
            "<intent>": "oklch(...)"
        }
    },
    "text": {
        "color": {
            "<intent>": {
                "<saliency>": "oklch(...)"
            }
        },
        "variant": {
            "body": {
                "<size>": {
                    "fontSize": "...",
                    "lineHeight": "...",
                    "fontWeight": "..."
                }
            },
            "title": {
                "<size>": {
                    "fontSize": "...",
                    "lineHeight": "...",
                    "fontWeight": "..."
                }
            }
        }
    },
    "oklchOperator": -1
}
```

> **Proposed — clarifications to the token structure:**
> - `<intent>` ∈ `primary | secondary | neutral | warning | negative | positive`.
> - `<saliency>` ∈ `high | mid | low` for `component` and `text`; **only**
>   `high | low` for `surface` (do not emit `mid` surface tokens).
> - `text.variant` has two families: `body` ∈ `xs | sm | base | lg | xl` and
>   `title` ∈ `sm | base | lg | xl | 2xl | 3xl | 3.5xl | 4xl`. Each variant
>   bundles `{ fontSize, lineHeight, fontWeight }` from the Typography scale.
>   `Text` renders `body` variants; `Heading` renders `title` variants.
> - `<state>` for `form` ∈ `neutral | warning | invalid | valid` (see Form
>   Controls). `invalid` maps to the `negative` intent, `valid` to `positive`.
> - `oklchOperator` is the per-theme interaction-direction sign for the
>   relative-colour math: `-1` on light themes (darken on hover/active), `+1`
>   on dark. The shipped default theme is light, hence `-1`.
> - This JSON is the **contract**, not final values. See Whitelabeling: it
>   becomes a vanilla-extract `createThemeContract`, and the dev supplies a
>   matching set of values (their theme) applied via `createTheme`.

## Element types

There are roughly 4 "types of elements":

1. Surfaces
2. Text
3. Form Controls
4. "Components"

### Surfaces

Surfaces are containers for other elements. Examples:

- Card
- Page
- Accordion
- Tabs
- Popover
- Tooltip
- "Notice" (banner elements, e.g. "Your last payment was declined." – often includes text, an icon, and action elements like buttons) – as well as "Toast"

Most of these will be using the neutral intent – Notice is an exception.

There are only 2 levels of saliency for surfaces: "high" and "low". Low is the default, which is the default neutral background, and borders (if applicable). "High" is a washed out colour similar to the "Mid" saliency for text and "components" (see below)

Most surfaces should only support the neutral intent because that is often what is needed. The Notice component can support other intents, though.

### Text

Text is plain text. Supports all levels of saliency and all intents.

Mid saliency is the default for all body text.

Lowest saliency is a very light colour which should only be used when there is some sort of alternative text to read. For example, when a button is disabled, it should have a tooltip explaining why it's disabled, and the button text itself can be very light.

High saliency is used for form control labels, headings.

Icon colours match the surrounding text colour. Mechanically: `Text` sets a
scoped CSS variable (`--iconColor`) to its resolved text colour, and an `Icon`
rendered inside it reads that variable automatically. A **standalone** `<Icon>`
(used directly, not inside `Text`) takes `intent`/`saliency` like any other
component and sources its colour from the `component` tokens.

Typography (type scale, weights, families, line-heights) is specified in the **Typography** section below.

### Form Controls

Form Controls include:

- text input
- checkboxes
- switches
- radio buttons
- sliders
- number inputs (e.g. with + and - icons)
- selects / comboboxes / autocompletes
- file upload
- toggle groups

Form controls do not need to support "intent" or "saliency". However, they do need to support some sort of a "state" to indicate if there is something incorrect (or explicitly correct) about them. Think: neutral state ; warning state (e.g. user is submitting a low value when the average is much higher) ; invalid state (maps to "negative" intent) ; explicitly valid state (maps to "positive" intent)

> **Proposed — closed set of form states + their intent mapping:**
> `state` ∈ `neutral | warning | invalid | valid`. The dev supplies
> `form.color.<state>.{ background, border, placeholder }` tokens for each.
> Semantically:
>
> | State    | Maps to intent |
> |----------|----------------|
> | neutral  | — (neutral)    |
> | warning  | warning        |
> | invalid  | negative         |
> | valid    | positive        |
>
> Form controls still need focus and disabled states (see Element States). The
> focus ring colour comes from `form.focus.<intent>`, where `<intent>` is the
> state's mapped intent (neutral state → use the `primary` focus ring).

### "Components"

This is the catch all for the other elements that are available. Examples include but are not limited to:

- Button
- Chip
- Badge
- Avatar
- Icon

These elements support all intents and all levels of saliency. Their colour schemes are identical – that is to say:

```
<Button intent='negative' saliency='high' />

<Chip intent='negative' saliency='high'>
```

Will render very similar elements! The following attributes would be shared between them:

- Text colour
- Icon colour (if applicable)
- Background colour (incl. hover + pressed states)

Regarding saliency:

- High saliency is very bold – i.e. the main colour of that intent's shades
- Mid saliency is more washed out – a pastel-ish shade of that intent
- Low saliency is a transparent background – but with a border

(These are authoring guidance for the values the dev puts in each `component.color.<intent>.<saliency>` token — see the Examples table above.)

## Element states

All interactive elements must support a focus ring and a disabled state.

`aria-disabled` should be used instead of `disabled` as the former allows for keyboard navigation to that element.

Focus should be the same as the default state but with a focus ring. Note that focus can be combined with hover, active, and disabled too.

> **Proposed — state precedence and ring spec:**
> - **Precedence:** `disabled` overrides hover/active (a disabled element shows
>   no hover/active change) but can still receive focus (because we use
>   `aria-disabled`). Order: `disabled` > `active` > `hover` > `default`; focus
>   ring is additive on top of any of these.
> - **Focus ring:** use the relevant element's `focus.<intent>` token
>   (`surface.focus`, `component.focus`, or `form.focus`) as the ring colour, rendered via
>   `outline` (or `box-shadow` if you need inset/offset control) so it never
>   shifts layout. Respect `:focus-visible`, not `:focus`.
> - **Disabled visuals:** use the element's supplied `disabled` token value(s);
>   cursor `not-allowed`; `aria-disabled` set; interactive handlers no-op'd.

## Typography (NEW — was deferred; needed for Text + Heading)

> **Proposed — fill in or adjust the scale; the agent should treat these as
> tokens in the same contract.** Family is dev-supplied like the colour tokens.
>
> - **Families (tokens, dev-supplied):** `font.sans`, `font.mono`. Provide
>   sensible system-font fallbacks.
> - **Type scale (rem):** `xs 0.75`, `sm 0.875`, `base 1`, `lg 1.125`,
>   `xl 1.25`, `2xl 1.5`, `3xl 1.875`, `3.5xl 2`, `4xl 2.25`.
> - **Weights:** `regular 400`, `medium 500`, `semibold 600`, `bold 700`.
> - **Line-heights:** `tight 1.2`, `normal 1.5`, `relaxed 1.7`.
> - **Variants (live in the `text.variant` token group):** `body` ∈
>   `xs | sm | base | lg | xl` and `title` ∈
>   `sm | base | lg | xl | 2xl | 3xl | 3.5xl | 4xl`. Each variant bundles a
>   `fontSize`/`lineHeight`/`fontWeight` drawn from the scale above.
> - **Text** renders `body` variants (default `body/base`, regular,
>   mid-saliency). **Heading** renders `title` variants + high-saliency colour.
> - Heading takes both a semantic `level` (`h1`–`h6`, for the document outline)
>   and a visual `variant` override, so an `<h2>` can render any `title` size.
>   Default level → variant mapping: `h1 → 3.5xl`, `h2 → 3xl`, `h3 → 2xl`,
>   `h4 → xl`, `h5 → lg`, `h6 → base`.

## Non-colour tokens (NEW — a design system needs more than colour)

> **Proposed — include these token categories in the contract. Adjust values to
> taste; the structure matters more than the exact numbers.**
> - **Spacing scale:** `0, 1(4px), 2(8px), 3(12px), 4(16px), 6(24px), 8(32px),
>   12(48px), 16(64px)`.
> - **Radius:** `none, sm, md, lg, full`.
> - **Border width:** `thin(1px), thick(2px)`.
> - **Shadow:** `sm, md, lg` (define in oklch-friendly form).
> - **Z-index:** named layers `base, dropdown, sticky, overlay, modal, toast`.
> - **Breakpoints:** `sm, md, lg, xl` — these wire into Sprinkles responsive
>   props (see Tech stack).
> - **Motion:** `duration.fast/base/slow` + `easing.standard`; gate all
>   transitions behind `@media (prefers-reduced-motion: reduce)`.

## Whitelabeling (NEW — was empty; this is the keystone)

> **Proposed mechanism.** The whole intent system exists to make this clean, so
> be explicit:
>
> 1. Define the token shape once as a **vanilla-extract `createThemeContract`**
>    matching the JSON structure above (colour + typography + non-colour
>    tokens). This produces CSS-variable references with no values.
> 2. Export a **theme factory**, e.g.
>    `createDesignSystemTheme(tokens, options) => themeClass`. It takes a full
>    set of token values matching the contract (the dev's theme) plus options
>    (`{ scheme: 'light' | 'dark', ... }`), sets `oklchOperator` per scheme, and
>    returns a vanilla-extract theme class via `createTheme(contract, tokens)`.
> 3. **Applying a brand/scheme:** the consumer puts the returned class (or a
>    `data-theme` attribute it maps to) on a root element. Switching brand or
>    light/dark = swapping the class. Nesting is allowed (a subtree can use a
>    different brand).
> 4. **Ship a default theme** — a fully authored reference token set — so the
>    system is usable out-of-the-box and Storybook/docs have something to render.
>    It also serves as a copy-paste starting point so nobody authors a theme from
>    a blank contract.
> 5. **Runtime-unknown brands** (e.g. a tenant whose colours arrive at runtime):
>    because the contract is just CSS custom properties, consumers can override
>    them directly at runtime with token values.
>
> **Light/dark is the consumer's call.** The package does not auto-switch on
> `prefers-color-scheme`; each app decides how and when to apply the `light` vs
> `dark` theme class (media query, user toggle, persisted preference, etc.). The
> factory just produces both classes.
>
> Open question for me to confirm: do we need **multiple brands live on one page
> simultaneously**, or is one-active-brand-at-a-time sufficient? Assume
> one-at-a-time unless I say otherwise, but keep the contract/class approach
> (which supports nesting) so we're not boxed in.

## Actual implementation

### Components

The components to start:

- Chip
- Text
- Heading
- Card
- TextInput

### Component API conventions (NEW)

> **Proposed — consistent prop surface across all components:**
> - Colour props: `intent` (default `neutral` where applicable) and `saliency`
>   (default per element type: `mid` for components/text, `low` for surfaces).
>   Form controls take `state` instead of intent/saliency.
> - Optional `size` prop where it makes sense (`sm | md | lg`, default `md`);
>   call out which of the starter components support it.
> - **Polymorphism:** follow base-ui's `render` prop pattern for "render as a
>   different element/component" rather than inventing an `asChild`. Forward
>   `ref`. Spread valid DOM/ARIA props through.
> - Allow `className` passthrough (merged last) but do NOT expose a `style`
>   escape hatch that bypasses tokens unless necessary.
> - All variant props must be backed by vanilla-extract recipe variants so the
>   type-safe variant API is the source of truth.

### Tech stack

**vanilla-extract** for CSS
- Make use of recipes for an element's variants
- Use the "atoms" concept based on [sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/)
- Elements of the same "component type" should use shared recipes
    - e.g. Button and Chip as aforementioned have many similar attributes
- Make recipes and sprinkles **granular**

**base-ui** for the components
- This means the underlying framework is React 19.x
- Use the latest version (1.5.x)
- Use for all components that semantically match the ones I've described
- base-ui components are client components, so the package's component modules
  must carry the `'use client'` directive (App-Router / RSC consumers depend on
  it). Pure token/CSS exports stay server-safe.

> **Proposed — token → vanilla-extract bridge + responsive:**
> - The token contract is the `createThemeContract`; recipes and sprinkles
>   consume `vars` from that contract, never literal colour values.
> - Wire **Sprinkles responsive** props to the breakpoint tokens (e.g.
>   conditional `padding`, `display`).
> - Keep hover/active out of static tokens; compute via the relative-colour
>   approach inside recipes.

### Packaging & distribution (NEW — it's a published package)

> **Proposed — this needs answering for a reusable package:**
> - **CSS delivery:** vanilla-extract requires a build step. Ship **pre-compiled
>   CSS** (a single importable stylesheet) so consumers do NOT need to configure
>   the vanilla-extract bundler plugin. Optionally also expose the `.css.ts`
>   source for consumers who do use VE and want tree-shaking, but pre-compiled
>   is the default supported path.
> - **Build tool:** Vite library mode (or tsup) producing **ESM-first** output;
>   include type declarations.
> - **`package.json`:** correct `exports` map (JS + CSS + types), `sideEffects`
>   listing the CSS, `peerDependencies` for `react`, `react-dom`, and
>   `@base-ui-components/react` (don't bundle them).
> - **Versioning:** semver + a changelog (Changesets is fine).
> - **Docs:** a Storybook (or equivalent) demonstrating each component across
>   intents/saliencies/states, plus a visual-regression story set if cheap.

### Accessibility (NEW — beyond focus/disabled)

> **Proposed requirements:**
> - **Contrast:** text-on-background pairings in the supplied theme tokens must
>   target WCAG AA (4.5:1 body, 3:1 large text / UI). Because tokens are
>   dev-supplied, emit a **build-time warning** when a pairing fails, rather than
>   silently shipping low contrast.
> - Respect `prefers-reduced-motion` for all hover/active/focus transitions.
> - The disabled-button-with-tooltip pattern (light text + explanatory tooltip)
>   must be wired so the tooltip is reachable via keyboard (consistent with
>   `aria-disabled`).
> - Use semantic base-ui primitives and preserve their ARIA wiring.

### Avoid

Avoid the following technologies:
- shadcn
- shadcn/ui
- tailwind
- scss / sass

### Other notes

This design system is meant to be published as a package that I will use for my personal projects. I'm very tired of re-creating components in each project!
