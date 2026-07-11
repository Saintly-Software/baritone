import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { type FileInfo } from "../FileList";
import { FileUpload } from "./index";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  args: { label: "Attachments", invalid: false, required: false, disabled: false },
  argTypes: {
    invalid: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    info: { control: "text" },
    name: { control: "text" },
    helpText: { control: "text" },
    slotProps: { table: { disable: true } },
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    multiple: { table: { disable: true } },
    acceptedFileTypes: { table: { disable: true } },
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FileUpload>;

/** Multiple files: each new pick/drop appends; chips below remove on ×. */
export const Multiple: Story = {
  args: { helpText: "PNG, JPG or PDF — up to 10MB each." },
  render: ({ label, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        invalid={invalid}
        required={required}
        disabled={disabled}
        helpText={helpText}
        multiple
        value={value}
        onChange={setValue}
        acceptedFileTypes={["image/*", ".pdf"]}
      />
    );
  },
};

/** Single file: a new pick/drop replaces the staged one. */
export const Single: Story = {
  args: { label: "Avatar" },
  render: ({ label, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo | null>(null);
    return (
      <FileUpload
        label={label}
        invalid={invalid}
        required={required}
        disabled={disabled}
        helpText={helpText}
        value={value}
        onChange={setValue}
        acceptedFileTypes={["image/*"]}
      />
    );
  },
};

/** No `acceptedFileTypes` → any file is allowed (no hint line). */
export const AnyFileType: Story = {
  render: ({ label, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        invalid={invalid}
        required={required}
        disabled={disabled}
        helpText={helpText}
        multiple
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** Invalid + required: negative border + `aria-invalid` on the input. */
export const Invalid: Story = {
  args: { invalid: true, required: true },
  render: ({ label, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        invalid={invalid}
        required={required}
        disabled={disabled}
        helpText={helpText}
        multiple
        value={value}
        onChange={setValue}
        acceptedFileTypes={[".csv", ".xlsx"]}
      />
    );
  },
};

/**
 * Disabled: the dropzone dims and won't open the picker or accept drops, but the
 * input stays keyboard-focusable (`aria-disabled`, not the native attribute), and
 * staged chips dim with inert-but-focusable remove buttons.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    helpText: "Uploads are paused while your plan is being upgraded.",
  },
  render: ({ label, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>(() => [
      { id: "1", file: new File([], "quarterly-report.pdf") },
      { id: "2", file: new File([], "hero-banner.png") },
    ]);
    return (
      <FileUpload
        label={label}
        invalid={invalid}
        required={required}
        disabled={disabled}
        helpText={helpText}
        multiple
        value={value}
        onChange={setValue}
        acceptedFileTypes={["image/*", ".pdf"]}
      />
    );
  },
};

/** An `info` "i" affordance sits next to the label, opening a `Popover` on click. */
export const WithInfo: Story = {
  args: {
    label: "Tax documents",
    info: "We accept your W-2 or the most recent 1099. Files are encrypted at rest.",
    helpText: "PDF only — up to 10MB.",
  },
  render: ({ label, info, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        info={info}
        invalid={invalid}
        required={required}
        disabled={disabled}
        helpText={helpText}
        multiple
        value={value}
        onChange={setValue}
        acceptedFileTypes={[".pdf"]}
        slotProps={{ info: { "aria-label": "About accepted tax documents" } }}
      />
    );
  },
};

/** A `name`d field inside a `<form>`: the file shows up in `FormData` on submit. */
export const NamedFieldInForm: Story = {
  args: { label: "Resume", helpText: "PDF, DOC or DOCX." },
  render: ({ label, invalid, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo | null>(null);
    const [submitted, setSubmitted] = React.useState<string | null>(null);
    return (
      <form
        style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const file = data.get("resume");
          setSubmitted(file instanceof File ? file.name || "(empty file)" : "(no file)");
        }}
      >
        <FileUpload
          label={label}
          name="resume"
          invalid={invalid}
          required={required}
          disabled={disabled}
          helpText={helpText}
          value={value}
          onChange={setValue}
          acceptedFileTypes={[".pdf", ".doc", ".docx"]}
        />
        <button type="submit">Submit</button>
        {submitted != null && <span>Submitted: {submitted}</span>}
      </form>
    );
  },
};

/** Labelled by reference instead of a visible `label`. */
export const AriaLabelledBy: Story = {
  args: { label: undefined },
  render: () => {
    const [value, setValue] = React.useState<FileInfo | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 id="upload-heading" style={{ margin: 0 }}>
          Upload your resume
        </h3>
        <FileUpload
          aria-labelledby="upload-heading"
          acceptedFileTypes={[".pdf", ".doc", ".docx"]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};
