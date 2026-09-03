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

/**
 * The state an `Accordion.ItemHeader` icon render function can branch on. Empty,
 * since the header has no presentational icon state of its own.
 */
export type AccordionItemHeaderIconState = Record<string, never>;

export interface AccordionItemHeaderProps {
  /** The item's title — the prominent line in the trigger. */
  title: React.ReactNode;
  /** Optional supporting line beneath the title. */
  subtitle?: React.ReactNode;
  /**
   * Leading glyph before the title — a bare glyph (auto-wrapped in `Icon`), an
   * explicit `<Icon>`, or a render function for full control.
   */
  icon?: IconSlot<AccordionItemHeaderIconState>;
  /**
   * Trailing element after the title, before the chevron — typically a status
   * `<Chip>`. Keep it decorative; it sits inside the trigger button.
   */
  chip?: React.ReactNode;
  /** Extra className merged onto the header content. */
  className?: string;
  ref?: React.Ref<HTMLSpanElement>;
}

/**
 * The header content for an `Accordion` item: a `title` with an optional
 * `subtitle`, plus an optional leading `icon` and trailing `chip`. Pass it to an
 * item's `header` — the surrounding `<h3>`, trigger `<button>`, and chevron are
 * supplied by `Accordion` itself, so keep `icon`/`chip` decorative.
 *
 * @example
 * { header: <Accordion.ItemHeader title="Shipping" subtitle="2–4 business days" />, ... }
 *
 * @example
 * {
 *   header: (
 *     <Accordion.ItemHeader
 *       title="Production"
 *       icon={<ServerGlyph />}
 *       chip={<Chip intent="positive" saliency="low" size="sm">Healthy</Chip>}
 *     />
 *   ),
 *   ...
 * }
 */
