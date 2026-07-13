# design-sync notes — @saintly-software/baritone

Source shape: **storybook**. Global: `window.SaintlySoftwareBaritone`. Build: `pnpm build` → `dist/index.js` (+ `dist/styles.css`, vanilla-extract). DS's own source repo, so converter runs with `--entry ./dist/index.js` (no `node_modules/<pkg>`).

## Decisions

- [GENERAL] Theme is applied by the `.storybook/preview.tsx` decorator via vanilla-extract classes `lightTheme`/`darkTheme` (from `src/theme`), mirrored onto `<body>` so base-ui portaled popups (Modal, Drawer, Popover, Menu, Combobox, Select, Tooltip) resolve theme CSS vars. Decorator auto-bundles as `preview-decorators.js` — previews inherit it. Runtime alternative provider is the exported `BaritoneTheme` component (inline CSS custom props).
- `Internal/*` stories (InternalButton, InternalCheckbox, InternalGenericButtonAnchor, InternalSpinner, InternalSwitch, InternalTooltip) are **not package exports** — excluded via `titleMap {<tail>: null}`. They are implementation building blocks, not design-system surface.
- `Interaction Tests/*` stories (`*.interaction.stories.tsx`, play-function tests) share the tail name of the real component, so Storybook merges them in as extra sibling stories of Button/Card/Combobox/InaccessibleTooltip/Link/Popover/ScrollArea/Select/Text/Tooltip. `titleMap` cannot exclude them (tail collides with the real export). Kept for now — several (Popover/Tooltip side variants, ScrollArea orientations) are legitimate visual references; they render identically on both panels. Revisit any that render as static test-noise during grading via `cfg.overrides.<Name>.skip`.

## Build/render fixes (self-heal loop)

- [GENERAL] **VE runtime throw "Styles were unable to be assigned to a file"** on every preview. Root cause: the lib build (`.config/vite.config.ts`) externalizes `@vanilla-extract/css` as build-time-only, and the auto-bundled `.storybook/preview.tsx` decorator imports the theme from `../src/theme` **source** `.css.ts` — esbuild can't run the VE compiler, so `createTheme()` runs at runtime and throws. Fix: replaced the decorator with `cfg.provider = {component: "PreviewRoot"}`, a wrapper (`.design-sync/preview-provider.tsx`, exposed via `cfg.extraEntries`) that sources the theme from the COMPILED `../dist` and mirrors the theme CSS vars onto `document.body` so base-ui portaled overlays stay themed (see [[portaled-surfaces-unstyled-in-storybook]]).
- **BaritoneTheme story** imported `{ buildDefaultTokens, vars }` from `../../theme` (the theme index barrel) → resolves to `src/theme/index.ts`, which re-exports `defaultTheme.css.ts` (the throwing `createTheme`). Not an exported *component*, so the default import policy bundled it from source and threw. Fix: `cfg.storyImports.shim: ["src/theme/index"]` forces the barrel to the compiled global (`buildDefaultTokens`/`vars` are bundle exports). **Scope matters:** shim only `src/theme/index`, NOT `src/theme` — Switch/Text import `LABEL_POSITIONS`/`TEXT_SIZES`/`TEXT_WEIGHTS` from `../../theme/constants`, and those are NOT re-exported by the package (not on the global), so a broad shim makes them `undefined` (`.map` of undefined). `constants.ts` is pure — safe to bundle from source.

## Grid-overflow / card presentation (presentation-only overrides)

- `cardMode: "column"` (wide layouts): Badge, Link, ToggleGroup, Box, Flex, ScrollArea, BaritoneTheme.
- `cardMode: "single"` (portaled/escape overlays) + a `primaryStory`: Meter, Combobox, Select, ConfirmationModal, Drawer, Menu, Modal, Popover. primaryStory picks are provisional — refine during grading if the chosen story renders poorly as a single card.

## Overlay / interaction-story handling (batch 1)

- [GENERAL] **Play-driven stories don't render their post-interaction state in the preview.** The compare harness runs storybook's `play` (which opens a menu/tooltip/popover or picks an option), but the compiled static preview cannot execute `play` — so those stories show the *initial* (closed/unselected) state and mismatch storybook. Rule: skip the play-driven interaction stories via `cfg.overrides.<Name>.skip`; keep the base `.stories.tsx` stories that render statically (they use `defaultOpen`/controlled state).
  - Skipped: Menu (`surfaces-menu--{opens-and-highlights-item,keep-open-stays-open,side-top,side-bottom,side-left,side-right}`), Popover (`interaction-tests-popover--{kitchen-sink,side-top,side-right,side-bottom,side-left}`), Select (`interaction-tests-select--{single-select-picks-option,multi-select-hover-selected-option}`), Tooltip (`interaction-tests-tooltip--{opens-on-focus,long-content,side-top,side-right,side-bottom,side-left}`).
  - Statically-open base stories that MATCH as-is: Modal (all), Drawer (all), ConfirmationModal (all), Popover KitchenSink (`defaultOpen`), Menu KitchenSink (`defaultOpen`), Combobox/Select form-field stories.
- **Tooltip** has NO static-open story — even its base `Basic` opens via a `play` hover. Owned preview `.design-sync/previews/Tooltip.tsx` forces `defaultOpen` on Basic so the card shows the open tooltip and matches storybook's played-open reference. (Menu/Popover didn't need this — their base KitchenSink already uses `defaultOpen`.)
- InaccessibleTooltip: both stories render statically (Basic = underlined text; OpensOnHover trigger closed on both sides) → match, no skip.

## More interaction-story skips (batches 3–4)

- **Card** (`interaction-tests-card--{clickable-activates,collapsible-toggles}`): play increments/toggles state (storybook shows "Pressed 1 time"; preview initial "0 times") → skipped. Base stories (Kitchen Sink, Clickable, Linkable, Selected, Intents And Saliencies) render statically → match.
- **ScrollArea** (`interaction-tests-scrollarea--{vertical,horizontal,both}`): these render identically to the base orientation stories (scroll position doesn't diverge), so they MATCH — but they're exact visual duplicates of Vertical (default)/Horizontal/Both, so skipped purely to de-dupe the column card, not to fix a mismatch.
- Everything else in batches 2–4 (all form controls, Box/Flex/Grid, Badge/ButtonGroup/Chip/ChipList/Link/Lockup/Notice/ToggleButton, Accordion/CardList) matched as-is with no skips — statically-rendered components.

## Re-sync risks

- `.design-sync/preview-provider.tsx` imports from `../dist/index.js` (gitignored build output) and reads the theme via `createInlineTheme`/`vars`/`buildDefaultTokens`/`BaritoneTheme` — all current bundle exports. If any of those export names change, the provider breaks. Rebuild (`pnpm build`) must run before the converter so `dist/` exists.
- `cfg.storyImports.shim: ["src/theme/index"]` assumes everything BaritoneTheme's story imports from the theme barrel is a bundle export. If a story starts importing a theme-barrel symbol that isn't re-exported by the package, it'll be `undefined`.
- Interaction-test stories are still merged in as sibling stories (see above) — a newly added one that only renders under its play function may need `cfg.overrides.<Name>.skip`.
- primaryStory picks for single-mode overlays were chosen for representativeness, not verified per-pixel as the card's sole story.
