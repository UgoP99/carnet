import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Highlight } from './Highlight';

describe('Highlight', () => {
  it('wraps all case-insensitive matches in <mark>', () => {
    const { container } = render(<Highlight text="Kimura puis kimura" query="kimura" />);
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveTextContent('Kimura');
    expect(marks[1]).toHaveTextContent('kimura');
  });

  it('renders plain text when the query is blank or absent from the text', () => {
    const { container: blank } = render(<Highlight text="Kimura" query="" />);
    expect(blank.querySelector('mark')).toBeNull();

    const { container: noMatch } = render(<Highlight text="Kimura" query="armbar" />);
    expect(noMatch.querySelector('mark')).toBeNull();
  });
});
