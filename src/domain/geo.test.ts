import { describe, expect, it } from 'vitest';
import { arcThrough, greatCircle, haversineKm, sliceLine, unwrap } from './geo';
import type { LngLat } from './types';

const paris: LngLat = [2.3522, 48.8566];
const newYork: LngLat = [-74.006, 40.7128];

describe('geo', () => {
  it('computes great-circle distances', () => {
    expect(haversineKm(paris, newYork)).toBeGreaterThan(5800);
    expect(haversineKm(paris, newYork)).toBeLessThan(5870);
  });

  it('interpolates a great circle between endpoints', () => {
    const line = greatCircle(paris, newYork);
    expect(line[0]).toEqual(paris);
    expect(line[line.length - 1]).toEqual(newYork);
    // The great circle bulges north of both cities.
    expect(Math.max(...line.map((p) => p[1]))).toBeGreaterThan(50);
  });

  it('unwraps longitudes across the antimeridian', () => {
    const line = unwrap([[170, 0], [-175, 0], [-160, 0]]);
    expect(line.map((p) => p[0])).toEqual([170, 185, 200]);
  });

  it('draws trans-Pacific arcs without jumping across the map', () => {
    const arc = arcThrough([[-151.8, -11.4], [144.79, 13.44]]);
    for (let i = 1; i < arc.length; i++) {
      expect(Math.abs(arc[i]![0] - arc[i - 1]![0])).toBeLessThan(10);
    }
  });

  it('slices a line by length fraction', () => {
    const line: LngLat[] = [[0, 0], [10, 0], [20, 0]];
    expect(sliceLine(line, 0.25)).toEqual([[0, 0], [5, 0]]);
    expect(sliceLine(line, 1)).toBe(line);
  });
});
