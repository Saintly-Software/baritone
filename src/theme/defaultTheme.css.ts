import { createDesignSystemTheme } from './createTheme';
import { buildDefaultTokens } from './defaultTokens';

/**
 * The shipped reference themes. Apply one of these classes to a root element to
 * use the system out of the box. They also serve as a copy-paste starting point
 * — see `buildDefaultTokens` for the authored values.
 */
export const lightTheme = createDesignSystemTheme(buildDefaultTokens('light'), {
  scheme: 'light',
  name: 'default-light',
});

export const darkTheme = createDesignSystemTheme(buildDefaultTokens('dark'), {
  scheme: 'dark',
  name: 'default-dark',
});
