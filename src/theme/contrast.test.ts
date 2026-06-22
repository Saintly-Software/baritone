import { describe, expect, it } from 'vitest';
import { findContrastIssues } from './contrast';
import { buildDefaultTokens } from './defaultTokens';

describe('default theme contrast', () => {
  it('the light theme has no contrast issues', () => {
    const issues = findContrastIssues(buildDefaultTokens('light'));
    expect(issues).toEqual([]);
  });

  it('the dark theme has no contrast issues', () => {
    const issues = findContrastIssues(buildDefaultTokens('dark'));
    expect(issues).toEqual([]);
  });
});
