"use client";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import { cx } from "../../utils/cx";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { Text } from "../Text";
import {
  accordionChevron,
  accordionHeader,
  accordionHeaderChip,
  accordionHeaderContent,
  accordionHeaderIcon,
  accordionHeaderLeading,
  accordionHeaderText,
  accordionItem,
  accordionItemDisabled,
  accordionPanel,
  accordionPanelContent,
  accordionRoot,
  accordionRootDisabled,
  accordionTrigger,
} from "./accordion.css";

export type AccordionItemHeaderIconState = Record<string, never>;

export interface AccordionItemHeaderProps {
  title: React.ReactNode;

  subtitle?: React.ReactNode;

  icon?: IconSlot<AccordionItemHeaderIconState>;

  chip?: React.ReactNode;

  className?: string;
  ref?: React.Ref<HTMLSpanElement>;
}

function AccordionItemHeader({
  title,
  subtitle,
  icon,
  chip,
  className,
  ref,
}: AccordionItemHeaderProps) {
  const iconNode = renderIcon(icon);
  return (
    <span ref={ref} className={cx(accordionHeaderContent, className)}>
      <span className={accordionHeaderLeading}>
        {iconNode != null && <span className={accordionHeaderIcon}>{iconNode}</span>}
        <span className={accordionHeaderText}>
          <Text size="md">{title}</Text>
          {subtitle != null && (
            <Text size="sm" saliency="low">
              {subtitle}
            </Text>
          )}
        </span>
      </span>
      {chip != null && <span className={accordionHeaderChip}>{chip}</span>}
    </span>
  );
}

export interface AccordionItemProps<T> {
  value: T;

  header: React.ReactNode;

  children: React.ReactNode;

  disabled?: boolean;
}

interface AccordionBaseProps<T> {
  items: ReadonlyArray<AccordionItemProps<T>>;

  disabled?: boolean;

  "aria-label"?: string;

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
}

interface AccordionSingleControlledProps<T> {
  multiple?: false;
  value: NoInfer<T> | null;
  onChange: (value: NoInfer<T> | null) => void;
  initialValue?: never;
}

interface AccordionSingleUncontrolledProps<T> {
  multiple?: false;
  value?: never;
  onChange?: never;
  initialValue?: NoInfer<T> | null;
}

interface AccordionMultipleControlledProps<T> {
  multiple: true;
  value: NoInfer<T>[];
  onChange: (value: NoInfer<T>[]) => void;
  initialValue?: never;
}

interface AccordionMultipleUncontrolledProps<T> {
  multiple: true;
  value?: never;
  onChange?: never;
  initialValue?: NoInfer<T>[];
}

export type AccordionProps<T> = AccordionBaseProps<T> &
  (
    | AccordionSingleControlledProps<T>
    | AccordionSingleUncontrolledProps<T>
    | AccordionMultipleControlledProps<T>
    | AccordionMultipleUncontrolledProps<T>
  );

function AccordionRoot<const T>(props: AccordionProps<T>) {
  const { items, disabled = false, "aria-label": ariaLabel, className, ref } = props;

  const multiple = props.multiple === true;
  const controlled = props.onChange != null;
  const valueProps = controlled
    ? { value: props.multiple ? props.value : props.value != null ? [props.value] : [] }
    : {
        defaultValue: props.multiple
          ? (props.initialValue ?? [])
          : props.initialValue != null
            ? [props.initialValue]
            : [],
      };

  const emit = (next: T[]) => {
    if (props.multiple) props.onChange?.(next);
    else props.onChange?.(next[0] ?? null);
  };

  return (
    <BaseAccordion.Root
      ref={ref}
      multiple={multiple}
      {...valueProps}
      onValueChange={(next) => emit(next as T[])}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cx(accordionRoot, disabled && accordionRootDisabled, className)}
    >
      {items.map((item) => {
        const itemDisabled = disabled || item.disabled;
        return (
          <BaseAccordion.Item
            key={String(item.value)}
            value={item.value}
            onOpenChange={(_open, details) => {
              if (disabled || item.disabled) details.cancel();
            }}
            className={cx(
              surfaceRecipe({ saliency: "low", padding: "none" }),
              accordionItem,
              item.disabled && !disabled && accordionItemDisabled,
            )}
          >
            <BaseAccordion.Header className={accordionHeader}>
              <BaseAccordion.Trigger
                aria-disabled={itemDisabled || undefined}
                className={cx(accordionTrigger, focusRingRecipe({ type: "visible" }))}
              >
                {item.header}
                <ChevronGlyph className={accordionChevron} />
              </BaseAccordion.Trigger>
            </BaseAccordion.Header>
            <BaseAccordion.Panel className={accordionPanel}>
              <div className={accordionPanelContent}>{item.children}</div>
            </BaseAccordion.Panel>
          </BaseAccordion.Item>
        );
      })}
    </BaseAccordion.Root>
  );
}

function ChevronGlyph({ className }: { className?: string }) {
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
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

AccordionRoot.displayName = "Accordion";
AccordionItemHeader.displayName = "Accordion.ItemHeader";

export const Accordion = Object.assign(AccordionRoot, {
  ItemHeader: AccordionItemHeader,
});
