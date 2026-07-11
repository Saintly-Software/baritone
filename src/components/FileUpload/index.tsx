"use client";
import { Field } from "@base-ui/react/field";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import { cx } from "../../utils/cx";
import { FileList, type FileInfo } from "../FileList";
import { InfoButton, type InfoButtonProps } from "../InfoButton";
import {
  fileUploadContent,
  fileUploadDropzone,
  fileUploadIcon,
  fileUploadInput,
} from "./fileUpload.css";

const wrapperClass = atoms({ display: "flex", flexDirection: "column", gap: "2" });
// Puts the `info` InfoButton on the same baseline as the label text.
const labelRowClass = atoms({ display: "flex", alignItems: "center", gap: "1" });
const labelClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "sm" }),
);
const promptClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "sm" }),
);
const hintClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);
const descriptionClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);

/**
 * Per-slot overrides for the label / help-text / info pieces. Every field is
 * partial — you're layering props onto the slot's own defaults, so
 * `slotProps={{ label: { className: "…" }, info: { side: "right" } }}` re-tunes
 * just those pieces. A `className` set here merges onto (doesn't replace) the
 * slot's built-in class.
 */
export interface FileUploadSlotProps {
  /** Props for the `Field.Label` above the dropzone. */
  label?: React.ComponentPropsWithoutRef<typeof Field.Label>;
  /** Props for the `Field.Description` (help text) below the dropzone. */
  help?: React.ComponentPropsWithoutRef<typeof Field.Description>;
  /**
   * Props for the label's `InfoButton` (only rendered when `info` is set). Use it
   * to override the default `aria-label`, or to tune `side` / `intent` / etc.
   */
  info?: Partial<InfoButtonProps>;
}

/**
 * Props every `FileUpload` takes, regardless of `multiple`. The `value` /
 * `onChange` / `multiple` triad is *not* here — it's split across the
 * discriminated union below so the shapes can't drift (a single upload's `value`
 * is one `FileInfo | null`, a multiple's is a `FileInfo[]`).
 */
interface FileUploadBaseProps {
  /** Negative accent on the dropzone + `aria-invalid` on the input. */
  invalid?: boolean;
  /** Mark the field as required (sets `required` / `aria-required` on the input). */
  required?: boolean;
  /**
   * Allowed file types, in the HTML `accept` grammar — extensions (`.pdf`),
   * wildcard MIME (`image/*`), or exact MIME (`application/pdf`). Fed to the
   * picker's `accept` *and* enforced on the drag-and-drop path (where `accept`
   * has no effect). Omit / empty to accept anything.
   */
  acceptedFileTypes?: string[];
  /**
   * Dim + lock the dropzone. Modelled with `aria-disabled` (not the native
   * `disabled` attribute) so the input stays keyboard-focusable — e.g. it can
   * still be tabbed to and explain itself — while clicks, keyboard activation and
   * drops are vetoed (`readOnly` is a no-op on file inputs, so the picker is
   * blocked by cancelling the click instead). Staged files dim too but their
   * remove buttons stay focusable.
   */
  disabled?: boolean;
  /** Visible field label; also the input's accessible name (via base-ui `Field`). */
  label?: React.ReactNode;
  /**
   * Extra explanation surfaced in an `InfoButton` next to the `label` (the "i"
   * affordance). Rendered only when there's a visible `label`. Give the button an
   * accessible name via `slotProps.info["aria-label"]` (defaults to "More
   * information").
   */
  info?: React.ReactNode;
  /**
   * Native form field `name` for the underlying file `<input>`, so the control
   * participates in `<form>` submission / `FormData`.
   */
  name?: string;
  /**
   * Supplementary guidance shown beneath the dropzone and wired to the input as
   * its accessible description (`aria-describedby`).
   */
  helpText?: React.ReactNode;
  /** Per-slot overrides for the label / help-text / info pieces. */
  slotProps?: FileUploadSlotProps;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  /** Accessible name by reference when the label lives elsewhere. */
  "aria-labelledby"?: string;
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
  /** Called with the next staged file (or `null` when it's removed/cleared). */
  onChange: (value: FileInfo | null) => void;
}

/** Multi-file variant: `value` is a `FileInfo[]`. */
export interface MultipleFileUploadProps extends FileUploadBaseProps {
  multiple: true;
  /** The staged files (controlled). New selections/drops append to this. */
  value: FileInfo[];
  /** Called with the next staged-files array (after an add or a remove). */
  onChange: (value: FileInfo[]) => void;
}

/**
 * Discriminated on `multiple`, so `value` and `onChange` are always in lockstep:
 * `multiple` ⇒ arrays, otherwise a lone `FileInfo | null`. TypeScript narrows
 * both from the single `multiple` flag, so a mismatched pair is a compile error.
 */
export type FileUploadProps = SingleFileUploadProps | MultipleFileUploadProps;

/**
 * Whether a dropped/selected `File` satisfies `acceptedFileTypes`, using the same
 * grammar as the HTML `accept` attribute: a leading-dot extension (`.pdf`), a
 * wildcard MIME (`image/*`), or an exact MIME (`application/pdf`). Case-insensitive;
 * an empty / absent list accepts everything. The native `accept` only filters the
 * picker, so the drop path has to re-check it here.
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

/**
 * Fold a slot's caller-supplied `className` (base-ui's `string | (state) => …`
 * form) together with the built-in `base` class, returning the function form
 * base-ui always accepts. Keeps our base class and lets the caller add to it.
 */
function mergeSlotClass<S>(
  base: string,
  slot: string | ((state: S) => string | undefined) | undefined,
) {
  return (state: S) => cx(base, typeof slot === "function" ? slot(state) : slot);
}

