import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Text } from "../Text";
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
    onDownload: { table: { disable: true } },
    items: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof FileList>;

/** A captioned example, stacked label-over-content. */
const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Text variant="sm" saliency="low">
      {label}
    </Text>
    {children}
  </div>
);

/** A list wired to local state: the × removes, and (when `downloadable`) the ↓ alerts. */
const Interactive = ({
  initial,
  downloadable = false,
  ...props
}: React.ComponentProps<typeof FileList> & {
  initial: FileInfo[];
  downloadable?: boolean;
}) => {
  const [items, setItems] = React.useState(initial);
  return (
    <FileList
      {...props}
      items={items}
      onRemove={(id) => setItems((cur) => cur.filter((f) => f.id !== id))}
      onDownload={
        downloadable
          ? (id) => {
              const hit = items.find((f) => f.id === id);
              if (hit != null) window.alert(`Download ${hit.file.name}`);
            }
          : undefined
      }
    />
  );
};

/**
 * Everything at once — each section reacts to the shared controls (orientation,
 * intent, saliency, size):
 * - **Interactive + downloadable**: mixed file-type icons, per-item `download`
 *   flags and an `intent` override; the × removes and flagged files get a ↓.
 * - **Read-only**: no `onRemove`, so no remove buttons.
 * - **Disabled**: chips dim and buttons go inert (but stay focusable).
 * - **Long file names**: ellipsize when the list is width-constrained.
 */
export const KitchenSink: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 440 }}>
      <Section label="Interactive · mixed types, per-item download">
        <Interactive
          {...args}
          downloadable
          initial={[
            { ...fileInfo("1", "quarterly-report.pdf"), download: true },
            fileInfo("2", "hero-banner.png"),
            { ...fileInfo("3", "data-export-2026-06.csv"), download: true },
            fileInfo("4", "podcast-episode.mp3"),
            fileInfo("5", "assets-bundle.zip"),
            { ...fileInfo("6", "meeting-notes.docx"), download: true },
          ]}
        />
      </Section>

      <Section label="Read-only · no onRemove, no remove buttons">
        <FileList {...args} items={sample()} />
      </Section>

      <Section label="Disabled · chips dim, buttons focusable but inert">
        <Interactive
          {...args}
          disabled
          downloadable
          initial={[
            { ...fileInfo("d1", "quarterly-report.pdf"), download: true },
            fileInfo("d2", "hero-banner.png"),
            fileInfo("d3", "assets-bundle.zip"),
          ]}
        />
      </Section>

      <Section label="Long file names · ellipsize when width-constrained">
        <Interactive
          {...args}
          style={{ maxWidth: 280 }}
          initial={[
            fileInfo("g1", "2026-Q2-board-deck-final-FINAL-v3-reviewed.pdf"),
            fileInfo("g2", "marketing-assets-bundle-hi-res-export.zip"),
          ]}
        />
      </Section>
    </div>
  ),
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => <Interactive {...args} downloadable initial={sample()} />,
};

/** No `onRemove` → a read-only list, no remove buttons. */
export const ReadOnly: Story = {
  args: { items: sample() },
};

/** The whole list disabled: chips dim, remove buttons stay focusable but inert. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Interactive {...args} initial={sample()} />,
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

/**
 * Per-item `download`: only files flagged `download` get a download button
 * (here the report and the export). `onRemove` stays keyed by `id`, so removing
 * one file leaves the rest — and their download buttons — intact.
 */
export const Downloadable: Story = {
  render: (args) => {
    const [items, setItems] = React.useState((): FileInfo[] => [
      { ...fileInfo("1", "quarterly-report.pdf"), download: true },
      fileInfo("2", "hero-banner.png"),
      { ...fileInfo("3", "data-export-2026-06.csv"), download: true },
    ]);
    return (
      <FileList
        {...args}
        items={items}
        onRemove={(id) => setItems((cur) => cur.filter((f) => f.id !== id))}
        onDownload={(id) => {
          // A real consumer would stream / save the File here; the story just
          // proves the affordance is wired and keyed by `id`.
          const hit = items.find((f) => f.id === id);
          if (hit != null) window.alert(`Download ${hit.file.name}`);
        }}
      />
    );
  },
};

/**
 * Element composition: instead of the `items` array, drop `FileList.Item`
 * children in directly — mix per-item overrides (`download`, `intent`) while the
 * list still supplies the shared handlers and defaults.
 */
export const Composed: Story = {
  render: (args) => {
    const [rows, setRows] = React.useState(() => [
      {
        id: "1",
        file: new File([], "signed-contract.pdf"),
        download: true,
        intent: "positive" as const,
      },
      { id: "2", file: new File([], "appendix-a.docx"), download: true },
      { id: "3", file: new File([], "raw-scan.tiff") },
    ]);
    return (
      <FileList
        {...args}
        onRemove={(id) => setRows((cur) => cur.filter((r) => r.id !== id))}
        onDownload={(id) => {
          const hit = rows.find((r) => r.id === id);
          if (hit != null) window.alert(`Download ${hit.file.name}`);
        }}
      >
        {rows.map((row) => (
          <FileList.Item
            key={row.id}
            id={row.id}
            file={row.file}
            download={row.download}
            intent={row.intent}
          />
        ))}
      </FileList>
    );
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
