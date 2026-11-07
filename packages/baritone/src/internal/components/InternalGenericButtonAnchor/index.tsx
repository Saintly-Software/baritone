"use client";
import * as React from "react";
import { srOnly } from "../../../components/SrOnly/srOnly.css";
import { RenderElement, type RenderProp } from "../../../utils/render";

export interface InternalGenericButtonAnchorProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "color"
> {
  render?: RenderProp;

  href?: string;

  target?: React.HTMLAttributeAnchorTarget;

  rel?: string;

  type?: "button" | "submit" | "reset";

  disabled?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

export function InternalGenericButtonAnchor({
  render,
  href,
  target,
  rel,
  type,
  disabled = false,
  onClick,
  className,
  children,
  ref,
  ...rest
}: InternalGenericButtonAnchorProps) {
  const isLink = render != null || href != null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  };

  if (isLink && disabled) {
    const { "aria-label": ariaLabel, ...inertRest } = rest;
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        aria-disabled
        className={className}
        {...inertRest}
      >
        {ariaLabel != null && <span className={srOnly}>{ariaLabel}</span>}
        {children}
      </div>
    );
  }

  if (isLink) {
    const resolvedRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
    const linkProps = {
      ref,
      className,
      onClick: handleClick,
      ...(href != null && { href }),
      ...(target != null && { target }),
      ...(resolvedRel != null && { rel: resolvedRel }),
      children,
      ...rest,
    };

    return <RenderElement render={render} defaultElement="a" props={linkProps} />;
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? "button"}
      aria-disabled={disabled || undefined}
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
