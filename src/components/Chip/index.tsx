"use client";
import { Popover as BasePopover } from "@base-ui/react/popover";
import * as React from "react";
import { chipBoxClassName } from "../../internal/components/InternalChip";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { mergeProps, RenderElement, useRender, type RenderProp } from "../../utils/render";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import type { PopoverProps } from "../Popover";
import { chipLabelRecipe } from "./chip.css";
import { chipAdornmentRecipe } from "./chipAdornment.css";

/**
 * What a Chip publishes to its adornments — the resolved `intent` / `saliency` /
 * `size` (so an icon render function can branch and scale to the box) and
 * `disabled` (so a clickable adornment goes inert with the chip).
 */
interface ChipAdornmentContextValue {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  disabled?: boolean;
}

const ChipAdornmentContext = React.createContext<ChipAdornmentContextValue>({});

/** The chip state an adornment/icon render function can branch on. */
export interface ChipIconState {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  disabled: boolean;
}

interface ChipAdornmentBaseProps {
  /** The icon to render — a bare glyph, an `<Icon>`, or a render function. */
  icon: IconSlot<ChipIconState>;
  /** Colour intent for this adornment. Defaults to the parent Chip's intent. */
  intent?: Intent;
}

/**
 * A plain, non-interactive adornment — just a decorative or labelled icon.
 * Provide `label` to give it an accessible name (`role="img"`); omit it for a
 * purely decorative glyph.
 */
export interface ChipRegularAdornmentProps extends ChipAdornmentBaseProps {
  /** Accessible name. Omit for a decorative icon. */
  label?: string;
  onClick?: never;
  href?: never;
  disabled?: never;
  render?: never;
  forcePropagation?: never;
}

/**
 * A clickable adornment — renders a real `<button>`. Use for an action attached
 * to the chip, e.g. a remove "×".
 */
export interface ChipButtonAdornmentProps extends ChipAdornmentBaseProps {
  /** Activation handler. Makes the adornment a `<button>`. Suppressed while inert. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Required accessible name for the icon-only button. */
  label: string;
  /**
   * Disables the button via `aria-disabled` (never the native attribute) so it
   * stays keyboard-focusable; the click is swallowed. A disabled Chip also makes
   * its clickable adornments inert.
   */
  disabled?: boolean;
  /**
   * By default a button adornment's click is stopped from bubbling past the chip.
   * Set this to let it propagate up to a clickable ancestor.
   */
  forcePropagation?: boolean;
  href?: never;
  render?: never;
}

/**
 * A link adornment — renders a real `<a>` (or your router's link via `render`).
 */
export interface ChipLinkAdornmentProps extends ChipAdornmentBaseProps {
  /** Destination. Makes the adornment an `<a>`. */
  href: string;
  /** Required accessible name for the icon-only link. */
  label: string;
  /**
   * Render as a different element/component (base-ui `render` pattern) — e.g.
   * your router's link — while keeping the styling. Renders a plain `<a>` when
   * omitted.
   */
  render?: RenderProp;
  onClick?: never;
  disabled?: never;
  forcePropagation?: never;
}

/**
 * A Chip adornment, as one of three shapes:
 *   - **regular** — a decorative/labelled icon (default),
 *   - **button** — pass `onClick` (+ required `label`) for a clickable control,
 *   - **link** — pass `href` (+ required `label`) for a navigable link.
 */
export type ChipAdornmentProps =
  | ChipRegularAdornmentProps
  | ChipButtonAdornmentProps
  | ChipLinkAdornmentProps;

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

