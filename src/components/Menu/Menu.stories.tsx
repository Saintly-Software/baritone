import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Icon } from "../Icon";
import { Menu } from "./index";

// Throwaway glyphs so the icon demo has something to render.
const EditGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  </Icon>
);

const DuplicateGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  </Icon>
);

const TrashGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  </Icon>
);

const meta: Meta<typeof Menu> = {
  title: "Surfaces/Menu",
  component: Menu,
  parameters: {
    docs: {
      description: {
        component:
          "A floating list of actions anchored to a trigger, built on base-ui's Menu. Pass rows as `items`, each the props for a `Menu.Item`: `intent`, `icon`, `children` (the label), and one of `onClick` / `href` / `render` to make it act, link externally, or navigate via your router.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Menu>;

export const Playground: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger>Actions</Menu.Trigger>}
      items={[
        { children: "Edit", icon: <EditGlyph />, onClick: () => alert("Edit") },
        { children: "Duplicate", icon: <DuplicateGlyph />, onClick: () => alert("Duplicate") },
        { children: "View source", href: "https://example.com/source" },
        {
          children: "Delete",
          intent: "negative",
          icon: <TrashGlyph />,
          onClick: () => alert("Delete"),
        },
      ]}
    />
  ),
};

export const Intents: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger>Row options</Menu.Trigger>}
      items={[
        { children: "Rename", onClick: () => {} },
        { children: "Share", intent: "secondary", onClick: () => {} },
        { children: "Archive", intent: "warning", onClick: () => {} },
        { children: "Delete forever", intent: "negative", onClick: () => {} },
      ]}
    />
  ),
};

/** External `href` links and a router link (via `render`) live alongside button rows. */
export const Links: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger>Resources</Menu.Trigger>}
      items={[
        { children: "Documentation", icon: <EditGlyph />, href: "https://example.com/docs" },
        { children: "Changelog", href: "https://example.com/changelog" },
        // A router link would use `render`, e.g. `render={<RouterLink to="/settings" />}`.
        { children: "Settings", render: <a href="/settings" /> },
        { children: "Sign out", intent: "negative", onClick: () => alert("Sign out") },
      ]}
    />
  ),
};

/** `openOnHover` opens the menu on pointer hover, not just on click/keyboard. */
export const OpenOnHover: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger openOnHover>Hover me</Menu.Trigger>}
      items={[
        { children: "Edit", onClick: () => {} },
        { children: "Duplicate", onClick: () => {} },
      ]}
    />
  ),
};

/**
 * A fully custom, non-Button trigger via base-ui's `render` seam — here a plain
 * styled element that still gets the popup wiring (`aria-haspopup`/`-expanded`).
 */
export const CustomTrigger: Story = {
  render: () => (
    <Menu
      trigger={
        <Menu.Trigger
          render={
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid currentColor",
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
              }}
              aria-label="Open actions"
            >
              JD
            </button>
          }
        />
      }
      items={[
        { children: "Profile", onClick: () => {} },
        { children: "Settings", href: "/settings" },
        { children: "Sign out", intent: "negative", onClick: () => {} },
      ]}
    />
  ),
};

/**
 * `keepOpen` holds the menu open after a row activates — for a repeatable action
 * that doesn't navigate away, like this counter's increment/decrement.
 */
export const KeepOpen: Story = {
  render: function KeepOpenStory() {
    const [count, setCount] = React.useState(0);
    return (
      <Menu
        trigger={<Menu.Trigger>Quantity: {count}</Menu.Trigger>}
        items={[
          { children: "Increment", keepOpen: true, onClick: () => setCount((c) => c + 1) },
          { children: "Decrement", keepOpen: true, onClick: () => setCount((c) => c - 1) },
          { children: "Reset", intent: "warning", onClick: () => setCount(0) },
        ]}
      />
    );
  },
};

export const DisabledItem: Story = {
  render: () => (
    <Menu
      trigger={<Menu.Trigger>Account</Menu.Trigger>}
      items={[
        { children: "Profile", onClick: () => {} },
        { children: "Billing", onClick: () => {}, disabled: true },
        { children: "Sign out", intent: "negative", onClick: () => {} },
      ]}
    />
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, padding: 80 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Menu
          key={side}
          side={side}
          trigger={<Menu.Trigger>{side}</Menu.Trigger>}
          items={[
            { children: "First", onClick: () => {} },
            { children: "Second", onClick: () => {} },
          ]}
        />
      ))}
    </div>
  ),
};
