// @vitest-environment jsdom

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MathMarkdown } from '../../components/landing/MathMarkdown';

describe('math markdown', () => {
  it('renders markdown text and KaTeX output from math expressions', () => {
    const { container } = render(
      <MathMarkdown content={'Classic defaults include $p_0 = 0.15$.\n\n$$p_{\\text{bomb}}(s,w)=p_0$$'} />,
    );

    expect(container.textContent).toContain('Classic defaults include');
    expect(container.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2);
  });
});
