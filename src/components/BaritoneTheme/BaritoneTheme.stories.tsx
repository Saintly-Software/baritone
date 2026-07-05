import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { type BrandSeed, buildDefaultTokens, vars } from "../../theme";
import { Button } from "../Button";
import { Card } from "../Card";
import { Chip } from "../Chip";
import { Heading } from "../Heading";
import { Switch } from "../Switch";
import { Text } from "../Text";
import { TextInput } from "../TextInput";
import { BaritoneTheme } from "./index";

// Two example tenants. Each supplies only a small `BrandSeed` — a hue (and
// maybe chroma) for `primary`, fonts, corner radius — and inherits the rest of
// the accessible token set from `buildDefaultTokens`.
const BRANDS = {
  Acme: {
    intents: { primary: { h: 292, c: 0.17 } }, // violet
    fonts: { sans: '"Inter", system-ui, sans-serif' },
  },
  Globex: {
    intents: { primary: { h: 155, c: 0.13 }, secondary: { h: 210, c: 0.15 } }, // green + blue
    radius: { md: "3px", lg: "6px" }, // sharper corners
  },
} satisfies Record<string, BrandSeed>;

/**
 * A little slice of product UI. It knows nothing about the theme — every colour,
 * font, and radius comes from the nearest `BaritoneTheme` above it.
 */
function DemoPanel() {
  const [notify, setNotify] = React.useState(true);
  return (
    <Card saliency="high" style={{ display: "grid", gap: 16, width: 320 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <Heading level={3}>Account</Heading>
        <Text saliency="mid">Everything here is themed by the wrapping provider.</Text>
      </div>
      <TextInput label="Display name" placeholder="Ada Lovelace" />
      <Switch label="Email notifications" value={notify} onChange={setNotify} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Chip intent="primary" saliency="mid">
          primary
        </Chip>
        <Chip intent="secondary" saliency="mid">
          secondary
        </Chip>
        <Chip intent="positive" saliency="mid">
          positive
        </Chip>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button intent="primary" saliency="high">
          Save
        </Button>
        <Button intent="neutral" saliency="low">
          Cancel
        </Button>
      </div>
    </Card>
  );
}

/**
 * A themed "page" frame: builds tokens from a brand seed and applies them with
 * `BaritoneTheme`. The frame reads its own background/text straight from the
 * contract vars — which now resolve to *this* scope's branded values.
 */
function BrandFrame({
  name,
  seed,
  scheme,
}: {
  name: string;
  seed: BrandSeed;
  scheme: "light" | "dark";
}) {
  const tokens = buildDefaultTokens(scheme, seed);
  return (
    <BaritoneTheme
      tokens={tokens}
      scheme={scheme}
      style={{
        display: "grid",
        gap: 12,
        padding: 24,
        borderRadius: 16,
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
        border: `1px solid ${vars.surface.color.neutral.low.default.border}`,
      }}
    >
      <Text saliency="low">
        {name} · {scheme}
      </Text>
      <DemoPanel />
    </BaritoneTheme>
  );
}

const meta: Meta<typeof BaritoneTheme> = {
  title: "Theming/BaritoneTheme",
  component: BaritoneTheme,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Runtime theming: map user-supplied tokens to inline CSS variables on " +
          "an element — no vanilla-extract compiler, no pre-generated class. " +
          "Server-render-safe (RSC-compatible), so it drops into an SSR root " +
          "layout. Import `styles.css` once at your app root; this supplies only " +
          "the token *values*.",
      },
    },
  },
};
export default meta;

// The interactive Playground drives a few brand knobs live, rather than the raw
// `tokens`/`scheme` props, so the control panel demonstrates *supplying tokens*.
interface PlaygroundArgs {
  scheme: "light" | "dark";
  primaryHue: number;
  primaryChroma: number;
  fontSans: string;
}

export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    scheme: "light",
    primaryHue: 292,
    primaryChroma: 0.17,
    fontSans: 'Georgia, "Times New Roman", serif',
  },
  argTypes: {
    scheme: { control: "inline-radio", options: ["light", "dark"] },
    primaryHue: { control: { type: "range", min: 0, max: 360, step: 1 } },
    primaryChroma: { control: { type: "range", min: 0, max: 0.3, step: 0.005 } },
    fontSans: { control: "text" },
  },
  render: ({ scheme, primaryHue, primaryChroma, fontSans }) => {
    const tokens = buildDefaultTokens(scheme, {
      intents: { primary: { h: primaryHue, c: primaryChroma } },
      fonts: { sans: fontSans },
    });
    return (
      <BaritoneTheme
        tokens={tokens}
        scheme={scheme}
        style={{
          display: "inline-grid",
          padding: 24,
          borderRadius: 16,
          background: vars.surface.color.neutral.low.default.bgc,
          color: vars.text.color.neutral.mid,
        }}
      >
        <DemoPanel />
      </BaritoneTheme>
    );
  },
};

export const MultipleTenants: StoryObj<typeof BaritoneTheme> = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "start" }}>
      {(Object.keys(BRANDS) as Array<keyof typeof BRANDS>).map((name) => (
        <BrandFrame key={name} name={name} seed={BRANDS[name]} scheme="light" />
      ))}
    </div>
  ),
};

export const LightAndDark: StoryObj<typeof BaritoneTheme> = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "start" }}>
      <BrandFrame name="Acme" seed={BRANDS.Acme} scheme="light" />
      <BrandFrame name="Acme" seed={BRANDS.Acme} scheme="dark" />
    </div>
  ),
};

export const NestedScopes: StoryObj<typeof BaritoneTheme> = {
  render: () => (
    <BaritoneTheme
      tokens={buildDefaultTokens("light", BRANDS.Acme)}
      scheme="light"
      style={{
        display: "grid",
        gap: 16,
        padding: 24,
        borderRadius: 16,
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
      }}
    >
      <Heading level={3}>Outer scope — Acme</Heading>
      <Button intent="primary" saliency="high">
        Acme primary
      </Button>

      <BaritoneTheme
        tokens={buildDefaultTokens("light", BRANDS.Globex)}
        scheme="light"
        style={{
          display: "grid",
          gap: 8,
          padding: 16,
          borderRadius: 12,
          background: vars.surface.color.primary.low.default.bgc,
          border: `1px solid ${vars.surface.color.primary.low.default.border}`,
        }}
      >
        <Text saliency="mid">Nested scope — Globex overrides the tokens here</Text>
        <Button intent="primary" saliency="high">
          Globex primary
        </Button>
      </BaritoneTheme>
    </BaritoneTheme>
  ),
};

export const AsAnotherElement: StoryObj<typeof BaritoneTheme> = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `render` to apply the theme onto an existing element instead of " +
          "adding a wrapper `<div>` — e.g. `render={<body />}` in an SSR root layout.",
      },
    },
  },
  render: () => (
    <BaritoneTheme
      tokens={buildDefaultTokens("light", BRANDS.Acme)}
      scheme="light"
      render={<section aria-label="Themed section" />}
      style={{
        display: "inline-grid",
        padding: 24,
        borderRadius: 16,
        background: vars.surface.color.neutral.low.default.bgc,
        color: vars.text.color.neutral.mid,
      }}
    >
      <DemoPanel />
    </BaritoneTheme>
  ),
};
