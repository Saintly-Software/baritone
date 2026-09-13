import { createDesignSystemTheme } from "./createTheme";
import { buildDefaultTokens } from "./defaultTokens";

export const lightTheme = createDesignSystemTheme(buildDefaultTokens("light"), {
  scheme: "light",
  name: "default-light",
});

export const darkTheme = createDesignSystemTheme(buildDefaultTokens("dark"), {
  scheme: "dark",
  name: "default-dark",
});
