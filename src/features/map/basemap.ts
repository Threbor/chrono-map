import type { StyleSpecification } from 'maplibre-gl';
import type { FeatureCollection, MultiLineString, Position } from 'geojson';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import countriesUrl from 'world-atlas/countries-50m.json?url';
import { unwrap } from '../../domain/geo';
import type { LngLat } from '../../domain/types';
import { DETAIL_SOURCE, GLYPHS, detailLayers, detailSource } from './detailLayers';
import { palette } from './palette';

const empty: FeatureCollection = { type: 'FeatureCollection', features: [] };

function graticule(step = 15): FeatureCollection<MultiLineString> {
  const lines: [number, number][][] = [];
  for (let lng = -180; lng <= 180; lng += step) {
    lines.push(Array.from({ length: 33 }, (_, i) => [lng, -80 + i * 5] as [number, number]));
  }
  for (let lat = -75; lat <= 75; lat += step) {
    lines.push(Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat] as [number, number]));
  }
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: lines } }],
  };
}

/**
 * Self-contained base style: the world geography ships with the app
 * (Natural Earth, public domain) so the map always renders, offline included.
 * Detailed OpenStreetMap layers fade in when zooming on a region.
 */
export function buildBaseStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS,
    projection: { type: 'globe' },
    sky: {
      'sky-color': '#0b1630',
      'horizon-color': '#1d3566',
      'fog-color': '#0b1630',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.6,
      'fog-ground-blend': 0.9,
      'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 0.85, 5, 0.4, 7, 0],
    },
    sources: {
      graticule: { type: 'geojson', data: graticule() },
      countries: { type: 'geojson', data: empty },
      borders: { type: 'geojson', data: empty },
      [DETAIL_SOURCE]: detailSource,
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': palette.ocean } },
      {
        id: 'graticule',
        type: 'line',
        source: 'graticule',
        paint: { 'line-color': palette.graticule, 'line-width': 0.6, 'line-opacity': ['interpolate', ['linear'], ['zoom'], 2, 0.9, 5, 0] },
      },
      {
        id: 'land',
        type: 'fill',
        source: 'countries',
        paint: { 'fill-color': palette.land, 'fill-antialias': true },
      },
      ...detailLayers,
      {
        id: 'land-edge',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': palette.landEdge,
          'line-width': 0.8,
          'line-blur': 0.4,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 1, 6, 0],
        },
      },
      {
        id: 'borders',
        type: 'line',
        source: 'borders',
        paint: {
          'line-color': palette.border,
          'line-width': 0.6,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 6, 0],
          'line-dasharray': [2, 2],
        },
      },
    ],
  };
}

/**
 * Rings cut at the antimeridian (eastern Russia, Fiji…) jump from +180° to
 * −180°; on the globe that edge would wrap around the whole planet and flood
 * the oceans. Making longitudes continuous fixes it. Rings that genuinely go
 * around the world (Antarctica) do not close once unwrapped: keep those as is.
 */
export function fixRing(ring: Position[]): Position[] {
  const unwrapped = unwrap(ring as LngLat[]);
  const first = unwrapped[0]!;
  const last = unwrapped[unwrapped.length - 1]!;
  return Math.abs(first[0] - last[0]) < 1e-6 ? unwrapped : ring;
}

/** Loads the bundled world geometry (≈ 750 kB, cached and compressed). */
export async function loadGeography(): Promise<{ countries: FeatureCollection; borders: FeatureCollection }> {
  const topology = (await (await fetch(countriesUrl)).json()) as Topology<{ countries: GeometryCollection }>;
  const countries = feature(topology, topology.objects.countries) as FeatureCollection;
  for (const f of countries.features) {
    const g = f.geometry;
    if (g.type === 'Polygon') g.coordinates = g.coordinates.map(fixRing);
    else if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((poly) => poly.map(fixRing));
  }
  const borders: FeatureCollection = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: mesh(topology, topology.objects.countries, (a, b) => a !== b) }],
  };
  return { countries, borders };
}
