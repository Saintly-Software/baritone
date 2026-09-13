import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { BaritoneProvider } from "../BaritoneProvider";
import { Button } from "../Button";
import { Notice } from "../Notice";
import { useToast } from "./index";

const CheckGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const meta: Meta = {
  title: "Components/Toast",
  decorators: [
    (Story) => (
      <BaritoneProvider>
        <Story />
      </BaritoneProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj;

export const Intents: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "2rem" }}>
          <Button onClick={() => toast.add({ title: "Just so you know", intent: "neutral" })}>
            Neutral
          </Button>
          <Button
            intent="primary"
            onClick={() => toast.add({ title: "Heads up", intent: "primary" })}
          >
            Primary
          </Button>
          <Button
            intent="positive"
            onClick={() =>
              toast.add({
                title: "Saved",
                description: "Your changes are live.",
                intent: "positive",
                icon: <CheckGlyph />,
              })
            }
          >
            Positive
          </Button>
          <Button
            intent="warning"
            onClick={() =>
              toast.add({ title: "Check your connection", intent: "warning", priority: "high" })
            }
          >
            Warning
          </Button>
          <Button
            intent="negative"
            onClick={() =>
              toast.add({
                title: "Couldn't save",
                description: "We'll retry automatically.",
                intent: "negative",
                priority: "high",
              })
            }
          >
            Negative
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithDescription: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      return (
        <div style={{ padding: "2rem" }}>
          <Button
            onClick={() =>
              toast.add({
                title: "Export ready",
                description: "report-2026-07.csv finished generating and is ready to download.",
                intent: "primary",
              })
            }
          >
            Show toast
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithActions: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      const undo = () => {
        const id = toast.add({
          title: "Message archived",
          intent: "neutral",
          actions: [
            <Notice.Action
              key="undo"
              intent="primary"
              saliency="low"
              onClick={() => toast.close(id)}
            >
              Undo
            </Notice.Action>,
          ],
          timeout: 8000,
        });
      };
      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={undo}>Archive message</Button>
        </div>
      );
    }
    return <Demo />;
  },
};

export const Stacking: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      const counter = React.useRef(0);
      return (
        <div style={{ padding: "2rem" }}>
          <Button
            onClick={() => {
              counter.current += 1;
              toast.add({
                title: `Notification ${counter.current}`,
                description: "Fire a few in a row to watch them stack.",
                intent: "primary",
              });
            }}
          >
            Add to stack
          </Button>
        </div>
      );
    }
    return <Demo />;
  },
};

export const Promise: Story = {
  render: () => {
    function Demo() {
      const toast = useToast();
      const run = () => {
        const task = new window.Promise((resolve) => window.setTimeout(resolve, 2000));
        toast.promise(task, {
          loading: { title: "Uploading…", intent: "neutral" },
          success: { title: "Uploaded", intent: "positive", icon: <CheckGlyph /> },
          error: { title: "Upload failed", intent: "negative", priority: "high" },
        });
      };
      return (
        <div style={{ padding: "2rem" }}>
          <Button onClick={run}>Start upload</Button>
        </div>
      );
    }
    return <Demo />;
  },
};
