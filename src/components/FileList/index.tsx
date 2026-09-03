"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Chip, type ChipAdornmentProps } from "../Chip";
import { fileListChip, fileListItem, fileListRoot } from "./fileList.css";
import { FileTypeIcon } from "./fileTypeIcon";

/**
 * One entry in a `FileList`: a stable, unique `id` paired with the underlying
 * browser `File`. The `id` (not the `File`) is what `onRemove`/`onDownload`
 * report and what keys the rendered chip.
 */
export interface FileInfo {
  /** Unique within the list. Used as the React key and the `onRemove` argument. */
  id: string;
  /** The underlying browser `File` (its `name` is shown on the chip). */
  file: File;
  /**
   * Mark this file as downloadable — when the list has `onDownload`, the chip
   * gains a download button that calls back with this `id`.
   */
  download?: boolean;
}

/** Layout direction of the chip list. */
export type FileListOrientation = "vertical" | "horizontal";

/**
 * Group-level state shared with every `FileList.Item` — chip colour/size,
 * disabled flag, and `onRemove`/`onDownload` handlers. Items may override the
 * visual props locally; handlers always come from the list.
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
   * Mark this file as downloadable — when the list has `onDownload`, the chip
   * gains a download button that calls back with this `id`.
   */
  download?: boolean;
  /** Override the list's chip intent for just this item. */
  intent?: Intent;
  /** Override the list's chip saliency for just this item. */
  saliency?: Saliency;
  /** Override the list's chip size for just this item. */
  size?: Size;
  /**
   * Disable just this item (dims it, makes adornment buttons inert but
   * focusable). Defaults to the list's `disabled`.
   */
  disabled?: boolean;
}

/**
 * FileList.Item — one file row, rendered automatically per `FileInfo` in the
 * `items` array, or dropped in directly as `children` for element-composed
 * lists. Inherits the list's chip colour/size, disabled state, and handlers
 * through context; visual props can be overridden per item.
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
        // `disabled` dims the chip (`aria-disabled`, never the native attribute)
        // and, via the Chip's adornment context, makes the buttons inert but focusable.
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
   * `download`), keyed by `id`. Omit and pass `FileList.Item` `children` instead.
   */
  items?: FileInfo[];
  /** Element-composed form: `FileList.Item` elements. Ignored when `items` is provided. */
  children?: React.ReactNode;
  /** Stack the chips in a column (default) or flow them in a wrapping row. */
  orientation?: FileListOrientation;
  /**
   * When provided, each chip gets a remove "×" button that calls back with the
   * item's `id`. Omit for a read-only list.
   */
  onRemove?: (id: string) => void;
  /**
   * When provided, items marked `download` get a download button that calls
   * back with the item's `id`. Omit for no download affordance.
   */
  onDownload?: (id: string) => void;
  /**
   * Dim and disable the whole list. Adornment buttons stay focusable but inert
   * (`aria-disabled`, never the native attribute).
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
 * `FileInfo` with an `id`, a `File`, and an optional `download` flag), or
 * compose rows with `FileList.Item` children. `onRemove` gives each chip a
 * remove "×"; `onDownload` gives `download`-flagged items a download button —
 * both call back with the file's `id`.
 *
 * Each row is a `Chip` with a file-type icon and the filename in a semantic
 * `<ul>`/`<li>`; long filenames ellipsize when width-constrained. The whole
 * list can be `disabled` — chips dim and buttons go inert but stay
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
