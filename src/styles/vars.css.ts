import { createVar } from '@vanilla-extract/css';

/**
 * Shared CSS custom property used to propagate the *current text colour* to
 * icons. `Text` (and the element recipes) set this to their resolved colour, and
 * `Icon`, when rendered inside, reads it so icon colour matches surrounding
 * text automatically. A standalone `Icon` ignores it and uses component tokens.
 */
export const iconColorVar = createVar('iconColor');
