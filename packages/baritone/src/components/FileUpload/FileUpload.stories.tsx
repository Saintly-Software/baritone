import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FORM_STATES } from "../../theme/constants";
import { type FileInfo } from "../FileList";
import { FileUpload } from "./index";

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  args: { label: "Attachments", state: "neutral", required: false, disabled: false },
  argTypes: {
    state: { control: "select", options: FORM_STATES },
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

export const Multiple: Story = {
  args: { helpText: "PNG, JPG or PDF — up to 10MB each." },
  render: ({ label, state, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        state={state}
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

export const Single: Story = {
  args: { label: "Avatar" },
  render: ({ label, state, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo | null>(null);
    return (
      <FileUpload
        label={label}
        state={state}
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

export const AnyFileType: Story = {
  render: ({ label, state, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        state={state}
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

export const Invalid: Story = {
  args: { state: "invalid", required: true },
  render: ({ label, state, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        state={state}
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

export const Disabled: Story = {
  args: {
    disabled: true,
    helpText: "Uploads are paused while your plan is being upgraded.",
  },
  render: ({ label, state, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>(() => [
      { id: "1", file: new File([], "quarterly-report.pdf") },
      { id: "2", file: new File([], "hero-banner.png") },
    ]);
    return (
      <FileUpload
        label={label}
        state={state}
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

export const WithInfo: Story = {
  args: {
    label: "Tax documents",
    info: "We accept your W-2 or the most recent 1099. Files are encrypted at rest.",
    helpText: "PDF only — up to 10MB.",
  },
  render: ({ label, info, state, required, disabled, helpText }) => {
    const [value, setValue] = React.useState<FileInfo[]>([]);
    return (
      <FileUpload
        label={label}
        info={info}
        state={state}
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

export const NamedFieldInForm: Story = {
  args: { label: "Resume", helpText: "PDF, DOC or DOCX." },
  render: ({ label, state, required, disabled, helpText }) => {
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
          state={state}
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
