import type { Decorator, Preview } from "@storybook/react-vite";
import { darkTheme, lightTheme, vars } from "../src/theme";

const withTheme: Decorator = (Story, context) => {
  const scheme = context.globals.scheme === "dark" ? "dark" : "light";
  const themeClass = scheme === "dark" ? darkTheme : lightTheme;
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
        order: ['Theming', 'Surfaces', 'Text', 'Form Controls', 'Components'],
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
