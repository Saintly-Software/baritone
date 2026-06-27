import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { FileList, type FileInfo } from "./index";

/** Storybook-only helper: a `FileInfo` with a real (empty) `File`. */
const fileInfo = (id: string, name: string): FileInfo => ({ id, file: new File([], name) });

const sample = (): FileInfo[] => [
  fileInfo("1", "quarterly-report.pdf"),
  fileInfo("2", "hero-banner.png"),
  fileInfo("3", "data-export-2026-06.csv"),
  fileInfo("4", "podcast-episode.mp3"),
  fileInfo("5", "assets-bundle.zip"),
  fileInfo("6", "meeting-notes.docx"),
];

const meta: Meta<typeof FileList> = {
  title: "Components/FileList",
  component: FileList,
  args: { orientation: "vertical", disabled: false },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
    disabled: { control: "boolean" },
    onRemove: { table: { disable: true } },
    items: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof FileList>;

/** Removable + interactive: the × actually drops the file from local state. */
export const Playground: Story = {
  render: (args) => {
    const [items, setItems] = React.useState(sample);
    return (
      <FileList
        {...args}
        items={items}
        onRemove={(id) => setItems((cur) => cur.filter((f) => f.id !== id))}
      />
    );
  },
};

export const Horizontal: Story = {
  ...Playground,
  args: { orientation: "horizontal" },
};

/** No `onRemove` → a read-only list, no remove buttons. */
export const ReadOnly: Story = {
  args: { items: sample() },
};

/** The whole list disabled: chips dim, remove buttons stay focusable but inert. */
export const Disabled: Story = {
  ...Playground,
  args: { disabled: true },
};

/** One chip per file-type icon (image, audio, video, pdf, spreadsheet, archive, doc, generic). */
export const FileTypes: Story = {
  args: {
    orientation: "horizontal",
    items: [
      fileInfo("img", "photo.png"),
      fileInfo("aud", "track.mp3"),
      fileInfo("vid", "clip.mp4"),
      fileInfo("pdf", "invoice.pdf"),
      fileInfo("xls", "budget.xlsx"),
      fileInfo("zip", "backup.zip"),
      fileInfo("doc", "readme.txt"),
      fileInfo("bin", "firmware"),
    ],
  },
};

/** Long filenames ellipsize when the list is width-constrained. */
export const LongFileNames: Story = {
  render: (args) => {
    const [items, setItems] = React.useState((): FileInfo[] => [
      fileInfo("1", "2026-Q2-board-deck-final-FINAL-v3-reviewed.pdf"),
      fileInfo("2", "marketing-assets-bundle-hi-res-export.zip"),
    ]);
    return (
      <div style={{ maxWidth: 280 }}>
        <FileList
          {...args}
          items={items}
          onRemove={(id) => setItems((cur) => cur.filter((f) => f.id !== id))}
        />
      </div>
    );
  },
};
