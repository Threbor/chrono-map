import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatDuration, parseDate } from './time';

describe('parseDate', () => {
  it('infers precision from the string', () => {
    expect(parseDate('1891').precision).toBe('year');
    expect(parseDate('1522-05').precision).toBe('month');
    expect(parseDate('1903-12-17').precision).toBe('day');
    expect(parseDate('2025-03-14T23:41').precision).toBe('minute');
  });

  it('handles early and negative years', () => {
    expect(parseDate('0079-08-24').year).toBe(79);
    expect(new Date(parseDate('0079').ms).getUTCFullYear()).toBe(79);
    expect(parseDate('-0490').ms).toBeLessThan(parseDate('0001').ms);
  });

  it('rejects malformed or impossible dates', () => {
    expect(() => parseDate('17/12/1903')).toThrow();
    expect(() => parseDate('1903-13-01')).toThrow();
    expect(() => parseDate('1903-02-30')).toThrow();
  });
});

describe('formatting', () => {
  it('formats dates in French', () => {
    expect(formatDate(parseDate('1903-12-17'))).toBe('17 décembre 1903');
    expect(formatDate(parseDate('1783-06-01'))).toBe('1er juin 1783');
    expect(formatDate(parseDate('1522-05'))).toBe('mai 1522');
    expect(formatDate(parseDate('-0490'))).toBe('491 av. J.-C.');
    expect(formatDateTime(parseDate('2025-03-14T23:41'))).toBe('14 mars 2025 · 23 h 41');
  });

  it('formats durations with two units at most', () => {
    expect(formatDuration(17 * 60_000)).toBe('17 min');
    expect(formatDuration((3 * 60 + 5) * 60_000)).toBe('3 h 05');
    expect(formatDuration(parseDate('1522-09-06').ms - parseDate('1519-09-20').ms)).toBe('2 ans 11 mois');
  });
});