// Monotonic id so each accepted `File` becomes a `FileInfo` with a stable, unique
// key for `FileList` / `onRemove`. Created once at selection time and then carried
// in `value`, so it stays stable across renders.
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
 * FileUpload — a "form control" element type for staging file(s) for upload. The
 * dropzone is a labelled file `<input>` styled as a dashed drop target: clicking
 * it (anywhere) opens the system file picker, dragging files over it highlights
 * it, and dropping them stages them. Staged files render below as a `FileList`,
 * each removable.
 *
 * The `value` / `onChange` / `multiple` triad is a **discriminated union** on
 * `multiple`: single uploads stage one `FileInfo | null`, multiple uploads a
 * `FileInfo[]` (new selections/drops append). The whole thing is controlled — you
 * own `value` and the ids in it.
 *
 * Drag-and-drop is the native HTML5 API (no extra dependency): the input overlays
 * the zone transparently to own clicks + keyboard, while drops are intercepted on
 * the zone so they can be filtered against `acceptedFileTypes` (the native
 * `accept` only constrains the picker). Built on base-ui's `Field` for label
 * association + `invalid` → `aria-invalid` wiring, like `TextInput`.
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
    invalid = false,
    required = false,
    disabled = false,
    acceptedFileTypes,
    label,
    info,
    name,
    helpText,
    slotProps,
    className,
    ref,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  } = props;

  // Split each slot's own `className` out so it merges *onto* the built-in class
  // instead of clobbering it when the rest of the slot props spread. base-ui's
  // Field parts accept a `string` or a `(state) => string` for `className`;
  // `mergeSlotClass` folds either form together with our base class into the
  // function form base-ui always accepts.
  const { className: labelSlotClass, ...labelSlotProps } = slotProps?.label ?? {};
  const { className: helpSlotClass, ...helpSlotProps } = slotProps?.help ?? {};

  const [dragging, setDragging] = React.useState(false);

  // Bridge the `multiple` discriminated union to one array-shaped model so the
  // rest of the component is single/multi agnostic. `emit` translates an array
  // back to the caller's shape (a lone `FileInfo | null`, or the array).
  const multiple = props.multiple === true;
  const items = props.multiple ? props.value : props.value != null ? [props.value] : [];
  const emit = (next: FileInfo[]) => {
    if (props.multiple) props.onChange(next);
    else props.onChange(next[0] ?? null);
  };

  // Filter by `acceptedFileTypes`, wrap as `FileInfo`s, then append (multiple) or
  // replace with the first (single). No-op when disabled or nothing passes.
  const addFiles = (incoming: File[]) => {
    if (disabled) return;
    const accepted = incoming.filter((file) => matchesAccept(file, acceptedFileTypes));
    if (accepted.length === 0) return;
    const infos = accepted.map(createFileInfo);
    emit(multiple ? [...items, ...infos] : infos.slice(0, 1));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.currentTarget.files;
    if (selected != null && selected.length > 0) addFiles(Array.from(selected));
    // Reset so selecting the same file again still fires `change`.
    event.currentTarget.value = "";
  };

  // A focused file input opens the picker on Enter/Space and click — both arrive
  // here as a click (keyboard activation dispatches one). Cancelling it is how a
  // disabled dropzone blocks the picker while the input stays focusable.
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
    // Cancels the overlaid input's native file assignment so we own the drop and
    // can filter it (and apply single/multiple semantics) before staging.
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const state = invalid ? "invalid" : "neutral";
  const acceptAttr =
    acceptedFileTypes != null && acceptedFileTypes.length > 0
      ? acceptedFileTypes.join(",")
      : undefined;

  // Only forward the aria-* names the consumer actually set. base-ui's Field
  // auto-points the control's `aria-labelledby` at the `Field.Label`; passing an
  // explicit `undefined` here would overwrite (clobber) that association, so the
  // visible `label` would stop naming the input.
  const ariaProps: { "aria-label"?: string; "aria-labelledby"?: string } = {};
  if (ariaLabel != null) ariaProps["aria-label"] = ariaLabel;
  if (ariaLabelledby != null) ariaProps["aria-labelledby"] = ariaLabelledby;

  return (
    <Field.Root className={wrapperClass} invalid={invalid}>
      {label != null &&
        (info != null ? (
          <div className={labelRowClass}>
            <Field.Label className={mergeSlotClass(labelClass, labelSlotClass)} {...labelSlotProps}>
              {label}
            </Field.Label>
            <InfoButton aria-label="More information" {...slotProps?.info}>
              {info}
            </InfoButton>
          </div>
        ) : (
          <Field.Label className={mergeSlotClass(labelClass, labelSlotClass)} {...labelSlotProps}>
            {label}
          </Field.Label>
        ))}
      {/* The drop target. Decorative content is inert; the overlaid input owns
          clicks + keyboard, and drops are caught here so they can be filtered. */}
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
          // `aria-disabled` (never the native `disabled`, per AGENTS.md) keeps the
          // input in the tab order; the picker is vetoed in `handleClick`.
          aria-disabled={disabled || undefined}
          {...ariaProps}
          className={fileUploadInput}
          onChange={handleInputChange}
        />
      </div>
      {helpText != null && (
        <Field.Description
          className={mergeSlotClass(descriptionClass, helpSlotClass)}
          {...helpSlotProps}
        >
          {helpText}
        </Field.Description>
      )}
      {items.length > 0 && (
        <FileList
          items={items}
          disabled={disabled}
          onRemove={(id) => emit(items.filter((file) => file.id !== id))}
        />
      )}
    </Field.Root>
  );
}
