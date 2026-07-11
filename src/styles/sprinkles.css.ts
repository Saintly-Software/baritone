import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";
import { breakpoints } from "../theme/breakpoints";
import { SPACE_KEYS } from "../theme/constants";
import { vars } from "../theme/contract.css";

const spaceValues = Object.fromEntries(SPACE_KEYS.map((key) => [key, vars.space[key]])) as Record<
  (typeof SPACE_KEYS)[number],
  string
>;

const marginValues = { ...spaceValues, auto: "auto" };

// Sizing values for `width` / `height` / `min*`: the spacing scale (so a flex
// child can take a fixed size straight from the atoms scale) plus the intrinsic
// keywords. `full` is a friendly alias for `100%`.
const dimensionValues = {
  ...spaceValues,
  auto: "auto",
  full: "100%",
  inherit: "inherit",
  "fit-content": "fit-content",
  "max-content": "max-content",
  "min-content": "min-content",
};

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
    height: dimensionValues,
    maxWidth: dimensionValues,
    minWidth: dimensionValues,
    minHeight: dimensionValues,
    textAlign: ["left", "center", "right"],
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
