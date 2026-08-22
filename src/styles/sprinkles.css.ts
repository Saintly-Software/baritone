import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";
import { breakpoints } from "../theme/breakpoints";
import { SPACE_KEYS } from "../theme/constants";
import { vars } from "../theme/contract.css";

const spaceValues = Object.fromEntries(SPACE_KEYS.map((key) => [key, vars.space[key]])) as Record<
  (typeof SPACE_KEYS)[number],
  string
>;

const marginValues = { ...spaceValues, auto: "auto" };

// Inset values for `position`ed elements — `top` / `right` / `bottom` / `left`
// and the `inset` shorthand. The spacing scale (so a sticky region can offset by
// a token, e.g. `top="0"` or `top="4"`) plus `auto` (the initial value, and the
// way to pin to the opposite edge).
const insetValues = { ...spaceValues, auto: "auto" };

// Sizing values for `width` / `height` / `min*` / `max*`: the spacing scale (so a
// flex child can take a fixed size straight from the atoms scale) plus the
// intrinsic keywords. `full` is a friendly alias for `100%`.
const dimensionValues = {
  ...spaceValues,
  auto: "auto",
  full: "100%",
  inherit: "inherit",
  "fit-content": "fit-content",
  "max-content": "max-content",
  "min-content": "min-content",
};

// Viewport-fill keywords for the *height* axis only. `screen` uses the dynamic
// viewport unit (`dvh`), so a full-height region tracks the mobile URL bar
// showing/hiding instead of overflowing the way classic `100vh` does. `screen-s`
// / `screen-l` pin to the small / large viewport for a height that stays put
// regardless of the URL bar (`svh` = as if it's showing, `lvh` = as if hidden).
// There's deliberately no viewport *width* token — a viewport-width fill is
// `width="full"`.
const viewportHeightValues = {
  screen: "100dvh",
  "screen-s": "100svh",
  "screen-l": "100lvh",
};

// The height axis carries the viewport keywords on top of the shared dimensions.
const heightValues = { ...dimensionValues, ...viewportHeightValues };

// Responsive atoms wired to the breakpoint tokens. `mobile` is the base
// (mobile-first) condition; the rest are `min-width` media queries.
const responsiveProperties = defineProperties({
  conditions: {
    mobile: {},
    sm: { "@media": `screen and (min-width: ${breakpoints.sm})` },
    md: { "@media": `screen and (min-width: ${breakpoints.md})` },
    lg: { "@media": `screen and (min-width: ${breakpoints.lg})` },
    xl: { "@media": `screen and (min-width: ${breakpoints.xl})` },
  },
  defaultCondition: "mobile",
  properties: {
    display: [
      "none",
      "block",
      "inline",
      "inline-block",
      "flex",
      "inline-flex",
      "grid",
      "inline-grid",
    ],
    flexDirection: ["row", "row-reverse", "column", "column-reverse"],
    flexWrap: ["wrap", "nowrap"],
    alignItems: ["stretch", "flex-start", "center", "flex-end", "baseline"],
    alignSelf: ["auto", "stretch", "flex-start", "center", "flex-end", "baseline"],
    flexGrow: [0, 1],
    flexShrink: [0, 1],
    justifyContent: [
      "flex-start",
      "center",
      "flex-end",
      "space-between",
      "space-around",
      "space-evenly",
    ],
    // `place-items` / `place-content` — the grid box-alignment shorthands, whose
    // keywords (`start` / `center` / `end` / `stretch`) are already friendly, so
    // no flex-style translation is needed. `place-items: center` is the canonical
    // both-axes centering the grid path was missing.
    placeItems: ["start", "center", "end", "stretch"],
    placeContent: ["start", "center", "end", "stretch"],
    gap: spaceValues,
    padding: spaceValues,
    paddingTop: spaceValues,
    paddingBottom: spaceValues,
    paddingLeft: spaceValues,
    paddingRight: spaceValues,
    margin: marginValues,
    marginTop: marginValues,
    marginBottom: marginValues,
    marginLeft: marginValues,
    marginRight: marginValues,
    width: dimensionValues,
    maxWidth: dimensionValues,
    minWidth: dimensionValues,
    // Height axis carries the viewport-fill keywords (`screen` → `100dvh`, …).
    height: heightValues,
    minHeight: heightValues,
    maxHeight: heightValues,
    // `position` + the inset atoms, so sticky/absolute regions don't need raw
    // CSS. Every value flows through the responsive conditions like the rest.
    position: ["static", "relative", "absolute", "sticky", "fixed"],
    inset: insetValues,
    top: insetValues,
    right: insetValues,
    bottom: insetValues,
    left: insetValues,
    textAlign: ["start", "center", "end", "left", "right"],
    whiteSpace: ["normal", "nowrap", "pre-wrap"],
    overflowWrap: ["normal", "break-word"],
    textTransform: ["none", "uppercase", "lowercase", "capitalize"],
    // NOTE: `letterSpacing` is deliberately *not* an atom. Its vocabulary is
    // consumer-defined and open-ended (see `theme/letterSpacings.ts`), so it can't
    // be enumerated into build-time classes; it's routed through the
    // `--textLetterSpacing` var by `InternalText` instead, exactly like `font`.
  },
  shorthands: {
    p: ["padding"],
    px: ["paddingLeft", "paddingRight"],
    py: ["paddingTop", "paddingBottom"],
    pt: ["paddingTop"],
    pr: ["paddingRight"],
    pb: ["paddingBottom"],
    pl: ["paddingLeft"],
    m: ["margin"],
    mx: ["marginLeft", "marginRight"],
    my: ["marginTop", "marginBottom"],
    mt: ["marginTop"],
    mr: ["marginRight"],
    mb: ["marginBottom"],
    ml: ["marginLeft"],
  },
});

export const atoms = createSprinkles(responsiveProperties);
export type Atoms = Parameters<typeof atoms>[0];
