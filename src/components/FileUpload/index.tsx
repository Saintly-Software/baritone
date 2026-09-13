"use client";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { textIntentRecipe, textSizeRecipe } from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { FormState, LabelPosition } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldControlInput,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldControlAttrs,
  type FieldSlotProps,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { FileList, type FileInfo } from "../FileList";
import {
  fileUploadContent,
  fileUploadDropzone,
  fileUploadIcon,
  fileUploadInput,
} from "./fileUpload.css";

const wrapperClass = atoms({ display: "flex", flexDirection: "column", gap: "2" });
const promptClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textSizeRecipe({ size: "sm" }),
);
const hintClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textSizeRecipe({ size: "xs" }),
);

export type FileUploadSlotProps = FieldSlotProps;

export type FileUploadChangeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.DragEvent<HTMLDivElement>;

interface FileUploadBaseProps {
  state?: FormState;

  required?: boolean;

  acceptedFileTypes?: string[];

  disabled?: boolean;

  info?: React.ReactNode;

  labelPosition?: LabelPosition;

  name?: string;

  helpText?: React.ReactNode;

  slotProps?: FileUploadSlotProps;

  "aria-describedby"?: string;

  className?: string;

  ref?: React.Ref<HTMLInputElement>;
}

export interface SingleFileUploadProps extends FileUploadBaseProps {
  multiple?: false;

  value: FileInfo | null;

  onChange: (value: FileInfo | null, event?: FileUploadChangeEvent) => void;
}

export interface MultipleFileUploadProps extends FileUploadBaseProps {
  multiple: true;

  value: FileInfo[];

  onChange: (value: FileInfo[], event?: FileUploadChangeEvent) => void;
}

export type FileUploadProps = (SingleFileUploadProps | MultipleFileUploadProps) &
  FieldLabellingProps;

export function matchesAccept(file: File, acceptedFileTypes?: string[]): boolean {
  if (acceptedFileTypes == null || acceptedFileTypes.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return acceptedFileTypes.some((raw) => {
    const token = raw.trim().toLowerCase();
    if (token === "") return false;
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

let fileInfoCounter = 0;
function createFileInfo(file: File): FileInfo {
  fileInfoCounter += 1;
  return { id: `file-upload-${fileInfoCounter}`, file };
}

function UploadGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 16V7m0 0l-3.5 3.5M12 7l3.5 3.5" />
      <path d="M20 16.5A4.5 4.5 0 0 0 17.5 8h-1.1A7 7 0 1 0 5 15" />
    </svg>
  );
}

export function FileUpload(props: FileUploadProps) {
  const {
    state = "neutral",
    required = false,
    disabled: disabledProp = false,
    acceptedFileTypes,
    label,
    info,
    labelPosition = "top",
    name,
    helpText,
    slotProps,
    className,
    ref,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  } = props as FileUploadBaseProps & FieldLabellingInput;

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };

  const [dragging, setDragging] = React.useState(false);

  const multiple = props.multiple === true;
  const items = props.multiple ? props.value : props.value != null ? [props.value] : [];
  const emit = (next: FileInfo[], event?: FileUploadChangeEvent) => {
    if (props.multiple) props.onChange(next, event);
    else props.onChange(next[0] ?? null, event);
  };

  const addFiles = (incoming: File[], event?: FileUploadChangeEvent) => {
    if (disabled) return;
    const accepted = incoming.filter((file) => matchesAccept(file, acceptedFileTypes));
    if (accepted.length === 0) return;
    const infos = accepted.map(createFileInfo);
    emit(multiple ? [...items, ...infos] : infos.slice(0, 1), event);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.currentTarget.files;
    if (selected != null && selected.length > 0) addFiles(Array.from(selected), event);
    event.currentTarget.value = "";
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) event.preventDefault();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files), event);
  };

  const acceptAttr =
    acceptedFileTypes != null && acceptedFileTypes.length > 0
      ? acceptedFileTypes.join(",")
      : undefined;

  return (
    <div className={wrapperClass}>
      <Field
        {...(controlProps as FieldLabellingProps)}
        helpText={helpText}
        info={info}
        state={state}
        required={required}
        labelPosition={labelPosition}
        disabled={disabled}
        slotProps={slotProps}
      >
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the overlaid `Field.Control` <input type="file"> below is the accessible control (keyboard + focus); this dropzone is a pointer/drag-only enhancement. */}
        <div
          className={cx(
            fileUploadDropzone({ state }),
            focusRingRecipe({ type: "within", offset: "sm" }),
            className,
          )}
          aria-disabled={disabled || undefined}
          data-dragging={dragging || undefined}
          onClick={handleClick}
          onDragEnter={(event) => {
            if (disabled) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={handleDragOver}
          onDragLeave={(event) => {
            if (disabled) return;
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
        >
          <UploadGlyph className={fileUploadIcon} />
          <div className={fileUploadContent}>
            <span className={promptClass}>
              <strong>Click to upload</strong> or drag and drop
            </span>
            {acceptedFileTypes != null && acceptedFileTypes.length > 0 && (
              <span className={hintClass}>{acceptedFileTypes.join(", ")}</span>
            )}
          </div>
          <Field.Control
            ref={ref}
            type="file"
            name={name}
            multiple={multiple}
            accept={acceptAttr}
            required={required}
            aria-disabled={disabled || undefined}
            {...fieldControlAttrs(controlProps)}
            className={fileUploadInput}
            onChange={handleInputChange}
          />
        </div>
      </Field>
      {items.length > 0 && (
        <FileList
          items={items}
          disabled={disabled}
          onRemove={(id) => emit(items.filter((file) => file.id !== id))}
        />
      )}
    </div>
  );
}
