import type { Decorator, Preview } from "@storybook/react-vite";
import * as React from "react";
import { darkTheme, lightTheme, vars } from "../src/theme";

const withTheme: Decorator = (Story, context) => {
  const scheme = context.globals.scheme === "dark" ? "dark" : "light";
  const themeClass = scheme === "dark" ? darkTheme : lightTheme;

  // Also mirror the active theme class onto <body>: base-ui popups (Modal,
  // Drawer, Popover, Menu, Combobox, Select, Tooltip) portal out to the body,
  // outside this wrapper, so without the class there they'd render unstyled.
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
        // Pulled from the active theme so the canvas reflects the theme being previewed.
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
