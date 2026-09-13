"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Chip, type ChipAdornmentProps } from "../Chip";
import { fileListChip, fileListItem, fileListRoot } from "./fileList.css";
import { FileTypeIcon } from "./fileTypeIcon";

export interface FileInfo {
  id: string;

  file: File;

  download?: boolean;
}

export type FileListOrientation = "vertical" | "horizontal";

interface FileListContextValue {
  disabled: boolean;
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  onRemove?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const FileListContext = React.createContext<FileListContextValue>({ disabled: false });

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
  id: string;

  file: File;

  download?: boolean;

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  disabled?: boolean;
}

function FileListItem({ id, file, download, intent, saliency, size, disabled }: FileListItemProps) {
  const ctx = React.useContext(FileListContext);
  const itemDisabled = disabled ?? ctx.disabled;
  const showDownload = download === true && ctx.onDownload != null;

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
  items?: FileInfo[];

  children?: React.ReactNode;

  orientation?: FileListOrientation;

  onRemove?: (id: string) => void;

  onDownload?: (id: string) => void;

  disabled?: boolean;

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;
  ref?: React.Ref<HTMLUListElement>;
}

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

export const FileList = Object.assign(FileListRoot, {
  Item: FileListItem,
});
