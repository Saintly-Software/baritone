"use client";
import { Popover as BasePopover } from "@base-ui/react/popover";
import * as React from "react";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from "../../styles/recipes/component.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { mergeProps, useRender, type RenderProp } from "../../utils/render";
import type { PopoverProps } from "../Popover";
import { chipLabelRecipe, chipShapeRecipe, chipSizeRecipe, chipWidthRecipe } from "./chip.css";
import { chipAdornmentRecipe } from "./chipAdornment.css";

/**
 * What a Chip publishes to its adornments. The adornment never needs the chip's
 * *intent* (it inherits the chip's colour via `--iconColor`, or overrides it
 * with its own `intent`), but it does need the chip's `saliency` to tint an
 * override at the right shade, and the chip's `disabled` so a clickable
 * adornment goes inert with the chip.
 */
interface ChipAdornmentContextValue {
  saliency?: Saliency;
  disabled?: boolean;
}

const ChipAdornmentContext = React.createContext<ChipAdornmentContextValue>({});

interface ChipAdornmentBaseProps {
  /**
   * The icon to render. Typically an `<Icon>` (or an `<svg>` drawn with
   * `currentColor`); it inherits the chip's foreground unless `intent` overrides
   * it.
   */
  icon: React.ReactNode;
  /**
   * Colour intent for this adornment. Defaults to the parent Chip's intent (the
   * adornment simply inherits its colour); set this to tint just this adornment
   * a different intent. It keeps the chip's saliency.
   */
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
   * Disables the button. Applied as `aria-disabled` (never the native attribute)
   * so it stays keyboard-focusable; the click is swallowed. A disabled Chip also
   * makes its clickable adornments inert.
   */
  disabled?: boolean;
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
 * `contentToCopy`. It's a clickable `Chip.Adornment` that writes the text to the
 * clipboard on activation and, as success feedback, briefly swaps its glyph to a
 * checkmark and its accessible name to "Copied" before reverting. Being a
 * clickable adornment it inherits the chip's disabled state through context.
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
        // Swallow a rejected clipboard write (denied permission, insecure
        // context) — the chip just doesn't show success feedback.
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
 * Chip.Adornment — a small icon slotted before/after a Chip's label via the
 * `leadAdornments` / `trailAdornments` props (or dropped directly in the Chip's
 * children). It inherits the Chip's colour and (for clickable kinds) its
 * disabled state through context, and is one of three kinds discriminated by its
 * props: a regular icon, a `<button>` (`onClick`), or an `<a>` (`href`).
 */
function ChipAdornment(props: ChipAdornmentProps) {
  const { icon, intent, label, onClick, href, disabled, render } = props;
  const { saliency = "mid", disabled: chipDisabled = false } =
    React.useContext(ChipAdornmentContext);

  const interactive = href != null || onClick != null;
  const overriding = intent != null;
  // Only the clickable kinds can be inert; a disabled chip drags them along.
  const inert = interactive && (disabled === true || chipDisabled);

  const className = cx(
    chipAdornmentRecipe({
      interactive,
      // Pass intent+saliency only to override; omitting both inherits the chip's.
      intent: overriding ? intent : undefined,
      saliency: overriding ? saliency : undefined,
    }),
    interactive && focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  const handleActivate = (event: React.MouseEvent<HTMLElement>) => {
    if (inert) {
      // No native `disabled` (and `<a>` has none), so the activation still fires
      // — swallow it ourselves so the control stays focusable but inert.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
  };

  const elementProps: Record<string, unknown> = { className, children: icon };

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

  return useRender({
    render: href != null ? render : undefined,
    defaultElement: href != null ? "a" : onClick != null ? "button" : "span",
    props: elementProps,
  });
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
   * The chip's width. `fit` (default) keeps the chip `inline-flex`, hugging its
   * content. `fill` stretches it to its container's full width — useful when
   * chips stack in a column and should share one edge. The label truncates
   * either way.
   */
  width?: "fit" | "fill";
  /** Uses `aria-disabled` (keyboard-focusable) rather than `disabled`. */
  disabled?: boolean;
  /**
   * Makes the chip's text label clickable: the label renders as a real
   * `<button>` (keyboard-focusable, Enter/Space-activated) and this fires on
   * activation. Only the label is the hit target — adornments keep their own
   * actions. A disabled chip makes the label inert but still focusable
   * (`aria-disabled`, never the native attribute), swallowing the click. Has no
   * effect without text `children`.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * Attaches a `<Popover>` opened by clicking the chip's text label. Pass a fully
   * configured `<Popover>` element (its `header` / `footer` / content / placement
   * — the whole Popover API): the chip slots itself in as that popover's
   * `trigger`, rendering the label as a real `<button>` that base-ui wires up, so
   * it carries `aria-haspopup` / `aria-expanded` / `aria-controls` and toggles the
   * surface. Only the label is the trigger — adornments keep their own actions. A
   * disabled chip's label stays keyboard-focusable (`aria-disabled`) but swallows
   * the click, so the popover won't open. Composes with `onClick` (which still
   * fires before the popover opens). Has no effect without text `children`, or
   * while `loading`.
   */
  popover?: React.ReactElement<PopoverProps>;
  /**
   * Loading state: replaces the chip's entire content — both adornment lists and
   * the label — with a centred spinner, and marks the chip `aria-busy` and inert
   * (`aria-disabled`, like `disabled`). The chip keeps its height; its width
   * collapses to fit the spinner.
   */
  loading?: boolean;
  /**
   * Shorthand for a leading icon — prepends a decorative `<Chip.Adornment>` as the
   * *first* lead adornment, before any `leadAdornments`. Typically an `<Icon>`; it
   * inherits the chip's colour like any adornment.
   */
  icon?: React.ReactNode;
  /**
   * Shorthand for a trailing icon — mirrors `icon` at the other end, appending a
   * decorative `<Chip.Adornment>` *after* any `trailAdornments` (and before the
   * built-in `contentToCopy` / `handleRemove` buttons). Typically an `<Icon>`; it
   * inherits the chip's colour like any adornment.
   */
  trailIcon?: React.ReactNode;
  /** Adornments rendered before the label — each a `<Chip.Adornment>`. */
  leadAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /** Adornments rendered after the label — each a `<Chip.Adornment>`. */
  trailAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;
  /**
   * When provided, appends a built-in copy-to-clipboard trailing adornment that
   * writes this string to the clipboard on click. It's a labelled clickable
   * `Chip.Adornment` ("Copy") that briefly shows a checkmark + "Copied" as
   * success feedback, and — being clickable — inherits the chip's disabled state.
   * It sits after `trailIcon`, before the `handleRemove` "×".
   */
  contentToCopy?: string;
  /**
   * When provided, appends a built-in clickable remove "×" adornment that calls
   * this on activation. It always sits last among the trailing adornments, after
   * any `trailAdornments` you supply. Like any clickable adornment it inherits
   * the chip's disabled state — inert but still keyboard-focusable
   * (`aria-disabled`) when the chip is `disabled`.
   */
  handleRemove?: () => void;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  /**
   * The chip's text label, and only text — a single string (or an array of
   * strings, e.g. interpolated `{a}/{b}`). Icons and actions go through
   * `leadAdornments` / `trailAdornments` (each a `Chip.Adornment`), never the
   * children, so the chip can wrap the label in its own truncating element.
   */
  children?: string | string[];
}

/**
 * Chip — a "component" element type. Shares the colour scheme/recipe with Button
 * et al., so `<Chip intent="negative" saliency="high">` matches a Button with
 * the same props. Hover/active states are derived from tokens at use-site.
 *
 * Decorate it with `Chip.Adornment`s via `leadAdornments` / `trailAdornments`
 * (icons that can also be a `<button>` or an `<a>`); they inherit the chip's
 * colour and disabled state, and the chip's flex layout spaces them around the
 * label.
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
    () => ({ saliency, disabled }),
    [saliency, disabled],
  );

  // A clickable label is a real `<button>`; a disabled chip keeps it focusable
  // but inert, so swallow the activation ourselves (no native `disabled`) —
  // mirrors Chip.Adornment. `loading` already swaps the label out for the
  // spinner, so `disabled` is the only inert case the button itself can hit.
  const handleLabelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  // Shared styling for the label when it's a `<button>` (clickable or a popover
  // trigger): strip the native button chrome back to plain text and add the
  // focus ring.
  const interactiveLabelClassName = cx(
    chipLabelRecipe({ interactive: true }),
    focusRingRecipe({ type: "visible", offset: "sm" }),
  );

  // Children are text-only, so the chip owns the label element — one flex item it
  // can truncate, sat between the adornment lists. It takes one of three shapes:
  // a popover trigger (`popover`), a plain clickable `<button>` (`onClick`), or a
  // non-interactive span.
  let label: React.ReactNode = null;
  if (children != null) {
    if (popover != null) {
      // The label is the popover's trigger. base-ui hands us the toggle handler
      // plus the `aria-haspopup` / `aria-expanded` / `aria-controls` wiring (and a
      // ref to anchor against) through `htmlAttrs`; we merge them onto our own
      // label `<button>` the way base-ui itself merges — mirroring InternalButton,
      // which is how Drawer/Modal/Popover use a real button as their trigger. A
      // disabled chip swallows the click before base-ui's toggle runs, so the
      // label stays focusable but the popover stays shut.
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
      // With an `onClick` the label is a real `<button>` so it's the
      // keyboard-focusable hit target; otherwise it's a plain span.
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
      className: cx(
        componentTypographyRecipe({ size }),
        chipSizeRecipe({ size }),
        chipShapeRecipe({ shape }),
        chipWidthRecipe({ width }),
        componentIntentRecipe({ intent, saliency }),
        focusRingRecipe({ type: "visible" }),
        className,
      ),
      "aria-disabled": disabled || loading || undefined,
      "aria-busy": loading || undefined,
      // Loading swaps the whole content out for a decorative spinner; the
      // recipe's flex-centring places it and `aria-busy` announces the state.
      children: loading ? (
        <InternalSpinner />
      ) : (
        <ChipAdornmentContext.Provider value={adornmentContext}>
          {/* `icon` is the shorthand first lead adornment — it always sits ahead of
              any supplied `leadAdornments`. `Children.toArray` assigns stable keys
              to the positional lists. */}
          {icon != null && <ChipAdornment icon={icon} />}
          {React.Children.toArray(leadAdornments)}
          {label}
          {React.Children.toArray(trailAdornments)}
          {/* `trailIcon` mirrors the lead `icon`: a decorative trailing shorthand
              that sits just after any supplied `trailAdornments`. */}
          {trailIcon != null && <ChipAdornment icon={trailIcon} />}
          {/* The built-in copy button, appended when `contentToCopy` is set. It's
              a clickable adornment, so it inherits the chip's disabled state. */}
          {contentToCopy != null && <ChipCopyAdornment content={contentToCopy} />}
          {/* The built-in remove "×" always sits last, after any supplied
              trailing adornments. It's a clickable adornment, so it inherits the
              chip's disabled state through context (inert but focusable). */}
          {handleRemove != null && (
            <ChipAdornment icon={<CloseGlyph />} label="Remove" onClick={handleRemove} />
          )}
        </ChipAdornmentContext.Provider>
      ),
      ...rest,
    },
  });

  // With a `popover`, the chip *is* the popover's trigger: clone the supplied
  // <Popover> and slot the whole chip in as its `trigger`, so base-ui's Root wraps
  // the chip (and the label Trigger inside it) and renders the floating surface
  // alongside. Skipped while loading, since no label — hence no trigger — exists.
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
