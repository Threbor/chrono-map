import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it, vi } from 'vitest';

vi.mock('world-atlas/countries-50m.json?url', () => ({ default: '/countries.json' }));

describe('base style', () => {
  it('is a valid MapLibre style', async () => {
    const { buildBaseStyle } = await import('./basemap');
    const errors = validateStyleMin(buildBaseStyle()).map((e) => e.message);
    expect(errors).toEqual([]);
  });

  it('needs no API key', async () => {
    const { buildBaseStyle } = await import('./basemap');
    expect(JSON.stringify(buildBaseStyle())).not.toMatch(/key=|token=|cartocdn/i);
  });
});
