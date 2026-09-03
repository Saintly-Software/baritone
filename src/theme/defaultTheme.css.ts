import { createDesignSystemTheme } from "./createTheme";
import { buildDefaultTokens } from "./defaultTokens";

/**
 * The shipped reference themes — apply one of these classes to a root element
 * to use the system out of the box, or copy-paste from `buildDefaultTokens`.
 */
export const lightTheme = createDesignSystemTheme(buildDefaultTokens("light"), {
  scheme: "light",
  name: "default-light",
});

export const darkTheme = createDesignSystemTheme(buildDefaultTokens("dark"), {
  scheme: "dark",
  name: "default-dark",
});
