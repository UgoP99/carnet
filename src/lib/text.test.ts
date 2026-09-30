import { describe, expect, it } from 'vitest';
import { normalize } from './text';

describe('normalize', () => {
  it('strips accents', () => {
    expect(normalize('Étranglement')).toBe('etranglement');
  });

  it('lowercases and trims', () => {
    expect(normalize('  Garde Fermée  ')).toBe('garde fermee');
  });

  it('matches équivalent strings regardless of accents/case', () => {
    expect(normalize('côte')).toBe(normalize('Cote'));
  });
});
