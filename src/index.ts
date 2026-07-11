// Components
export { BaritoneTheme, type BaritoneThemeProps } from "./components/BaritoneTheme";
export { Button, type ButtonProps } from "./components/Button";
export { ToggleButton, type ToggleButtonProps } from "./components/ToggleButton";
export {
  Chip,
  type ChipProps,
  type ChipAdornmentProps,
  type ChipRegularAdornmentProps,
  type ChipButtonAdornmentProps,
  type ChipLinkAdornmentProps,
} from "./components/Chip";
export {
  ChipList,
  type ChipListProps,
  type ChipListItem,
  type ChipListOrientation,
} from "./components/ChipList";
export {
  FileList,
  type FileListProps,
  type FileListItemProps,
  type FileInfo,
  type FileListOrientation,
} from "./components/FileList";
export {
  FileUpload,
  type FileUploadProps,
  type SingleFileUploadProps,
  type MultipleFileUploadProps,
} from "./components/FileUpload";
export { Link, type LinkProps } from "./components/Link";
export { Text, type TextProps, type TextElement } from "./components/Text";
export { HelpText, type HelpTextProps, type HelpTextVariant } from "./components/HelpText";
export { Heading, type HeadingProps } from "./components/Heading";
export {
  Flex,
  type FlexProps,
  type FlexAlign,
  type FlexJustify,
  type FlexDirection,
  type FlexItemProps,
  type FlexItemAlign,
} from "./components/Flex";
export {
  Grid,
  type GridProps,
  type GridAlign,
  type GridJustify,
  type GridTracks,
  type GridAreas,
} from "./components/Grid";
export { Box, type BoxProps, type BoxElement } from "./components/Box";
export { SrOnly, type SrOnlyProps } from "./components/SrOnly";
export {
  Lockup,
  type LockupProps,
  type LockupSlotProps,
  type LockupTitleSlotProps,
  type LockupSlots,
} from "./components/Lockup";
export { Meter, type MeterProps, type MeterSlotProps } from "./components/Meter";
export {
  Card,
  type CardProps,
  type CardStaticProps,
  type CardClickableProps,
  type CardLinkableProps,
  type CardElement,
  type CardHeaderProps,
  type CardFooterProps,
  type CardActionsProps,
  type CardRowsProps,
  type CardRowProps,
  type CardBleedProps,
  type CardDividerProps,
} from "./components/Card";
export { CardList, type CardListProps } from "./components/CardList";
export {
  MetricCard,
  type MetricCardProps,
  type MetricCardStaticProps,
  type MetricCardClickableProps,
  type MetricCardLinkableProps,
  type MetricTrend,
  type MetricTrendDirection,
} from "./components/MetricCard";
export { TextInput, type TextInputProps } from "./components/TextInput";
export {
  Combobox,
  type ComboboxProps,
  type ComboboxOption,
  type ComboboxSearch,
  type ComboboxSearchCopy,
} from "./components/Combobox";
export {
  RadioGroup,
  type RadioGroupProps,
  type RadioGroupItemProps,
  type RadioGroupOrientation,
} from "./components/RadioGroup";
export { Checkbox, type CheckboxProps } from "./components/Checkbox";
export {
  CheckboxGroup,
  type CheckboxGroupProps,
  type CheckboxGroupItemProps,
  type CheckboxGroupOrientation,
} from "./components/CheckboxGroup";
export { Switch, type SwitchProps } from "./components/Switch";
export { Tabs, type TabsProps, type TabsItemProps } from "./components/Tabs";
export {
  ToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
} from "./components/ToggleGroup";
export {
  Accordion,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionItemHeaderProps,
} from "./components/Accordion";
export { Icon, type IconProps } from "./components/Icon";
export {
  Badge,
  type BadgeProps,
  type BadgeIconProps,
  type BadgeCountProps,
  type BadgeTextProps,
  type BadgeDotProps,
} from "./components/Badge";
export { Notice, type NoticeProps, type NoticeIconProps } from "./components/Notice";
export {
  Popover,
  type PopoverProps,
  type PopoverPadding,
  type PopoverTriggerProps,
  type PopoverCloseProps,
  type PopoverHeaderProps,
  type PopoverFooterProps,
} from "./components/Popover";
export { InfoButton, type InfoButtonProps, type InfoButtonIntent } from "./components/InfoButton";
export {
  Drawer,
  type DrawerProps,
  type DrawerSide,
  type DrawerPadding,
  type DrawerTriggerProps,
  type DrawerCloseProps,
  type DrawerHeaderProps,
  type DrawerFooterProps,
} from "./components/Drawer";
export {
  Modal,
  type ModalProps,
  type ModalSize,
  type ModalPadding,
  type ModalTriggerProps,
  type ModalCloseProps,
  type ModalHeaderProps,
  type ModalFooterProps,
} from "./components/Modal";
export {
  Menu,
  type MenuProps,
  type MenuItemProps,
  type MenuItemIntent,
  type MenuTriggerProps,
} from "./components/Menu";
export {
  InaccessibleTooltip,
  type InaccessibleTooltipProps,
} from "./components/InaccessibleTooltip";

// `InternalTooltip` itself is intentionally NOT exported. It's a fully
// accessible tooltip, but tooltips are a pattern we don't want consumers
// relying on (even a correct one is invisible to touch and easy to overlook),
// so the system composes it only internally — e.g. Button's disabled
// explanation. `InaccessibleTooltip` above is the deliberate, bluntly-named
// escape hatch for consumers who genuinely need the pattern on an arbitrary
// element; anything a user actually needs to read should use the exported
// `Popover` instead.

// Theme: contract, factory, default themes, contrast tooling, vocabulary
export * from "./theme";

// Layout atoms (Sprinkles)
export { atoms, type Atoms } from "./styles/sprinkles.css";
export type { MarginProps, PaddingProps } from "./styles/spacingProps";

// Shared CSS variables (for advanced composition)
export {
  iconColorVar,
  textColorVar,
  focusRingColorVar,
  surfacePaddingVar,
} from "./styles/vars.css";

// Recipes (advanced: extend the system with new components of each type)
export {
  componentIntentRecipe,
  type ComponentIntentVariants,
  componentTypographyRecipe,
  type ComponentTypographyVariants,
} from "./styles/recipes/component.css";
export { surfaceRecipe, type SurfaceVariants } from "./styles/recipes/surface.css";
export {
  textIntentRecipe,
  type TextIntentVariants,
  textVariantRecipe,
  type TextVariantVariants,
} from "./styles/recipes/text.css";
export { formControlRecipe, type FormControlVariants } from "./styles/recipes/formControl.css";
export { iconRecipe, type IconVariants } from "./styles/recipes/icon.css";
export { focusRingRecipe, type FocusRingVariants } from "./styles/recipes/focusRing.css";

// Polymorphism helpers
export { useRender, composeRefs, type RenderProp } from "./utils/render";
export { cx } from "./utils/cx";
