import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../Icon";
import { Menu } from "./index";

// Throwaway glyphs so the icon demo has something to render.
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

/**
 * Every row shape at once: a plain button row, one per supported `intent`, an
 * icon row, an external `href` link, and disabled variants of both a button and
 * a link row.
 */
export const KitchenSink: Story = {
  render: () => (
    <Menu
      defaultOpen
      trigger={<Menu.Trigger>Actions</Menu.Trigger>}
      items={[
        // A plain (neutral) button row.
        { children: "Rename", onClick: () => alert("Rename") },
        // A row with a leading icon.
        { children: "Duplicate", icon: <DuplicateGlyph />, onClick: () => alert("Duplicate") },
        // A link row — a real `<a href>`.
        { children: "View source", href: "https://example.com/source" },
        // One row per supported intent (neutral is covered by "Rename" above).
        { children: "Share", intent: "secondary", onClick: () => alert("Share") },
        { children: "Publish", intent: "positive", onClick: () => alert("Publish") },
        { children: "Archive", intent: "warning", onClick: () => alert("Archive") },
        {
          children: "Delete",
          intent: "negative",
          icon: <TrashGlyph />,
          onClick: () => alert("Delete"),
        },
        // A disabled button row.
        { children: "Billing", onClick: () => alert("Billing"), disabled: true },
        // A disabled link row.
        { children: "Documentation", href: "https://example.com/docs", disabled: true },
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
