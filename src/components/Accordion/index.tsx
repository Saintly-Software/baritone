"use client";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import { cx } from "../../utils/cx";
import { Text } from "../Text";
import {
  accordionChevron,
  accordionHeader,
  accordionHeaderText,
  accordionItem,
  accordionItemDisabled,
  accordionPanel,
  accordionPanelContent,
  accordionRoot,
  accordionRootDisabled,
  accordionTrigger,
} from "./accordion.css";

export interface AccordionItemHeaderProps {
  /** The item's title — the prominent line in the trigger. */
  title: React.ReactNode;
  /** Optional supporting line beneath the title. */
  subtitle?: React.ReactNode;
  /** Extra className merged onto the title/subtitle stack. */
  className?: string;
  ref?: React.Ref<HTMLSpanElement>;
}

/**
 * The header content for an `Accordion` item: a `title` with an optional
 * `subtitle`. Pass it to an item's `header`. It renders only the text stack — the
 * surrounding `<h3>`, the `<button>` trigger and the disclosure chevron are
 * supplied by `Accordion` itself.
 *
 * @example
 * { header: <Accordion.ItemHeader title="Shipping" subtitle="2–4 business days" />, ... }
 */
function AccordionItemHeader({ title, subtitle, className, ref }: AccordionItemHeaderProps) {
  return (
    <span ref={ref} className={cx(accordionHeaderText, className)}>
      <Text variant="base">{title}</Text>
      {subtitle != null && (
        <Text variant="sm" saliency="low">
          {subtitle}
        </Text>
      )}
    </span>
  );
}

export interface AccordionItemProps<T> {
  /**
   * The value that identifies this item. Constrained to the set the `items` array
   * forms, so a typo or a value outside the union/enum is a compile error — and
   * the same `T` flows into `value` / `onChange` / `initialValue`.
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
   * The items to render, each an `AccordionItemProps` (`value` + `header` +
   * `children`, plus optional `disabled`). The union of their `value`s is the `T`
   * that the open-value props are type-checked against.
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
 * `Accordion` (each item gets a heading + disclosure `button` + a `region` panel,
 * with the ARIA wiring and keyboard handling done for you). Each item is a
 * "surface" (like `Card`); its `header` is typically an `<Accordion.ItemHeader />`
 * and its `children` are the panel content.
 *
 * Like `Tabs`, it's **type-safe over its values**: the component is generic over
 * `T` (inferred from the `items` array — `const` so string/number literals survive
 * without `as const`), so an item `value` and the open-value props are bound to
 * the same union/enum. See https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * Two discriminated unions shape the open-state API:
 * - **`multiple`** (like `FileUpload`): omitted/`false` keeps one item open at a
 *   time, so `value` / `onChange` / `initialValue` speak a single `T | null`;
 *   `multiple` lets any number open, so they speak a `T[]`.
 * - **controlled vs uncontrolled** (like `Tabs`): pass `value` + `onChange` to
 *   drive it, or `initialValue` (or nothing) to let it manage its own state.
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

  // base-ui keeps the open set as an array regardless of `multiple`, so single
  // mode is just "an array of at most one". Bridge both discriminated unions —
  // `multiple` (single `T | null` ⇄ `T[]`) and controlled vs uncontrolled — onto
  // that one array-shaped model. Controlled is detected by `onChange`, mirroring
  // `Tabs` (so a controlled `value` of `null` / `[]` still reads as controlled).
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
      // vetoes disabled items/groups before base-ui commits — so a change that
      // reaches here is already allowed and just needs emitting.
      onValueChange={(next) => emit(next as T[])}
      aria-label={ariaLabel}
      // Disabled is modelled with `aria-disabled` + the per-item veto, NOT
      // base-ui's `disabled` (which natively disables each trigger, dropping it
      // from the tab order). So a disabled accordion stays fully reachable — see
      // AGENTS.md.
      aria-disabled={disabled || undefined}
      className={cx(accordionRoot, disabled && accordionRootDisabled, className)}
    >
      {items.map((item) => {
        const itemDisabled = disabled || item.disabled;
        return (
          <BaseAccordion.Item
            key={String(item.value)}
            value={item.value}
            // Veto toggling a disabled item (or any item while the group is
            // disabled). base-ui calls this before committing and skips the
            // commit when `cancel()` ran — so the trigger still focuses, it just
            // won't open/close. Works the same controlled or uncontrolled.
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
                // `aria-disabled` (not the native attribute) keeps the trigger
                // tabbable; the per-item dim only applies when the group itself
                // isn't disabled, so the group's dim never double-applies.
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
