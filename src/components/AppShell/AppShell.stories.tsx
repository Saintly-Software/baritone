import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { vars } from "../../theme";
import { layoutVars } from "../../theme/layout.css";
import { BaritoneProvider } from "../BaritoneProvider";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { useLayoutInsets, useLayoutRegion } from "../Layout";
import { Text } from "../Text";
import { useToast } from "../Toast";
import { AppShell } from "./index";

const meta: Meta<typeof AppShell> = {
  title: "Layout/AppShell",
  component: AppShell,
  decorators: [
    (Story) => (
      <BaritoneProvider>
        <Story />
      </BaritoneProvider>
    ),
  ],
  argTypes: {
    pinHeader: { control: "boolean" },
    pinSidebar: { control: "boolean" },
    pinFooter: { control: "boolean" },
    fabCorner: { control: "inline-radio", options: ["bottom-right", "bottom-left"] },
    hideSidebarBelow: { control: "select", options: [undefined, "sm", "md", "lg", "xl"] },
  },
};
export default meta;

type Story = StoryObj<typeof AppShell>;

const bar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "12px 24px",
  background: vars.surface.color.neutral.high.default.bgc,
  color: vars.surface.color.neutral.high.default.text,
  borderBottom: `1px solid ${vars.surface.color.neutral.high.default.border}`,
};

function Banner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        ...bar,
        justifyContent: "center",
        background: vars.surface.color.primary.high.default.bgc,
        color: vars.surface.color.primary.high.default.text,
      }}
    >
      <Text>You are viewing the new site.</Text>
      <Button size="sm" saliency="low" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}

function Navbar() {
  return (
    <nav aria-label="Primary" style={bar}>
      <strong>Acme</strong>
      <Text>Maps</Text>
      <Text>News</Text>
      <Text>More</Text>
    </nav>
  );
}

function StickyTabs() {
  const ref = useLayoutRegion({ edge: "top" });
  return (
    <div
      ref={ref}
      style={{
        ...bar,
        position: "sticky",
        top: layoutVars.offset,
        zIndex: 1,
      }}
    >
      <Text>Today</Text>
      <Text>Hourly</Text>
      <Text>10-day</Text>
    </div>
  );
}

function InsetReadout() {
  const insets = useLayoutInsets();
  return (
    <Text>
      inset-top {insets.top}px · inset-left {insets.left}px · inset-bottom {insets.bottom}px · FAB{" "}
      {insets.fab["bottom-right"].width}×{insets.fab["bottom-right"].height}
    </Text>
  );
}

function ToastButton() {
  const toast = useToast();
  return (
    <Button intent="primary" onClick={() => toast.add({ title: "Saved", intent: "positive" })}>
      Show toast
    </Button>
  );
}

const HelpGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" />
  </svg>
);

function Fab() {
  return <Button intent="primary" saliency="high" aria-label="Help" icon={<HelpGlyph />} />;
}

function Content() {
  return (
    <div style={{ display: "grid", gap: 16, padding: 24 }}>
      <Heading level={1}>Kitchener</Heading>
      <InsetReadout />
      <ToastButton />
      <StickyTabs />
      {Array.from({ length: 30 }, (_, index) => (
        <Text key={index} id={`section-${index}`}>
          Section {index + 1}. Scroll to see the header, tabs and sidebar stay put.{" "}
          <a href={`#section-${index + 5}`}>Jump ahead</a>
        </Text>
      ))}
    </div>
  );
}

function Shell(args: Partial<React.ComponentProps<typeof AppShell>>) {
  const [banner, setBanner] = React.useState(true);
  return (
    <AppShell
      header={
        <>
          {banner && <Banner onDismiss={() => setBanner(false)} />}
          <Navbar />
        </>
      }
      sidebar={
        <div style={{ display: "grid", gap: 8, padding: 24, width: 200 }}>
          <Text>Dashboard</Text>
          <Text>Reports</Text>
          <Text>Settings</Text>
        </div>
      }
      sidebarLabel="Sections"
      footer={<div style={bar}>© Acme</div>}
      fab={<Fab />}
      {...args}
    >
      <Content />
    </AppShell>
  );
}

export const Playground: Story = {
  args: { pinHeader: true, pinSidebar: true, pinFooter: false, fabCorner: "bottom-right" },
  render: (args) => <Shell {...args} />,
};

export const PinnedFooter: Story = {
  render: () => <Shell pinFooter />,
};

export const SidebarHiddenBelowLarge: Story = {
  render: () => <Shell hideSidebarBelow="lg" />,
};
