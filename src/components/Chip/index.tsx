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
 * Chip state published to adornments via context: `intent`/`saliency`/`size` for
 * an icon render function to branch on, and `disabled` so a clickable adornment
 * goes inert with the chip.
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
  /**
   * Icon to render — bare glyph, `<Icon>`, or a `(props, state)` render function.
   * Inherits the chip's foreground unless `intent` overrides it.
   */
  icon: IconSlot<ChipIconState>;
  /**
   * Colour intent for this adornment; defaults to the parent Chip's intent. Keeps
   * the chip's saliency.
   */
  intent?: Intent;
}

/**
 * A plain, non-interactive adornment — a decorative or labelled icon. Provide
 * `label` for an accessible name (`role="img"`), or omit it for a decorative glyph.
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

/** A clickable adornment — renders a real `<button>`, e.g. a remove "×". */
export interface ChipButtonAdornmentProps extends ChipAdornmentBaseProps {
  /** Activation handler. Makes the adornment a `<button>`. Suppressed while inert. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Required accessible name for the icon-only button. */
  label: string;
  /**
   * Disables the button via `aria-disabled` (stays keyboard-focusable, click
   * swallowed). A disabled Chip also makes its clickable adornments inert.
   */
  disabled?: boolean;
  /**
   * Stops the click from bubbling past the chip by default, so it won't also
   * trigger a clickable ancestor (e.g. a wrapping row). Set this to propagate it.
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
   * Render as a different element/component (base-ui `render` pattern), e.g. a
   * router link. Renders a plain `<a>` when omitted.
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
 * Built-in copy-to-clipboard adornment appended when a Chip is given
 * `contentToCopy`. Copies on click, briefly swapping its glyph/name to a
 * checkmark + "Copied" as feedback.
 */
function ChipCopyAdornment({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clear the pending revert if the chip unmounts mid-feedback.
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
      () => {
        // Swallow a rejected clipboard write (denied permission, insecure context).
      },
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
 * Chip.Adornment — a small icon slotted before/after a Chip's label via
 * `leadAdornments` / `trailAdornments`. Inherits the Chip's colour and, for
 * clickable kinds, its disabled state. One of three kinds discriminated by its
 * props: a regular icon, a `<button>` (`onClick`), or an `<a>` (`href`).
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
  // Only the clickable kinds can be inert; a disabled chip drags them along.
  const inert = interactive && (disabled === true || chipDisabled);

  const className = cx(
    chipAdornmentRecipe({
      interactive,
      size,
      // Pass intent+saliency only to override; omitting both inherits the chip's.
      intent: overriding ? intent : undefined,
      saliency: overriding ? saliency : undefined,
    }),
    interactive && focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (inert) {
      // No native `disabled` (and `<a>` has none), so swallow it ourselves to
      // stay focusable but inert.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // Stop the click bubbling to a clickable ancestor (e.g. a wrapping row)
    // unless `forcePropagation` opts in; links keep bubbling since they navigate anyway.
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
    // Regular, named: expose the icon as an image with the given name.
    elementProps.role = "img";
    elementProps["aria-label"] = label;
  }

  // A purely decorative, glyph-less adornment has nothing to show — omit it.
  // `RenderElement` (not `useRender`) keeps this early return within the Rules of
  // Hooks.
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
   * The chip's silhouette: `square` (default) keeps the shared component radius;
   * `pill` fully rounds the ends into a pill/badge shape.
   */
  shape?: "square" | "pill";
  /**
   * The chip's width: `fit` (default) hugs the content; `fill` stretches to the
   * container's width. The label truncates either way.
   */
  width?: "fit" | "fill";
  /** Uses `aria-disabled` (keyboard-focusable) rather than `disabled`. */
  disabled?: boolean;
  /**
   * Makes the chip's text label a clickable `<button>` that fires this on
   * activation; adornments keep their own actions. A disabled chip keeps the
   * label focusable but inert. No effect without text `children`.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Attaches a `<Popover>` opened by clicking the chip's label, which becomes the
   * popover's `trigger` — pass a fully configured `<Popover>` element. Only the
   * label triggers it; a disabled chip's label stays focusable but swallows the
   * click, so the popover stays shut. Composes with `onClick` (fires first). No
   * effect without text `children`, or while `loading`.
   */
  popover?: React.ReactElement<PopoverProps>;
  /**
   * Loading state: swaps the chip's content for a centred spinner and marks it
   * `aria-busy` and inert (`aria-disabled`, like `disabled`). Keeps its height;
   * width collapses to fit the spinner.
   */
  loading?: boolean;
  /**
   * Shorthand for a leading icon — prepends a decorative `<Chip.Adornment>` before
   * any `leadAdornments`. Bare glyph, `<Icon>`, or a `(props, state)` render
   * function; inherits the chip's colour like any adornment.
   */
  icon?: IconSlot<ChipIconState>;
  /**
   * Mirrors `icon` at the trailing end — appends a decorative `<Chip.Adornment>`
   * after any `trailAdornments`, before the built-in `contentToCopy` /
   * `handleRemove` buttons. Same forms and colour inheritance as `icon`.
   */
  trailIcon?: IconSlot<ChipIconState>;
  /** Adornments rendered before the label — each a `<Chip.Adornment>`. */
  leadAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /** Adornments rendered after the label — each a `<Chip.Adornment>`. */
  trailAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /**
   * Appends a built-in copy-to-clipboard trailing adornment that writes this
   * string to the clipboard on click, briefly showing a checkmark + "Copied" as
   * feedback. Sits after `trailIcon`, before the `handleRemove` "×".
   */
  contentToCopy?: string;
  /**
   * Appends a built-in clickable remove "×" adornment that calls this on
   * activation; always sits last, after any `trailAdornments`. Inert but
   * keyboard-focusable (`aria-disabled`) when the chip is `disabled`.
   */
  handleRemove?: () => void;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  /**
   * The chip's text label, and only text — a string or array of strings (e.g.
   * `{a}/{b}`). Icons and actions go through `leadAdornments` / `trailAdornments`
   * instead, so the chip can wrap the label in its own truncating element.
   */
  children?: string | string[];
}

/**
 * Chip — a "component" element type sharing Button's colour recipe, so
 * `<Chip intent="negative" saliency="high">` matches a same-props Button.
 *
 * Unlike a Button, a Chip is a *tag* by default: its hit targets are the label
 * (given `onClick` / `popover`) and the adornments, not the chip body — which
 * takes no pointer cursor or hover (it would promise a click that does nothing)
 * and keeps its text selectable. A `render` that makes the chip a link restores
 * both.
 *
 * Decorate with `Chip.Adornment`s via `leadAdornments` / `trailAdornments`
 * (icons, or a `<button>`/`<a>`); they inherit the chip's colour and disabled
 * state.
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

  // Disabled keeps the label focusable but inert (no native `disabled`, mirrors
  // Chip.Adornment); `loading` already swaps the label for the spinner.
  const handleLabelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  // Shared styling for the label `<button>` (clickable or popover trigger):
  // strips native button chrome back to plain text, adds the focus ring.
  const interactiveLabelClassName = cx(
    chipLabelRecipe({ interactive: true }),
    focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  // Children are text-only, so the chip owns the label element — a truncating
  // flex item that's a popover trigger, a clickable `<button>`, or a plain span.
  let label: React.ReactNode = null;
  if (children != null) {
    if (popover != null) {
      // The label is the popover's trigger: base-ui hands the toggle handler and
      // ARIA wiring through `htmlAttrs`, merged onto our label `<button>` (as
      // InternalButton does for Drawer/Modal/Popover). A disabled chip swallows
      // the click before base-ui's toggle runs, so the popover stays shut.
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
      // With `onClick` the label is a real `<button>`, the keyboard-focusable hit target.
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
      // The chip look comes from the shared `chipBoxClassName` — the single
      // source of truth `Link`'s `appearance="chip"` also renders from, so the two
      // never drift. `interactive: "auto"` leaves pointer/hover to the rendered
      // element: an inert `<span>` unless `render` makes it a link.
      className: cx(chipBoxClassName({ intent, saliency, size, shape, width }), className),
      "aria-disabled": disabled || loading || undefined,
      "aria-busy": loading || undefined,
      // Loading swaps the content for a decorative spinner; `aria-busy` announces the state.
      children: loading ? (
        <InternalSpinner />
      ) : (
        <ChipAdornmentContext.Provider value={adornmentContext}>
          {/* `icon` is the shorthand first lead adornment, ahead of any
              `leadAdornments`. `Children.toArray` assigns stable keys. */}
          {icon != null && <ChipAdornment icon={icon} />}
          {React.Children.toArray(leadAdornments)}
          {label}
          {React.Children.toArray(trailAdornments)}
          {/* `trailIcon` mirrors `icon`, sitting after any `trailAdornments`. */}
          {trailIcon != null && <ChipAdornment icon={trailIcon} />}
          {/* Built-in copy button, appended when `contentToCopy` is set. */}
          {contentToCopy != null && <ChipCopyAdornment content={contentToCopy} />}
          {/* Built-in remove "×", always last after any `trailAdornments`. */}
          {handleRemove != null && (
            <ChipAdornment icon={<CloseGlyph />} label="Remove" onClick={handleRemove} />
          )}
        </ChipAdornmentContext.Provider>
      ),
      ...rest,
    },
  });

  // With a `popover`, the chip *is* the trigger: clone the supplied `<Popover>`
  // and slot the whole chip in as its `trigger`. Skipped while loading (no label,
  // so no trigger).
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