/** A pair of overlapping sheets; decorative — the copy adornment carries the accessible name. */
function CopyGlyph() {
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
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

/** A checkmark shown briefly after a successful copy; decorative. */
function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * The built-in copy-to-clipboard adornment appended when a Chip is given
 * `contentToCopy`. On activation it writes the text and briefly swaps its glyph
 * to a checkmark and its name to "Copied" before reverting.
 */
function ChipCopyAdornment({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = () => {
    const { clipboard } = navigator;
    if (clipboard == null) return;
    void clipboard.writeText(content).then(
      () => {
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  };

  return (
    <ChipAdornment
      icon={copied ? <CheckGlyph /> : <CopyGlyph />}
      label={copied ? "Copied" : "Copy"}
      onClick={handleCopy}
    />
  );
}

/**
 * Chip.Adornment — a small icon slotted before/after a Chip's label. Inherits the
 * Chip's colour and (for clickable kinds) disabled state through context. One of
 * three kinds: a regular icon, a `<button>` (`onClick`), or an `<a>` (`href`).
 */
function ChipAdornment(props: ChipAdornmentProps) {
  const { icon, intent, label, onClick, href, disabled, render, forcePropagation } = props;
  const {
    intent: chipIntent,
    saliency = "mid",
    size = "md",
    disabled: chipDisabled = false,
  } = React.useContext(ChipAdornmentContext);

  const interactive = href != null || onClick != null;
  const overriding = intent != null;
  const inert = interactive && (disabled === true || chipDisabled);

  const className = cx(
    chipAdornmentRecipe({
      interactive,
      size,
      intent: overriding ? intent : undefined,
      saliency: overriding ? saliency : undefined,
    }),
    interactive && focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (inert) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (onClick != null && forcePropagation !== true) {
      event.stopPropagation();
    }
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
  };

  const iconNode = renderIcon(icon, {
    state: { intent: intent ?? chipIntent, saliency, size, disabled: inert },
  });
  const elementProps: Record<string, unknown> = { className, children: iconNode };

  if (href != null) {
    elementProps.href = href;
    elementProps["aria-label"] = label;
    elementProps["aria-disabled"] = inert || undefined;
    elementProps.onClick = handleActivate;
  } else if (onClick != null) {
    elementProps.type = "button";
    elementProps["aria-label"] = label;
    elementProps["aria-disabled"] = inert || undefined;
    elementProps.onClick = handleActivate;
  } else if (label != null) {
    elementProps.role = "img";
    elementProps["aria-label"] = label;
  }

  if (iconNode == null && !interactive && label == null) return null;

  return (
    <RenderElement
      render={href != null ? render : undefined}
      defaultElement={href != null ? "a" : onClick != null ? "button" : "span"}
      props={elementProps}
    />
  );
}

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "popover"> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /**
   * The chip's silhouette. `square` (default) keeps the shared component radius —
   * softly rounded corners, the chip as it is by design. `pill` fully rounds the
   * ends into a Bootstrap-style pill/badge.
   */
  shape?: "square" | "pill";
  /**
   * The chip's width. `fit` (default) hugs its content; `fill` stretches it to
   * the container's full width. The label truncates either way.
   */
  width?: "fit" | "fill";
  /** Uses `aria-disabled` (keyboard-focusable) rather than `disabled`. */
  disabled?: boolean;
  /**
   * Makes the chip's text label a clickable `<button>` that fires this. Only the
   * label is the hit target. A disabled chip swallows the click but stays
   * focusable. No effect without text `children`.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Attaches a `<Popover>` opened by the chip's text label (the chip becomes its
   * `trigger`, wiring `aria-haspopup` / `aria-expanded`). Composes with `onClick`.
   * No effect without text `children`, or while `loading`.
   */
  popover?: React.ReactElement<PopoverProps>;
  /**
   * Loading state: replaces the chip's content with a centred spinner and marks
   * it `aria-busy` and inert. Keeps its height; width collapses to fit the spinner.
   */
  loading?: boolean;
  /**
   * Shorthand for a leading icon — prepends a decorative `<Chip.Adornment>` before
   * any `leadAdornments`. A bare glyph, an `<Icon>`, or a render function.
   */
  icon?: IconSlot<ChipIconState>;
  /**
   * Shorthand for a trailing icon — mirrors `icon`, appended after any
   * `trailAdornments` (and before the built-in copy / remove buttons).
   */
  trailIcon?: IconSlot<ChipIconState>;
  /** Adornments rendered before the label — each a `<Chip.Adornment>`. */
  leadAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /** Adornments rendered after the label — each a `<Chip.Adornment>`. */
  trailAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /**
   * Appends a built-in copy-to-clipboard trailing adornment that writes this
   * string on click, showing a checkmark + "Copied". Sits after `trailIcon`,
   * before `handleRemove`.
   */
  contentToCopy?: string;
  /**
   * Appends a built-in remove "×" adornment that calls this on activation, always
   * last among the trailing adornments.
   */
  handleRemove?: () => void;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  /**
   * The chip's text label, and only text (a string, or an array of strings).
   * Icons and actions go through `leadAdornments` / `trailAdornments`, never the
   * children, so the chip can wrap the label in its own truncating element.
   */
  children?: string | string[];
}

/**
 * A "component" element type sharing the colour recipe with Button et al., so
 * `<Chip intent="negative" saliency="high">` matches a Button with the same
 * props. Unlike a Button it's a *tag* by default, not a control: its hit targets
 * are the label (given `onClick` / `popover`) and the adornments, so the chip
 * body itself takes no pointer cursor and its text stays selectable. Decorate it
 * with `Chip.Adornment`s via `leadAdornments` / `trailAdornments`.
 */
function ChipRoot({
  intent,
  saliency,
  size,
  shape,
  width,
  disabled,
  loading = false,
  icon,
  trailIcon,
  leadAdornments,
  trailAdornments,
  contentToCopy,
  handleRemove,
  popover,
  render,
  className,
  children,
  onClick,
  ref,
  ...rest
}: ChipProps) {
  const adornmentContext = React.useMemo<ChipAdornmentContextValue>(
    () => ({ intent, saliency, size, disabled }),
    [intent, saliency, size, disabled],
  );

  const handleLabelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  const interactiveLabelClassName = cx(
    chipLabelRecipe({ interactive: true }),
    focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  let label: React.ReactNode = null;
  if (children != null) {
    if (popover != null) {
      label = (
        <BasePopover.Trigger
          render={(htmlAttrs) => {
            const { onClick: hostOnClick, ...hostAttrs } = htmlAttrs;
            const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
              if (disabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              onClick?.(event);
              hostOnClick?.(event as React.MouseEvent<Element>);
            };
            const labelProps = mergeProps(hostAttrs as Record<string, unknown>, {
              type: "button",
              className: interactiveLabelClassName,
              "aria-disabled": disabled || undefined,
              onClick: handleTriggerClick,
              children,
            }) as React.ButtonHTMLAttributes<HTMLButtonElement> & {
              ref?: React.Ref<HTMLButtonElement>;
            };
            return <button {...labelProps} />;
          }}
        />
      );
    } else if (onClick != null) {
      label = (
        <button
          type="button"
          className={interactiveLabelClassName}
          aria-disabled={disabled || undefined}
          onClick={handleLabelClick}
        >
          {children}
        </button>
      );
    } else {
      label = <span className={chipLabelRecipe()}>{children}</span>;
    }
  }

  const chip = useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(chipBoxClassName({ intent, saliency, size, shape, width }), className),
      "aria-disabled": disabled || loading || undefined,
      "aria-busy": loading || undefined,
      children: loading ? (
        <InternalSpinner />
      ) : (
        <ChipAdornmentContext.Provider value={adornmentContext}>
          {icon != null && <ChipAdornment icon={icon} />}
          {React.Children.toArray(leadAdornments)}
          {label}
          {React.Children.toArray(trailAdornments)}
          {trailIcon != null && <ChipAdornment icon={trailIcon} />}
          {contentToCopy != null && <ChipCopyAdornment content={contentToCopy} />}
          {handleRemove != null && (
            <ChipAdornment icon={<CloseGlyph />} label="Remove" onClick={handleRemove} />
          )}
        </ChipAdornmentContext.Provider>
      ),
      ...rest,
    },
  });

  if (popover != null && children != null && !loading) {
    return React.cloneElement(popover, { trigger: chip });
  }
  return chip;
}

ChipRoot.displayName = "Chip";
ChipAdornment.displayName = "Chip.Adornment";

/** Chip with its `Adornment` part attached. */
export const Chip = Object.assign(ChipRoot, {
  Adornment: ChipAdornment,
});
