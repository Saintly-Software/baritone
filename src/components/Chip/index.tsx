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

interface ChipAdornmentContextValue {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  disabled?: boolean;
}

const ChipAdornmentContext = React.createContext<ChipAdornmentContextValue>({});

export interface ChipIconState {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  disabled: boolean;
}

interface ChipAdornmentBaseProps {
  icon: IconSlot<ChipIconState>;

  intent?: Intent;
}

export interface ChipRegularAdornmentProps extends ChipAdornmentBaseProps {
  label?: string;
  onClick?: never;
  href?: never;
  disabled?: never;
  render?: never;
  forcePropagation?: never;
}

export interface ChipButtonAdornmentProps extends ChipAdornmentBaseProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;

  label: string;

  disabled?: boolean;

  forcePropagation?: boolean;
  href?: never;
  render?: never;
}

export interface ChipLinkAdornmentProps extends ChipAdornmentBaseProps {
  href: string;

  label: string;

  render?: RenderProp;
  onClick?: never;
  disabled?: never;
  forcePropagation?: never;
}

export type ChipAdornmentProps =
  | ChipRegularAdornmentProps
  | ChipButtonAdornmentProps
  | ChipLinkAdornmentProps;

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

  shape?: "square" | "pill";

  width?: "fit" | "fill";

  disabled?: boolean;

  onClick?: React.MouseEventHandler<HTMLElement>;

  popover?: React.ReactElement<PopoverProps>;

  loading?: boolean;

  icon?: IconSlot<ChipIconState>;

  trailIcon?: IconSlot<ChipIconState>;

  leadAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;

  trailAdornments?: Array<React.ReactElement<ChipAdornmentProps>>;

  contentToCopy?: string;

  handleRemove?: () => void;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;

  children?: string | string[];
}

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

export const Chip = Object.assign(ChipRoot, {
  Adornment: ChipAdornment,
});
