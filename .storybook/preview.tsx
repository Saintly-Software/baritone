import type { Decorator, Preview } from "@storybook/react-vite";
import * as React from "react";
import { darkTheme, lightTheme, vars } from "../src/theme";

const withTheme: Decorator = (Story, context) => {
  const scheme = context.globals.scheme === "dark" ? "dark" : "light";
  const themeClass = scheme === "dark" ? darkTheme : lightTheme;

  // Also mirror the active theme class onto <body>. base-ui popups (Modal, Drawer,
  // Popover, Menu, Combobox, Select, Tooltip) portal out to the document body,
  // outside this decorator's wrapper — without the theme class there, the theme's
  // CSS variables don't resolve and the portaled surface renders unstyled. Keeping
  // <body> in sync means open overlays (and their snapshots) are themed too.
  React.useEffect(() => {
    document.body.classList.add(themeClass);
    return () => document.body.classList.remove(themeClass);
  }, [themeClass]);

  return (
    <div
      className={themeClass}
      style={{
        padding: "2rem",
        minHeight: "100vh",
        // Pull the page background + text straight from the active theme's
        // neutral low surface so the canvas reflects the theme being previewed.
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    layout: "fullscreen",
    options: {
      storySort: {
        order: [
          "Theming",
          "Typography",
          "Layout",
          "Surfaces",
          "Text",
          "Form Controls",
          "Components",
          "Utilities",
          "Internal",
          "Interaction Tests",
        ],
      },
    },
  },
  globalTypes: {
    scheme: {
      description: "Theme color scheme",
      defaultValue: "light",
      toolbar: {
        title: "Scheme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
