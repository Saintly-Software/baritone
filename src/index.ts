// Components
export { Chip, type ChipProps } from './components/Chip';
export { Text, type TextProps } from './components/Text';
export { Heading, type HeadingProps } from './components/Heading';
export {
  Card,
  type CardProps,
  type CardPadding,
  type CardElement,
  type CardHeaderProps,
  type CardFooterProps,
  type CardBleedProps,
  type CardDividerProps,
} from './components/Card';
export { TextInput, type TextInputProps } from './components/TextInput';
export { Icon, type IconProps } from './components/Icon';

// Theme: contract, factory, default themes, contrast tooling, vocabulary
export * from './theme';

// Layout atoms (Sprinkles)
export { atoms, type Atoms } from './styles/sprinkles.css';

// Shared CSS variables (for advanced composition)
export {
  iconColorVar,
  textColorVar,
  focusRingColorVar,
  surfacePaddingVar,
} from './styles/vars.css';

// Recipes (advanced: extend the system with new components of each type)
export {
  componentIntentRecipe,
  type ComponentIntentVariants,
  componentTypographyRecipe,
  type ComponentTypographyVariants,
} from './styles/recipes/component.css';
export { surfaceRecipe, type SurfaceVariants } from './styles/recipes/surface.css';
export {
  textIntentRecipe,
  type TextIntentVariants,
  textVariantRecipe,
  type TextVariantVariants,
} from './styles/recipes/text.css';
export {
  formControlRecipe,
  type FormControlVariants,
} from './styles/recipes/formControl.css';
export { iconRecipe, type IconVariants } from './styles/recipes/icon.css';
export {
  focusRingRecipe,
  type FocusRingVariants,
} from './styles/recipes/focusRing.css';

// Polymorphism helpers
export { useRender, composeRefs, type RenderProp } from './utils/render';
export { cx } from './utils/cx';
