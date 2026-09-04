import type { Decorator, Preview } from "@storybook/react-vite";
import * as React from "react";
import { darkTheme, lightTheme, vars } from "../src/theme";

const withTheme: Decorator = (Story, context) => {
  const scheme = context.globals.scheme === "dark" ? "dark" : "light";
  const themeClass = scheme === "dark" ? darkTheme : lightTheme;

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
