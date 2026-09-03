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

// The `Field` (label + dropzone + help) and the staged `FileList` beneath it.
const wrapperClass = atoms({ display: "flex", flexDirection: "column", gap: "2" });
const promptClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textSizeRecipe({ size: "sm" }),
);
const hintClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textSizeRecipe({ size: "xs" }),
);

/** Per-slot overrides for the label / help-text / info pieces. */
export type FileUploadSlotProps = FieldSlotProps;

/**
 * The raw event that drove a `FileUpload` change: a picker `change` or a
 * drag-and-drop. Absent when the change came from removing a staged file.
 */
export type FileUploadChangeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.DragEvent<HTMLDivElement>;

/**
 * Props shared by every `FileUpload`, regardless of `multiple`. The
 * `value`/`onChange`/`multiple` triad lives in the discriminated union below
 * instead, so a single upload's `value` (`FileInfo | null`) can't drift from a
 * multiple's (`FileInfo[]`).
 */
interface FileUploadBaseProps {
  /** Validation state; drives the dropzone accent. `invalid` also sets `aria-invalid` and reddens `helpText`. */
  state?: FormState;
  /** Mark the field required — marks the label and the file `<input>`. */
  required?: boolean;
  /**
   * Allowed file types in the HTML `accept` grammar — extension, wildcard MIME, or
   * exact MIME. Fed to the picker's `accept` and also enforced on drop, where
   * `accept` has no effect. Omit or leave empty to accept anything.
   */
  acceptedFileTypes?: string[];
  /**
   * Dim + lock the dropzone, via `aria-disabled` (not the native attribute) so the
   * input stays keyboard-focusable while clicks, keys and drops are vetoed.
   * `readOnly` is a no-op on file inputs, so the picker is blocked by cancelling
   * the click instead. Staged files dim too, but their remove buttons stay focusable.
   */
  disabled?: boolean;
  /**
   * Extra explanation shown in an `InfoButton` next to the `label`; rendered only
   * when there's a visible `label`. Name the button via `slotProps.info["aria-label"]`
   * (default "More information").
   */
  info?: React.ReactNode;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Native `name` for the file `<input>`, so it participates in `<form>` submission / `FormData`. */
  name?: string;
  /** Guidance shown beneath the dropzone, wired to the input via `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Per-slot overrides for the label / help-text / info pieces. */
  slotProps?: FileUploadSlotProps;
  /** Points the input at extra descriptive text; combines with `helpText`. */
  "aria-describedby"?: string;
  /** Extra className merged onto the dropzone. */
  className?: string;
  /** Ref to the underlying file `<input>`. */
  ref?: React.Ref<HTMLInputElement>;
}

/** Single-file variant: `value` is one `FileInfo` (or `null`). */
export interface SingleFileUploadProps extends FileUploadBaseProps {
  multiple?: false;
  /** The staged file, or `null` when empty (controlled). */
  value: FileInfo | null;
  /**
   * Called with the next staged file (`null` when removed/cleared) first, and
   * the raw event that drove it second — a picker `change` or a drop, `undefined`
   * on removal.
   */
  onChange: (value: FileInfo | null, event?: FileUploadChangeEvent) => void;
}

/** Multi-file variant: `value` is a `FileInfo[]`. */
export interface MultipleFileUploadProps extends FileUploadBaseProps {
  multiple: true;
  /** The staged files (controlled). New selections/drops append to this. */
  value: FileInfo[];
  /**
   * Called with the next staged-files array (after an add or remove) first, and
   * the raw event that drove it second — a picker `change` or a drop, `undefined`
   * on removal.
   */
  onChange: (value: FileInfo[], event?: FileUploadChangeEvent) => void;
}

/**
 * Discriminated on `multiple`, so `value`/`onChange` stay in lockstep — arrays
 * when `multiple`, a lone `FileInfo | null` otherwise; a mismatched pair is a
 * compile error. Intersected with `FieldLabellingProps`: exactly one of `label` /
 * `aria-label` / `aria-labelledby` may name the input.
 */
export type FileUploadProps = (SingleFileUploadProps | MultipleFileUploadProps) &
  FieldLabellingProps;

