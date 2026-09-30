import { describe, expect, it } from 'vitest';
import { parseHttpsUrl } from './url';

describe('parseHttpsUrl', () => {
  it('accepts a valid https URL', () => {
    expect(parseHttpsUrl('https://youtube.com/watch?v=abc')).toBe(
      'https://youtube.com/watch?v=abc',
    );
  });

  it('rejects javascript: URLs', () => {
    expect(parseHttpsUrl(['javascript', 'alert(1)'].join(':'))).toBeNull();
  });

  it('rejects data: URLs', () => {
    expect(parseHttpsUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('rejects http: URLs', () => {
    expect(parseHttpsUrl('http://example.com')).toBeNull();
  });

  it('rejects URLs with credentials', () => {
    expect(parseHttpsUrl('https://user:pass@example.com')).toBeNull();
  });

  it('rejects malformed input', () => {
    expect(parseHttpsUrl('not a url')).toBeNull();
  });
});
