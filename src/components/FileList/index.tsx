"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Chip, type ChipAdornmentProps } from "../Chip";
import { fileListChip, fileListItem, fileListRoot } from "./fileList.css";
import { FileTypeIcon } from "./fileTypeIcon";

/**
 * One entry in a `FileList`: a stable, unique `id` paired with the underlying
 * browser `File`. The `id` (not the `File`) is what `onRemove` / `onDownload`
 * report and what keys the rendered chip, so it must be unique within the list
 * and stable across renders.
 */
export interface FileInfo {
  /** Unique within the list. Used as the React key and the `onRemove` argument. */
  id: string;
  /** The underlying browser `File` (its `name` is shown on the chip). */
  file: File;
  /**
   * Mark this file as downloadable: when the list has an `onDownload` handler,
   * the chip gains a download affordance that calls back with this `id`.
   */
  download?: boolean;
}

/** Layout direction of the chip list. */
export type FileListOrientation = "vertical" | "horizontal";

/**
 * Group-level state shared with every `FileList.Item` — the chip colour/size,
 * the disabled flag, and the `onRemove` / `onDownload` handlers. An item may
 * override the visual props locally; the handlers always come from the list.
 */
interface FileListContextValue {
  disabled: boolean;
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  onRemove?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const FileListContext = React.createContext<FileListContextValue>({ disabled: false });

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

/** A downward arrow into a tray; decorative — the download adornment names itself. */
function DownloadGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}

export interface FileListItemProps {
  /** Unique within the list. Used as the `onRemove` / `onDownload` argument. */
  id: string;
  /** The underlying browser `File` (its `name` is shown on the chip). */
  file: File;
  /**
   * Mark this file as downloadable: when the list has an `onDownload` handler,
   * the chip gains a download affordance that calls back with this `id`.
   */
  download?: boolean;
  /** Override the list's chip intent for just this item. */
  intent?: Intent;
  /** Override the list's chip saliency for just this item. */
  saliency?: Saliency;
  /** Override the list's chip size for just this item. */
  size?: Size;
  /**
   * Disable just this item (dim it, make its adornment buttons inert but still
   * focusable). Defaults to the list's `disabled`.
   */
  disabled?: boolean;
}

/**
 * FileList.Item — one file row. Rendered automatically for each `FileInfo` when
 * you pass the `items` array, or dropped in as `children` for element-composed
 * lists (`<FileList><FileList.Item … /></FileList>`). It inherits the list's
 * chip colour/size, disabled state, and the `onRemove` / `onDownload` handlers
 * through context; the visual props can be overridden per item.
 */
function FileListItem({ id, file, download, intent, saliency, size, disabled }: FileListItemProps) {
  const ctx = React.useContext(FileListContext);
  const itemDisabled = disabled ?? ctx.disabled;
  const showDownload = download === true && ctx.onDownload != null;

  // Trailing adornments, in order: download (if downloadable), then remove.
  const trail: Array<React.ReactElement<ChipAdornmentProps>> = [];
  if (showDownload) {
    trail.push(
      <Chip.Adornment
        key="download"
        icon={<DownloadGlyph />}
        label={`Download ${file.name}`}
        onClick={() => ctx.onDownload?.(id)}
      />,
    );
  }
  if (ctx.onRemove != null) {
    trail.push(
      <Chip.Adornment
        key="remove"
        icon={<CloseGlyph />}
        label={`Remove ${file.name}`}
        onClick={() => ctx.onRemove?.(id)}
      />,
    );
  }

  return (
    <li className={fileListItem}>
      <Chip
        intent={intent ?? ctx.intent}
        saliency={saliency ?? ctx.saliency}
        size={size ?? ctx.size}
        // `disabled` dims the chip (modelled as `aria-disabled`, never the
        // native attribute) and, through the Chip's adornment context, makes
        // the download / remove buttons inert while keeping them focusable.
        disabled={itemDisabled}
        className={fileListChip}
        leadAdornments={[<Chip.Adornment key="type" icon={<FileTypeIcon file={file} />} />]}
        trailAdornments={trail.length > 0 ? trail : undefined}
      >
        {file.name}
      </Chip>
    </li>
  );
}

export interface FileListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  /**
   * The files to render, each a `FileInfo` (`id` + `File`, optionally
   * `download`). Keyed by `id`. Omit and pass `FileList.Item` `children` instead
   * for element-composed lists.
   */
  items?: FileInfo[];
  /**
   * Element-composed form: `FileList.Item` elements. Ignored when `items` is
   * provided (the data array wins).
   */
  children?: React.ReactNode;
  /** Stack the chips in a column (default) or flow them in a wrapping row. */
  orientation?: FileListOrientation;
  /**
   * When provided, each chip gets a remove "×" button that calls back with the
   * item's `id`. Omit for a read-only list.
   */
  onRemove?: (id: string) => void;
  /**
   * When provided, each item marked `download` gets a download button that calls
   * back with the item's `id`. Omit (or leave items un-`download`ed) for no
   * download affordance.
   */
  onDownload?: (id: string) => void;
  /**
   * Dim and disable the whole list. Adornment buttons stay keyboard-focusable
   * but inert (modelled with `aria-disabled`, never the native attribute).
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

/**
 * FileList — renders a set of files as a list of chips, stacked vertically
 * (default) or flowed horizontally. Provide files as the `items` array (each a
 * `FileInfo` with a unique `id`, a browser `File`, and an optional `download`
 * flag), or compose the rows yourself with `FileList.Item` `children` for
 * advanced cases. Pass `onRemove` to give each chip a remove "×", and
 * `onDownload` to give items marked `download` a download button — both call
 * back with that file's `id`.
 *
 * Each row is a `Chip` showing a file-type icon (derived from the `File`'s MIME
 * type / extension) and the filename, inside a semantic `<ul>` / `<li>`.
 * A long filename ellipsizes when the chip is width-constrained. The whole list
 * can be `disabled` — chips dim and adornment buttons go inert while staying
 * keyboard-reachable (`aria-disabled`, per AGENTS.md).
 *
 * @example
 * const [files, setFiles] = React.useState<FileInfo[]>([
 *   { id: "1", file: someFile, download: true },
 * ]);
 * <FileList
 *   items={files}
 *   orientation="horizontal"
 *   onRemove={(id) => setFiles((cur) => cur.filter((f) => f.id !== id))}
 *   onDownload={(id) => downloadFile(files.find((f) => f.id === id))}
 * />
 */
function FileListRoot({
  items,
  children,
  orientation = "vertical",
  onRemove,
  onDownload,
  disabled = false,
  intent,
  saliency,
  size,
  className,
  ref,
  ...rest
}: FileListProps) {
  const ctx = React.useMemo<FileListContextValue>(
    () => ({ disabled, intent, saliency, size, onRemove, onDownload }),
    [disabled, intent, saliency, size, onRemove, onDownload],
  );

  return (
    <FileListContext.Provider value={ctx}>
      <ul ref={ref} className={cx(fileListRoot({ orientation }), className)} {...rest}>
        {/* The data array wins when provided; otherwise render composed children. */}
        {items != null ? items.map((info) => <FileListItem key={info.id} {...info} />) : children}
      </ul>
    </FileListContext.Provider>
  );
}

FileListRoot.displayName = "FileList";
FileListItem.displayName = "FileList.Item";

/** FileList with its `Item` part attached. */
export const FileList = Object.assign(FileListRoot, {
  Item: FileListItem,
});
