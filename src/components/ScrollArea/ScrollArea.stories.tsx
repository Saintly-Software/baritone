import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../Text";
import { ScrollArea } from "./index";

const PARAGRAPHS = [
  "Vernacular architecture is building done outside any academic tradition, and without professional guidance. It is not a particular architectural movement or style, but rather a broad category, encompassing a wide range and variety of building types, with differing methods of construction, from around the world, both historical and extant and classical and modern.",
  "This type of architecture usually serves immediate, local needs, is constrained by the materials available in its particular region and reflects local traditions and cultural practices. The study of vernacular architecture does not examine formally schooled architects, but instead the design skills and tradition of local builders, who were rarely given any attribution for the work.",
  "More recently, vernacular architecture has been examined by designers and the building industry in an effort to be more energy conscious with contemporary design and construction — part of a broader interest in sustainable design.",
];

/** Long body copy so the vertical area overflows and the fade + thumb show. */
function Article() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {PARAGRAPHS.map((p, i) => (
        <Text key={i} render={<p />}>
          {p}
        </Text>
      ))}
    </div>
  );
}

// A wide + tall numbered grid, so it overflows on both axes.
function Grid() {
  return (
    <ul
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 56px)",
        gap: 8,
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {Array.from({ length: 120 }, (_, i) => (
        <li
          key={i}
          style={{
            display: "grid",
            placeItems: "center",
            height: 56,
            borderRadius: 8,
            fontFamily: "system-ui",
            fontVariantNumeric: "tabular-nums",
            background: "#eef0f2",
          }}
        >
          {i + 1}
        </li>
      ))}
    </ul>
  );
}

const meta: Meta<typeof ScrollArea> = {
  title: "Layout/ScrollArea",
  component: ScrollArea,
  args: {
    orientation: "vertical",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal", "both"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

/** Drive `orientation` from the toolbar; the box swaps content to match. */
export const Playground: Story = {
  render: (args) => (
    <ScrollArea
      {...args}
      aria-label="Scrollable region"
      style={{
        height: 240,
        width: 420,
        border: "1px solid #d8d8d8",
        borderRadius: 8,
        padding: 16,
      }}
    >
      {args.orientation === "both" ? <Grid /> : <Article />}
    </ScrollArea>
  ),
};

/** The default: vertical scroll, with the content fading at the top/bottom edges. */
export const Vertical: Story = {
  render: () => (
    <ScrollArea
      aria-label="Article"
      style={{
        height: 240,
        width: 420,
        border: "1px solid #d8d8d8",
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Article />
    </ScrollArea>
  ),
};

/** Horizontal scroll, fading at the inline start/end edges. */
export const Horizontal: Story = {
  render: () => (
    <ScrollArea
      orientation="horizontal"
      aria-label="Tags"
      style={{
        width: 420,
        border: "1px solid #d8d8d8",
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              height: 48,
              paddingInline: 20,
              borderRadius: 9999,
              whiteSpace: "nowrap",
              fontFamily: "system-ui",
              background: "#eef0f2",
            }}
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

/** Both axes: two scrollbars, the corner between them, and a fade on all four edges. */
export const Both: Story = {
  render: () => (
    <ScrollArea
      orientation="both"
      aria-label="Data grid"
      style={{
        height: 280,
        width: 480,
        border: "1px solid #d8d8d8",
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Grid />
    </ScrollArea>
  ),
};
