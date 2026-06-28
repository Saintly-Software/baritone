"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Chip } from "../Chip";
import { fileListChip, fileListItem, fileListRoot } from "./fileList.css";
import { FileTypeIcon } from "./fileTypeIcon";

/**
 * One entry in a `FileList`: a stable, unique `id` paired with the underlying
 * browser `File`. The `id` (not the `File`) is what `onRemove` reports and what
 * keys the rendered chip, so it must be unique within the list and stable across
 * renders.
 */
export interface FileInfo {
  /** Unique within the list. Used as the React key and the `onRemove` argument. */
  id: string;
  /** The underlying browser `File` (its `name` is shown on the chip). */
  file: File;
}

/** Layout direction of the chip list. */
export type FileListOrientation = "vertical" | "horizontal";

export interface FileListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  /** The files to render, each a `FileInfo` (`id` + `File`). Keyed by `id`. */
  items: FileInfo[];
  /** Stack the chips in a column (default) or flow them in a wrapping row. */
  orientation?: FileListOrientation;
  /**
   * When provided, each chip gets a remove "×" button that calls back with the
   * `FileInfo.id`. Omit for a read-only list.
   */
  onRemove?: (id: string) => void;
  /**
   * Dim and disable the whole list. Remove buttons stay keyboard-focusable but
   * inert (modelled with `aria-disabled`, never the native attribute).
   */
  disabled?: boolean;
  /** Chip colour intent. Defaults to the `Chip` default (`neutral`). */
  intent?: Intent;
  /** Chip saliency. Defaults to the `Chip` default (`mid`). */
  saliency?: Saliency;
  /** Chip size. Defaults to the `Chip` default (`md`). */
  size?: Size;
  ref?: React.Ref<HTMLUListElement>;
}

/** A small "×" glyph; decorative — the remove adornment carries the accessible name. */
function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/**
 * FileList — renders a set of files as a list of chips, stacked vertically
 * (default) or flowed horizontally. Files are passed as `items` (each a
 * `FileInfo` with a unique `id` and a browser `File`); pass `onRemove` to give
 * each chip a remove "×" that calls back with that file's `id`.
 *
 * Each row is a `Chip` showing a file-type icon (derived from the `File`'s MIME
 * type / extension) and the filename, inside a semantic `<ul>` / `<li>`.
 * A long filename ellipsizes when the chip is width-constrained. The whole list
 * can be `disabled` — chips dim and remove buttons go inert while staying
 * keyboard-reachable (`aria-disabled`, per AGENTS.md).
 *
 * @example
 * const [files, setFiles] = React.useState<FileInfo[]>([
 *   { id: "1", file: someFile },
 * ]);
 * <FileList
 *   items={files}
 *   orientation="horizontal"
 *   onRemove={(id) => setFiles((cur) => cur.filter((f) => f.id !== id))}
 * />
 */
export function FileList({
  items,
  orientation = "vertical",
  onRemove,
  disabled = false,
  intent,
  saliency,
  size,
  className,
  ref,
  ...rest
}: FileListProps) {
  return (
    <ul ref={ref} className={cx(fileListRoot({ orientation }), className)} {...rest}>
      {items.map(({ id, file }) => (
        <li key={id} className={fileListItem}>
          <Chip
            intent={intent}
            saliency={saliency}
            size={size}
            // `disabled` dims the chip (modelled as `aria-disabled`, never the
            // native attribute) and, through the Chip's adornment context, makes
            // the remove button inert while keeping it keyboard-focusable.
            disabled={disabled}
            className={fileListChip}
            leadAdornments={[<Chip.Adornment icon={<FileTypeIcon file={file} />} />]}
            trailAdornments={
              onRemove != null
                ? [
                    <Chip.Adornment
                      icon={<CloseGlyph />}
                      label={`Remove ${file.name}`}
                      onClick={() => onRemove(id)}
                    />,
                  ]
                : undefined
            }
          >
            {file.name}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
