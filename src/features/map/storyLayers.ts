import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { arcThrough, sliceLine } from '../../domain/geo';
import type { Story } from '../../domain/story';
import type { LngLat } from '../../domain/types';

const SOURCES = ['story-future', 'story-past', 'story-links', 'story-routes', 'story-active', 'story-head'] as const;
type SourceId = (typeof SOURCES)[number];

const line = (coordinates: LngLat[], props: Record<string, unknown> = {}): Feature<LineString> => ({
  type: 'Feature',
  properties: props,
  geometry: { type: 'LineString', coordinates },
});
const collection = <T extends Feature>(features: T[]): FeatureCollection => ({ type: 'FeatureCollection', features });

/** Adds the empty sources and the styled layers that tell the story. */
export function addStoryLayers(map: MapLibreMap) {
  for (const id of SOURCES) {
    if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: collection([]) });
  }
  const accent = ['coalesce', ['get', 'accent'], '#ffffff'] as unknown as string;

  map.addLayer({
    id: 'story-future',
    type: 'line',
    source: 'story-future',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#9fb3d9', 'line-width': 1.2, 'line-opacity': 0.35, 'line-dasharray': [1, 3] },
  });
  map.addLayer({
    id: 'story-links',
    type: 'line',
    source: 'story-links',
    layout: { 'line-cap': 'round' },
    paint: { 'line-color': accent, 'line-width': 1.4, 'line-opacity': 0.55, 'line-dasharray': [0.5, 2.5] },
  });
  map.addLayer({
    id: 'story-past-glow',
    type: 'line',
    source: 'story-past',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': accent, 'line-width': 7, 'line-blur': 6, 'line-opacity': 0.25 },
  });
  map.addLayer({
    id: 'story-past',
    type: 'line',
    source: 'story-past',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['case', ['get', 'implausible'], '#ff3b3b', accent] as unknown as string,
      'line-width': 2,
      'line-opacity': ['interpolate', ['linear'], ['get', 'age'], 0, 0.95, 1, 0.35] as unknown as number,
    },
  });
  map.addLayer({
    id: 'story-routes',
    type: 'line',
    source: 'story-routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': 1.6, 'line-opacity': 0.75, 'line-dasharray': [3, 2] },
  });
  map.addLayer({
    id: 'story-active-glow',
    type: 'line',
    source: 'story-active',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': accent, 'line-width': 12, 'line-blur': 8, 'line-opacity': 0.45 },
  });
  map.addLayer({
    id: 'story-active',
    type: 'line',
    source: 'story-active',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['case', ['get', 'implausible'], '#ff3b3b', '#ffffff'] as unknown as string,
      'line-width': 3,
    },
  });
  map.addLayer({
    id: 'story-head',
    type: 'circle',
    source: 'story-head',
    paint: {
      'circle-radius': 5,
      'circle-color': '#ffffff',
      'circle-blur': 0.2,
      'circle-stroke-color': accent,
      'circle-stroke-width': 3,
      'circle-stroke-opacity': 0.6,
    },
  });
}

function set(map: MapLibreMap, id: SourceId, data: FeatureCollection) {
  (map.getSource(id) as GeoJSONSource | undefined)?.setData(data);
}

/**
 * Renders the story for the active event. `progress` (0..1) animates the
 * last leg and the active event's own trajectory being drawn.
 */
export function renderStory(map: MapLibreMap, story: Story, active: number, progress: number, showFuture: boolean) {
  const { events, timeline } = story;
  const accent = timeline.accent;
  const implausibleAt = (i: number) => events[i]?.actorLegs.some((l) => l.implausible && l.fromIndex === i - 1) ?? false;

  const past: Feature<LineString>[] = [];
  for (let i = 1; i < active; i++) {
    past.push(line(events[i]!.leg, { accent, age: active > 1 ? (active - 1 - i) / Math.max(1, active - 1) : 0, implausible: implausibleAt(i) }));
  }

  const routes: Feature<LineString>[] = [];
  for (let i = 0; i < active; i++) {
    if (events[i]!.path.length) routes.push(line(events[i]!.path));
  }

  const activeFeatures: Feature<LineString>[] = [];
  const head: Feature<Point>[] = [];
  const current = events[active];
  if (current) {
    const t = Math.min(1, Math.max(0, progress));
    // The leg from the previous event is drawn first, then the event's own trajectory.
    const legT = current.path.length ? Math.min(1, t * 2) : t;
    const pathT = current.path.length ? Math.max(0, t * 2 - 1) : 0;
    if (current.leg.length) {
      const drawn = sliceLine(current.leg, legT);
      activeFeatures.push(line(drawn, { accent, implausible: implausibleAt(active) }));
      if (legT < 1) head.push({ type: 'Feature', properties: { accent }, geometry: { type: 'Point', coordinates: drawn[drawn.length - 1]! } });
    }
    if (current.path.length && pathT > 0) {
      const drawn = sliceLine(current.path, pathT);
      routes.push(line(drawn));
      if (pathT < 1) head.push({ type: 'Feature', properties: { accent }, geometry: { type: 'Point', coordinates: drawn[drawn.length - 1]! } });
    }
  }

  const visible = (i: number) => i <= active;
  const links: Feature<LineString>[] = [];
  const indexById = new Map(events.map((e) => [e.id, e.index]));
  events.forEach((e) => {
    for (const target of e.links ?? []) {
      const j = indexById.get(target);
      if (j === undefined) continue;
      const shown = (visible(e.index) && visible(j) && (e.index < active || progress >= 1)) || showFuture;
      if (shown) links.push(line(arcThrough([e.coords, events[j]!.coords]), { accent }));
    }
  });

  const future: Feature<LineString>[] = [];
  if (showFuture) {
    for (let i = Math.max(1, active + 1); i < events.length; i++) future.push(line(events[i]!.leg));
  }

  set(map, 'story-past', collection(past));
  set(map, 'story-routes', collection(routes));
  set(map, 'story-active', collection(activeFeatures));
  set(map, 'story-head', collection(head));
  set(map, 'story-links', collection(links));
  set(map, 'story-future', collection(future));
}
