import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';
import { palette } from './palette';

/**
 * Detailed basemap shown when zooming on a region: OpenStreetMap data served
 * as vector tiles by OpenFreeMap (free, no API key, no usage limits), styled
 * here to match the app instead of using a ready-made style.
 * Schema: https://openmaptiles.org/schema/
 */
export const DETAIL_SOURCE = 'osm';

export const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

export const detailSource: SourceSpecification = {
  type: 'vector',
  url: 'https://tiles.openfreemap.org/planet',
  attribution:
    '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> · © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> · Natural Earth',
};

const FONT = ['Noto Sans Regular'];
const FONT_BOLD = ['Noto Sans Bold'];
const FONT_ITALIC = ['Noto Sans Italic'];

const name = ['coalesce', ['get', 'name:fr'], ['get', 'name:latin'], ['get', 'name']] as unknown as string;

/** Fades a layer in between two zoom levels. */
const fadeIn = (from: number, to: number, max = 1) =>
  ['interpolate', ['linear'], ['zoom'], from, 0, to, max] as unknown as number;

const roadWidth = (base: number) =>
  ['interpolate', ['exponential', 1.6], ['zoom'], 6, base * 0.3, 12, base, 18, base * 10] as unknown as number;

export const detailLayers: LayerSpecification[] = [
  {
    id: 'osm-landuse',
    type: 'fill',
    source: DETAIL_SOURCE,
    'source-layer': 'landuse',
    minzoom: 9,
    filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial', 'retail']]],
    paint: { 'fill-color': palette.urban, 'fill-opacity': fadeIn(9, 11, 0.6) },
  },
  {
    id: 'osm-park',
    type: 'fill',
    source: DETAIL_SOURCE,
    'source-layer': 'park',
    minzoom: 8,
    paint: { 'fill-color': palette.park, 'fill-opacity': fadeIn(8, 10, 0.7) },
  },
  {
    id: 'osm-water',
    type: 'fill',
    source: DETAIL_SOURCE,
    'source-layer': 'water',
    minzoom: 4,
    paint: { 'fill-color': palette.ocean, 'fill-opacity': fadeIn(4, 5.5) },
  },
  {
    id: 'osm-waterway',
    type: 'line',
    source: DETAIL_SOURCE,
    'source-layer': 'waterway',
    minzoom: 8,
    paint: {
      'line-color': palette.ocean,
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.6, 14, 2.5] as unknown as number,
      'line-opacity': fadeIn(8, 9),
    },
  },
  {
    id: 'osm-aeroway',
    type: 'fill',
    source: DETAIL_SOURCE,
    'source-layer': 'aeroway',
    minzoom: 11,
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: { 'fill-color': palette.urban, 'fill-opacity': 0.8 },
  },
  {
    id: 'osm-building',
    type: 'fill',
    source: DETAIL_SOURCE,
    'source-layer': 'building',
    minzoom: 13,
    paint: {
      'fill-color': palette.building,
      'fill-outline-color': palette.buildingEdge,
      'fill-opacity': fadeIn(13, 14.5, 0.9),
    },
  },
  {
    id: 'osm-road-minor',
    type: 'line',
    source: DETAIL_SOURCE,
    'source-layer': 'transportation',
    minzoom: 11,
    filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary', 'track']]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': palette.roadMinor, 'line-width': roadWidth(0.8), 'line-opacity': fadeIn(11, 12.5) },
  },
  {
    id: 'osm-road-major',
    type: 'line',
    source: DETAIL_SOURCE,
    'source-layer': 'transportation',
    minzoom: 6,
    filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'trunk']]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': palette.road, 'line-width': roadWidth(1.2), 'line-opacity': fadeIn(6, 8) },
  },
  {
    id: 'osm-road-motorway',
    type: 'line',
    source: DETAIL_SOURCE,
    'source-layer': 'transportation',
    minzoom: 5,
    filter: ['==', ['get', 'class'], 'motorway'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': palette.motorway, 'line-width': roadWidth(1.6), 'line-opacity': fadeIn(5, 7) },
  },
  {
    id: 'osm-rail',
    type: 'line',
    source: DETAIL_SOURCE,
    'source-layer': 'transportation',
    minzoom: 10,
    filter: ['==', ['get', 'class'], 'rail'],
    paint: { 'line-color': palette.road, 'line-width': 1, 'line-dasharray': [3, 3], 'line-opacity': fadeIn(10, 12) },
  },
  {
    id: 'osm-boundary',
    type: 'line',
    source: DETAIL_SOURCE,
    'source-layer': 'boundary',
    minzoom: 5,
    filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
    paint: {
      'line-color': palette.border,
      'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 12, 1.6] as unknown as number,
      'line-dasharray': [3, 2],
      'line-opacity': fadeIn(5, 6.5),
    },
  },
  {
    id: 'osm-road-label',
    type: 'symbol',
    source: DETAIL_SOURCE,
    'source-layer': 'transportation_name',
    minzoom: 14,
    layout: {
      'symbol-placement': 'line',
      'text-field': name,
      'text-font': FONT,
      'text-size': 11,
    },
    paint: { 'text-color': palette.labelSoft, 'text-halo-color': palette.halo, 'text-halo-width': 1.4 },
  },
  {
    id: 'osm-water-label',
    type: 'symbol',
    source: DETAIL_SOURCE,
    'source-layer': 'water_name',
    minzoom: 5,
    layout: { 'text-field': name, 'text-font': FONT_ITALIC, 'text-size': 12, 'text-letter-spacing': 0.1 },
    paint: { 'text-color': palette.waterLabel, 'text-halo-color': palette.ocean, 'text-halo-width': 1 },
  },
  {
    id: 'osm-place-minor',
    type: 'symbol',
    source: DETAIL_SOURCE,
    'source-layer': 'place',
    minzoom: 10,
    filter: ['in', ['get', 'class'], ['literal', ['village', 'suburb', 'quarter', 'neighbourhood']]],
    layout: { 'text-field': name, 'text-font': FONT, 'text-size': 11.5 },
    paint: { 'text-color': palette.labelSoft, 'text-halo-color': palette.halo, 'text-halo-width': 1.4 },
  },
  {
    id: 'osm-place-town',
    type: 'symbol',
    source: DETAIL_SOURCE,
    'source-layer': 'place',
    minzoom: 8,
    filter: ['==', ['get', 'class'], 'town'],
    layout: { 'text-field': name, 'text-font': FONT, 'text-size': 12.5 },
    paint: { 'text-color': palette.label, 'text-halo-color': palette.halo, 'text-halo-width': 1.5 },
  },
  {
    id: 'osm-place-city',
    type: 'symbol',
    source: DETAIL_SOURCE,
    'source-layer': 'place',
    minzoom: 4.5,
    filter: ['==', ['get', 'class'], 'city'],
    layout: {
      'text-field': name,
      'text-font': FONT_BOLD,
      'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 10, 15] as unknown as number,
    },
    paint: {
      'text-color': palette.label,
      'text-halo-color': palette.halo,
      'text-halo-width': 1.6,
      'text-opacity': fadeIn(4.5, 5.5),
    },
  },
];
