'use client';
import * as React from 'react';
import { focusRingRecipe } from '../../styles/recipes/focusRing.css';
import { surfaceRecipe } from '../../styles/recipes/surface.css';
import type { HeadingLevel, Intent, SurfaceSaliency } from '../../theme/constants';
import { cx } from '../../utils/cx';
import { useRender, type RenderProp } from '../../utils/render';
import { Heading } from '../Heading';
import { Text } from '../Text';
import {
  cardBleed,
  cardDivider,
  cardFooter,
  cardHeader,
  cardHeaderText,
  cardRoot,
} from './card.css';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/** Semantic root element for a Card. */
export type CardElement = 'div' | 'section' | 'main' | 'article';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: CardPadding;
  /** Semantic root element. Default `div`. */
  as?: CardElement;
  /** Rendered above the content — typically a `<Card.Header />`. */
  header?: React.ReactNode;
  /** Rendered below the content — typically a `<Card.Footer />`. */
  footer?: React.ReactNode;
  /** Uses `aria-disabled` rather than `disabled`. */
  disabled?: boolean;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Card — a "surface" element type. Two saliency levels (low/high). Supports the
 * neutral intent by default; other intents exist for surfaces like Notice.
 *
 * Composes `header` / `footer` props (or `<Card.Header>` / `<Card.Footer>`
 * children) around its content, plus `<Card.Bleed>` (full-width content) and
 * `<Card.Divider>` (edge-to-edge rule). Use `as` to pick the semantic element.
 */
function CardRoot({
  intent,
  saliency,
  padding,
  as = 'div',
  header,
  footer,
  disabled,
  render,
  className,
  children,
  ref,
  ...rest
}: CardProps) {
  return useRender({
    render,
    defaultElement: as,
    props: {
      ref,
      className: cx(
        surfaceRecipe({ intent, saliency, padding }),
        focusRingRecipe({ type: 'visible' }),
        cardRoot,
        className,
      ),
      'aria-disabled': disabled || undefined,
      children: (
        <>
          {header}
          {children}
          {footer}
        </>
      ),
      ...rest,
    },
  });
}

export interface CardHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title text/content, rendered as a `Heading`. */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Document-outline level for the rendered title heading. Default `3`. */
  level?: HeadingLevel;
  ref?: React.Ref<HTMLDivElement>;
}

function CardHeader({
  title,
  subtitle,
  level = 3,
  className,
  children,
  ref,
  ...rest
}: CardHeaderProps) {
  return (
    <div ref={ref} className={cx(cardHeader, className)} {...rest}>
      {(title != null || subtitle != null) && (
        <div className={cardHeaderText}>
          {title != null && (
            <Heading level={level} variant="lg">
              {title}
            </Heading>
          )}
          {subtitle != null && (
            <Text variant="sm" saliency="low">
              {subtitle}
            </Text>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function CardFooter({ className, children, ref, ...rest }: CardFooterProps) {
  return (
    <div ref={ref} className={cx(cardFooter, className)} {...rest}>
      {children}
    </div>
  );
}

export type CardBleedProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function CardBleed({ className, children, ref, ...rest }: CardBleedProps) {
  return (
    <div ref={ref} className={cx(cardBleed, className)} {...rest}>
      {children}
    </div>
  );
}

export type CardDividerProps = React.HTMLAttributes<HTMLHRElement> & {
  ref?: React.Ref<HTMLHRElement>;
};

function CardDivider({ className, ref, ...rest }: CardDividerProps) {
  return <hr ref={ref} className={cx(cardDivider, className)} {...rest} />;
}

CardRoot.displayName = 'Card';
CardHeader.displayName = 'Card.Header';
CardFooter.displayName = 'Card.Footer';
CardBleed.displayName = 'Card.Bleed';
CardDivider.displayName = 'Card.Divider';

/** Card with its compound parts attached. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Footer: CardFooter,
  Bleed: CardBleed,
  Divider: CardDivider,
});
