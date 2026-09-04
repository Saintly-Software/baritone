import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Lightbox } from "./index";

const ExpandGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Icon>
);

const SRC = "https://picsum.photos/id/1025/1200/800";
const ALT = "A dog resting on a wooden floor";

const meta: Meta<typeof Lightbox> = {
  title: "Surfaces/Lightbox",
  component: Lightbox,
  parameters: {
    docs: {
      description: {
        component:
          "Opens an image at full size in a dialog centred over a dimmed page. Opens from a `<Lightbox.Trigger>` (a `Button`); dismissed by clicking the backdrop, pressing Escape, or the built-in close button in the image's corner. Clicking the image itself does not close it. Built on base-ui's Dialog, so it is modal and takes its accessible name from `alt`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Lightbox>;

/**
 * The canonical use: an icon-only trigger opens the image full-size. Uses the
 * low-saliency small icon button from the raw example.
 */
export const Default: Story = {
  render: () => (
    <Lightbox
      src={SRC}
      alt={ALT}
      trigger={
        <Lightbox.Trigger
          size="sm"
          saliency="low"
          aria-label="View image at full size"
          icon={<ExpandGlyph />}
        />
      }
    />
  ),
};

/**
 * A labelled trigger instead of the icon-only one — any `Button` works, since
 * `Lightbox.Trigger` forwards all of Button's props.
 */
export const LabelledTrigger: Story = {
  render: () => (
    <Lightbox
      src={SRC}
      alt={ALT}
      trigger={<Lightbox.Trigger startIcon={<ExpandGlyph />}>View photo</Lightbox.Trigger>}
    />
  ),
};

/**
 * Optional `children` render below the image as a caption. They sit on the
 * dimmed backdrop, so use a light text colour.
 */
export const WithCaption: Story = {
  render: () => (
    <Lightbox
      src={SRC}
      alt={ALT}
      trigger={
        <Lightbox.Trigger size="sm" saliency="low" aria-label="View image" icon={<ExpandGlyph />} />
      }
    >
      <Text size="sm" render={<p style={{ color: "white", textAlign: "center" }} />}>
        {ALT}
      </Text>
    </Lightbox>
  ),
};

/** Opened by default so the overlay is visible on load. */
export const Open: Story = {
  render: () => (
    <Lightbox
      src={SRC}
      alt={ALT}
      defaultOpen
      trigger={
        <Lightbox.Trigger size="sm" saliency="low" aria-label="View image" icon={<ExpandGlyph />} />
      }
    />
  ),
};