/**
 * Whether a `File` satisfies `acceptedFileTypes`, using the HTML `accept` grammar
 * — extension, wildcard MIME, or exact MIME. Case-insensitive; empty/absent
 * accepts everything. The native `accept` only filters the picker, so drops are
 * re-checked here.
 */
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

// Monotonic id so each accepted `File` becomes a `FileInfo` with a stable, unique
// key for `FileList`/`onRemove`, carried in `value` across renders.
let fileInfoCounter = 0;
function createFileInfo(file: File): FileInfo {
  fileInfoCounter += 1;
  return { id: `file-upload-${fileInfoCounter}`, file };
}

/** Decorative upload glyph (cloud + up arrow); the input carries the a11y name. */
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

/**
 * FileUpload — a "form control" for staging file(s) for upload. The dropzone is a
 * labelled file `<input>` styled as a dashed drop target: click anywhere to open
 * the picker, or drag and drop. Staged files render below as a removable `FileList`.
 *
 * `value`/`onChange`/`multiple` form a discriminated union — single uploads stage
 * a `FileInfo | null`, multiple a `FileInfo[]` (new items append) — and the whole
 * thing is controlled. Drag-and-drop uses the native HTML5 API: the input overlays
 * the zone to own clicks/keyboard, while drops are filtered against
 * `acceptedFileTypes` (the native `accept` only constrains the picker). Composes
 * `Field` for label/help/error layout and ARIA, and takes the shared `state`, like
 * `TextInput`.
 *
 * @example
 * // Multiple
 * const [files, setFiles] = React.useState<FileInfo[]>([]);
 * <FileUpload
 *   label="Attachments"
 *   multiple
 *   value={files}
 *   onChange={setFiles}
 *   acceptedFileTypes={["image/*", ".pdf"]}
 * />
 *
 * @example
 * // Single
 * const [file, setFile] = React.useState<FileInfo | null>(null);
 * <FileUpload label="Avatar" value={file} onChange={setFile} acceptedFileTypes={["image/*"]} />
 *
 * @example
 * // Named form field with a label InfoButton
 * <FileUpload
 *   label="Resume"
 *   name="resume"
 *   info="PDF preferred; we parse it for your work history."
 *   slotProps={{ info: { "aria-label": "About the resume upload" } }}
 *   value={file}
 *   onChange={setFile}
 * />
 */
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

  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  // Everything the focusable control needs from the field — see `fieldControlAttrs`.
  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };

  const [dragging, setDragging] = React.useState(false);

  // Bridge the `multiple` union to one array-shaped model so the rest of the
  // component is single/multi agnostic; `emit` translates back to the caller's shape.
  const multiple = props.multiple === true;
  const items = props.multiple ? props.value : props.value != null ? [props.value] : [];
  const emit = (next: FileInfo[], event?: FileUploadChangeEvent) => {
    if (props.multiple) props.onChange(next, event);
    else props.onChange(next[0] ?? null, event);
  };

  // Filter by `acceptedFileTypes`, wrap as `FileInfo`s, then append (multiple) or
  // replace with the first (single); no-op when disabled or nothing passes.
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
    // Reset so selecting the same file again still fires `change`.
    event.currentTarget.value = "";
  };

  // Enter/Space on a focused file input dispatches a click too. Cancelling it is
  // how a disabled dropzone blocks the picker while the input stays focusable.
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) event.preventDefault();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    // preventDefault here (and on the drop) is what marks this a valid drop target.
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Cancels the input's native file assignment so we own the drop and can filter it.
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files), event);
  };

  const acceptAttr =
    acceptedFileTypes != null && acceptedFileTypes.length > 0
      ? acceptedFileTypes.join(",")
      : undefined;

  return (
    // `FileList` sits outside `Field` so the help text stays attached to the
    // dropzone it describes, not the staged files below it.
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
        {/* Decorative content is inert; the overlaid input owns clicks + keyboard,
            and drops are caught here to be filtered. */}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the overlaid <input type="file"> below is the real accessible control; this dropzone is a pointer/drag-only enhancement. */}
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
            // `aria-disabled` (never native `disabled`, per AGENTS.md) keeps the input
            // tabbable; the picker is vetoed in `handleClick`.
            aria-disabled={disabled || undefined}
            // `Field.Label` already names the input; this only fills the label-less arms.
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
