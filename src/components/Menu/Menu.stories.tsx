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
          "A floating list of actions anchored to a trigger, built on base-ui's Menu. Pass rows as `items`, each a `<Menu.Item>`: `intent`, `icon`, `children` (the label), and one of `onClick` / `href` / `render` to make it act, link externally, or navigate via your router.",
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
        <Menu.Item key="rename" onClick={() => alert("Rename")}>
          Rename
        </Menu.Item>,
        // A row with a leading icon.
        <Menu.Item key="duplicate" icon={<DuplicateGlyph />} onClick={() => alert("Duplicate")}>
          Duplicate
        </Menu.Item>,
        // A link row — a real `<a href>`.
        <Menu.Item key="source" href="https://example.com/source">
          View source
        </Menu.Item>,
        // One row per supported intent (neutral is covered by "Rename" above).
        <Menu.Item key="share" intent="secondary" onClick={() => alert("Share")}>
          Share
        </Menu.Item>,
        <Menu.Item key="publish" intent="positive" onClick={() => alert("Publish")}>
          Publish
        </Menu.Item>,
        <Menu.Item key="archive" intent="warning" onClick={() => alert("Archive")}>
          Archive
        </Menu.Item>,
        <Menu.Item
          key="delete"
          intent="negative"
          icon={<TrashGlyph />}
          onClick={() => alert("Delete")}
        >
          Delete
        </Menu.Item>,
        // A disabled button row.
        <Menu.Item key="billing" onClick={() => alert("Billing")} disabled>
          Billing
        </Menu.Item>,
        // A disabled link row.
        <Menu.Item key="docs" href="https://example.com/docs" disabled>
          Documentation
        </Menu.Item>,
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
        <Menu.Item key="profile" onClick={() => {}}>
          Profile
        </Menu.Item>,
        <Menu.Item key="settings" href="/settings">
          Settings
        </Menu.Item>,
        <Menu.Item key="signout" intent="negative" onClick={() => {}}>
          Sign out
        </Menu.Item>,
      ]}
    />
  ),
};
