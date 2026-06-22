// Components
export { Chip, type ChipProps } from './components/Chip';
export { Text, type TextProps } from './components/Text';
export { Heading, type HeadingProps } from './components/Heading';
export { Card, type CardProps, type CardPadding } from './components/Card';
export { TextInput, type TextInputProps } from './components/TextInput';
export { Icon, type IconProps } from './components/Icon';

// Theme: contract, factory, default themes, contrast tooling, vocabulary
export * from './theme';

// Layout atoms (Sprinkles)
export { atoms, type Atoms } from './styles/sprinkles.css';

// Shared icon-colour variable (for advanced composition)
export { iconColorVar } from './styles/vars.css';

// Recipes (advanced: extend the system with new components of each type)
export { componentRecipe, type ComponentVariants } from './styles/recipes/component.css';
export { surfaceRecipe, type SurfaceVariants } from './styles/recipes/surface.css';
export { textRecipe, type TextVariants } from './styles/recipes/text.css';
export {
  formControlRecipe,
  type FormControlVariants,
} from './styles/recipes/formControl.css';
export { iconRecipe, type IconVariants } from './styles/recipes/icon.css';

// Polymorphism helpers
export { useRender, composeRefs, type RenderProp } from './utils/render';
export { cx } from './utils/cx';