function AccordionItemHeader({
  title,
  subtitle,
  icon,
  chip,
  className,
  ref,
}: AccordionItemHeaderProps) {
  // Guard on the resolved node, not the raw slot — a slot can resolve to nothing.
  const iconNode = renderIcon(icon);
  return (
    <span ref={ref} className={cx(accordionHeaderContent, className)}>
      {/* Leading group (icon + text); the flex spacer pushes the chip to the end. */}
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
  /**
   * The value that identifies this item, constrained to the set the `items` array
   * forms — a typo or an out-of-union value is a compile error, and the same `T`
   * flows into `value`/`onChange`/`initialValue`.
   */
  value: T;
  /** The trigger content — typically an `<Accordion.ItemHeader />`. */
  header: React.ReactNode;
  /** The panel content, revealed when the item is open. */
  children: React.ReactNode;
  /**
   * Disable just this item. Modelled with `aria-disabled` (never the native
   * attribute), so its trigger stays focusable while toggling is vetoed.
   */
  disabled?: boolean;
}

interface AccordionBaseProps<T> {
  /**
   * The items to render, each an `AccordionItemProps`. The union of their
   * `value`s becomes the `T` the open-value props are type-checked against.
   */
  items: ReadonlyArray<AccordionItemProps<T>>;
  /**
   * Disable every item. Each trigger stays keyboard-reachable (`aria-disabled`,
   * never the native attribute); toggles are vetoed.
   */
  disabled?: boolean;
  /** Accessible name for the accordion group. */
  "aria-label"?: string;
  /** Extra className merged onto the root element. */
  className?: string;
  /** Ref to the root element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * Single-open, controlled: drive the one open item with `value` + `onChange`
 * (`null` = all closed). `NoInfer` keeps `T` coming from `items` alone.
 */
interface AccordionSingleControlledProps<T> {
  multiple?: false;
  value: NoInfer<T> | null;
  onChange: (value: NoInfer<T> | null) => void;
  initialValue?: never;
}

/** Single-open, uncontrolled: seed the initially open item with `initialValue`. */
interface AccordionSingleUncontrolledProps<T> {
  multiple?: false;
  value?: never;
  onChange?: never;
  initialValue?: NoInfer<T> | null;
}

/** Multi-open, controlled: drive the open set with `value` + `onChange` arrays. */
interface AccordionMultipleControlledProps<T> {
  multiple: true;
  value: NoInfer<T>[];
  onChange: (value: NoInfer<T>[]) => void;
  initialValue?: never;
}

/** Multi-open, uncontrolled: seed the initially open set with `initialValue`. */
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

/**
 * Accordion — a vertical stack of collapsible items, built on base-ui's
 * `Accordion` (ARIA wiring and keyboard handling included). Each item is a
 * "surface" (like `Card`) whose `header` is typically an `<Accordion.ItemHeader />`.
 *
 * Like `Tabs`, it's type-safe over its values: generic over `T` (inferred from
 * `items`), so an item `value` and the open-value props share one union. See
 * https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * Two discriminated unions shape the open-state API:
 * - **`multiple`**: default keeps one item open (`T | null`); `multiple` allows
 *   any number (`T[]`).
 * - **controlled vs uncontrolled**: `value` + `onChange` drives it; `initialValue`
 *   (or nothing) lets it self-manage.
 *
 * @example
 * // Single-open, uncontrolled
 * <Accordion
 *   initialValue="shipping"
 *   items={[
 *     {
 *       value: "shipping",
 *       header: <Accordion.ItemHeader title="Shipping" subtitle="2–4 business days" />,
 *       children: <Text>We ship worldwide.</Text>,
 *     },
 *     {
 *       value: "returns",
 *       header: <Accordion.ItemHeader title="Returns" />,
 *       children: <Text>30-day returns.</Text>,
 *     },
 *   ]}
 * />
 *
 * @example
 * // Multi-open, controlled
 * const [open, setOpen] = React.useState<string[]>([]);
 * <Accordion multiple value={open} onChange={setOpen} items={items} />
 */
function AccordionRoot<const T>(props: AccordionProps<T>) {
  const { items, disabled = false, "aria-label": ariaLabel, className, ref } = props;

  // base-ui keeps the open set as an array regardless of `multiple` — single mode
  // is just "an array of at most one". Bridge both discriminated unions onto that
  // one array-shaped model; controlled is detected by `onChange` (mirroring
  // `Tabs`), so a controlled `value` of `null`/`[]` still reads as controlled.
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

  // Translate base-ui's array back to the caller's shape.
  const emit = (next: T[]) => {
    if (props.multiple) props.onChange?.(next);
    else props.onChange?.(next[0] ?? null);
  };

  return (
    <BaseAccordion.Root
      ref={ref}
      multiple={multiple}
      {...valueProps}
      // Every toggle funnels through an item's `onOpenChange` (below), which
      // vetoes disabled items first — a change reaching here just needs emitting.
      onValueChange={(next) => emit(next as T[])}
      aria-label={ariaLabel}
      // Disabled uses `aria-disabled` + the per-item veto, not base-ui's `disabled`
      // (which drops the trigger from the tab order) — see AGENTS.md.
      aria-disabled={disabled || undefined}
      className={cx(accordionRoot, disabled && accordionRootDisabled, className)}
    >
      {items.map((item) => {
        const itemDisabled = disabled || item.disabled;
        return (
          <BaseAccordion.Item
            key={String(item.value)}
            value={item.value}
            // Veto toggling a disabled item/group: base-ui skips the commit when
            // `cancel()` runs, so the trigger still focuses but won't open/close.
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
                // `aria-disabled` keeps the trigger tabbable; the per-item dim
                // only applies when the group itself isn't already dimmed.
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

/** Decorative disclosure chevron; the trigger carries the a11y semantics. */
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

/** Accordion with its compound parts attached. */
export const Accordion = Object.assign(AccordionRoot, {
  ItemHeader: AccordionItemHeader,
});
