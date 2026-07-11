import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { ConfirmationModal } from "./index";

/** A warning-triangle glyph for the destructive/warning stories. */
const warningIcon = (
  <Icon size="lg">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V8h2v5z" />
    </svg>
  </Icon>
);

const meta: Meta<typeof ConfirmationModal> = {
  title: "Surfaces/ConfirmationModal",
  component: ConfirmationModal,
  args: {
    intent: "negative",
    loading: false,
    disabled: false,
    size: "sm",
  },
  argTypes: {
    intent: { control: "inline-radio", options: ["secondary", "warning", "negative"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A focused confirm/cancel dialog built on `Modal`. An intent-tinted icon + header, a body, and a footer with a **cancel** button (dismisses) and a **confirm** button (coloured by `intent`, default `negative`). Confirm dismisses by default; `event.preventDefault()` in the handler keeps it open for async work, and `loading` shows the confirm spinner while locking the dialog.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ConfirmationModal>;

export const Destructive: Story = {
  render: (args) => (
    <ConfirmationModal
      {...args}
      icon={warningIcon}
      header="Delete project?"
      trigger={
        <ConfirmationModal.Trigger intent="negative" saliency="high">
          Delete project
        </ConfirmationModal.Trigger>
      }
      confirm={{ children: "Delete" }}
    >
      <Text render={<p />}>
        This permanently removes the project and all of its data. This can&apos;t be undone.
      </Text>
    </ConfirmationModal>
  ),
};

export const Warning: Story = {
  args: { intent: "warning" },
  render: (args) => (
    <ConfirmationModal
      {...args}
      icon={warningIcon}
      header="Discard changes?"
      trigger={<ConfirmationModal.Trigger intent="warning">Discard</ConfirmationModal.Trigger>}
      confirm={{ children: "Discard" }}
      cancel={{ children: "Keep editing" }}
    >
      <Text render={<p />}>You have unsaved changes that will be lost if you leave now.</Text>
    </ConfirmationModal>
  ),
};

export const Secondary: Story = {
  args: { intent: "secondary" },
  render: (args) => (
    <ConfirmationModal
      {...args}
      header="Sign out?"
      trigger={<ConfirmationModal.Trigger>Sign out</ConfirmationModal.Trigger>}
      confirm={{ children: "Sign out" }}
    >
      <Text render={<p />}>You&apos;ll need to sign in again to get back to your dashboard.</Text>
    </ConfirmationModal>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <ConfirmationModal
          {...args}
          icon={warningIcon}
          header="Delete account?"
          open={open}
          onOpenChange={setOpen}
          confirm={{ children: "Delete account" }}
          handleConfirm={() => setOpen(false)}
        >
          <Text render={<p />}>Your account and all associated data will be removed.</Text>
        </ConfirmationModal>
        <ConfirmationModal.Trigger
          // A trigger can live outside the dialog when you drive `open` yourself.
          intent="negative"
          saliency="high"
          onClick={() => setOpen(true)}
        >
          Delete account
        </ConfirmationModal.Trigger>
      </>
    );
  },
};

export const Loading: Story = {
  name: "Loading (async confirm)",
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);

    const handleConfirm = (event: React.MouseEvent) => {
      // Keep the dialog open, show the spinner, then close when the work resolves.
      event.preventDefault();
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setOpen(false);
      }, 1500);
    };

    return (
      <ConfirmationModal
        {...args}
        icon={warningIcon}
        header="Delete project?"
        open={open}
        onOpenChange={setOpen}
        loading={submitting}
        trigger={
          <ConfirmationModal.Trigger intent="negative" saliency="high">
            Delete project
          </ConfirmationModal.Trigger>
        }
        confirm={{ children: "Delete" }}
        handleConfirm={handleConfirm}
      >
        <Text render={<p />}>
          Confirm runs an async task: the button spins and the dialog locks until it finishes.
        </Text>
      </ConfirmationModal>
    );
  },
};
