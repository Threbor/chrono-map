import { useEffect, useRef, useState } from 'react';
import maplibregl, { LngLatBounds, type Map as MapLibreMap, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Story } from '../../domain/story';
import { haversineKm, sphericalCentroid } from '../../domain/geo';
import type { LngLat } from '../../domain/types';
import { buildBaseStyle, loadGeography } from './basemap';
import { createPin, updatePin } from './pins';
import { addStoryLayers, renderStory } from './storyLayers';
import './map.css';

interface Props {
  story: Story;
  active: number;
  showFuture: boolean;
  /** Incremented to ask the camera for an overview of the visited events. */
  overviewKey: number;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
}

const boundsOf = (points: LngLat[]) =>
  points.reduce((b, p) => b.extend(p), new LngLatBounds(points[0]!, points[0]!));

/** Room left for the floating caption (top) and the dock (bottom). */
function framePadding(map: MapLibreMap) {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const small = w < 700;
  return {
    top: Math.round(Math.min(230, h * (small ? 0.24 : 0.28))),
    bottom: Math.round(Math.min(130, h * 0.2)),
    left: Math.round(Math.min(90, w * 0.1)),
    right: Math.round(Math.min(small ? 90 : 190, w * 0.2)),
  };
}

/** Zoom at which the whole globe fits nicely in the container. */
function globeZoom(map: MapLibreMap) {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  // Globe radius in pixels ≈ 81.5 · 2^zoom.
  return Math.max(0.3, Math.min(3, Math.log2((0.36 * Math.min(w, h)) / 81.5)));
}

/**
 * Frames a set of points. Spread across the globe, the whole sphere is shown,
 * turned towards their centre; otherwise the camera fits their bounds.
 */
function frameCamera(map: MapLibreMap, points: LngLat[], maxZoom: number, duration: number) {
  const center = sphericalCentroid(points);
  const spread = Math.max(...points.map((p) => haversineKm(center, p)));
  if (spread > 2800) {
    map.flyTo({ center, zoom: globeZoom(map), pitch: 0, bearing: 0, duration, curve: 1.6 });
    return;
  }
  const cam = map.cameraForBounds(boundsOf(points), { padding: framePadding(map), maxZoom });
  const zoom = cam?.zoom ?? maxZoom;
  map.flyTo({
    center: cam?.center ?? points[0]!,
    zoom,
    pitch: zoom >= 10 ? 45 : zoom >= 7 ? 20 : 0,
    bearing: 0,
    duration,
    curve: 1.6,
  });
}

export function MapView({ story, active, showFuture, overviewKey, reducedMotion, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const lastActive = useRef<{ story: Story; index: number } | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [ready, setReady] = useState(false);

  // Map creation (once).
  useEffect(() => {
    const map = new maplibregl.Map({
      container: container.current!,
      style: buildBaseStyle(),
      center: [10, 30],
      zoom: 1.4,
      attributionControl: false,
      maxPitch: 60,
      fadeDuration: 150,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    const attribution = new maplibregl.AttributionControl({ compact: true });
    map.addControl(attribution, 'bottom-right');
    // Start collapsed: the (i) button opens it.
    map.once('idle', () => map.getContainer().querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show'));
    map.on('load', () => {
      addStoryLayers(map);
      setReady(true);
      loadGeography()
        .then(({ countries, borders }) => {
          (map.getSource('countries') as maplibregl.GeoJSONSource).setData(countries);
          (map.getSource('borders') as maplibregl.GeoJSONSource).setData(borders);
        })
        .catch((err) => console.warn('Géographie indisponible', err));
    });
    // Tiles from the detail basemap may be blocked offline: keep the console quiet.
    map.on('error', (e) => {
      if (!(e as { sourceId?: string }).sourceId) console.warn(e.error);
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // One HTML pin per event, rebuilt when the story changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markers.current = story.events.map((e) =>
      new maplibregl.Marker({
        element: createPin(e, () => onSelectRef.current(e.index)),
        anchor: 'center',
        opacityWhenCovered: '0',
      })
        .setLngLat(e.coords)
        .addTo(map),
    );
    lastActive.current = null;
    return () => {
      markers.current.forEach((m) => m.remove());
      markers.current = [];
    };
  }, [story, ready]);

  // Lines, pins and camera follow the active event.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.getContainer().style.setProperty('--accent', story.timeline.accent);

    const previous = lastActive.current;
    const stepForward = previous?.story === story && active === previous.index + 1;
    lastActive.current = { story, index: active };

    // During the introduction, every pin is shown as a faint preview.
    markers.current.forEach((m, i) => updatePin(m.getElement(), i, active, showFuture || active < 0));

    // Camera.
    const current = story.events[active];
    const duration = reducedMotion ? 0 : stepForward ? 2200 : 1600;
    if (!current) {
      frameCamera(map, story.events.map((e) => e.coords), 12, duration);
    } else {
      // The new event, its own trajectory and the leg that leads to it.
      const focus: LngLat[] = [current.coords, ...current.path, ...current.leg];
      frameCamera(map, focus, current.zoom ?? story.timeline.defaultZoom ?? 5, duration);
    }

    // Lines: draw the new leg progressively when stepping forward.
    if (!stepForward || reducedMotion || !current) {
      renderStory(map, story, active, 1, showFuture || active < 0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const length = current.path.length ? 2400 : 1600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / length);
      const eased = 1 - Math.pow(1 - t, 3);
      renderStory(map, story, active, eased, showFuture);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    renderStory(map, story, active, 0, showFuture);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      renderStory(map, story, active, 1, showFuture);
    };
  }, [story, active, showFuture, ready, reducedMotion]);

  // Overview of everything seen so far.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || overviewKey === 0) return;
    const seen = showFuture || active < 0 ? story.events : story.events.slice(0, active + 1);
    frameCamera(map, seen.flatMap((e) => [e.coords, ...e.path]), 12, reducedMotion ? 0 : 1800);
  }, [overviewKey]); // only on explicit request

  return <div ref={container} className="map" aria-label="Carte des événements" role="region" />;
}
