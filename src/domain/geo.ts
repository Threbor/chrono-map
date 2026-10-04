import type { LngLat } from './types';

const R = 6371; // km
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in kilometres. */
export function haversineKm(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Points along the great circle from a to b (inclusive), `steps` segments. */
export function greatCircle(a: LngLat, b: LngLat, steps?: number): LngLat[] {
  const φ1 = rad(a[1]);
  const λ1 = rad(a[0]);
  const φ2 = rad(b[1]);
  const λ2 = rad(b[0]);
  const d = 2 * Math.asin(
    Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2),
  );
  if (d < 1e-9) return [a, b];
  const n = steps ?? Math.max(2, Math.min(128, Math.ceil(deg(d) / 1.5)));
  const pts: LngLat[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    pts.push([deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
  }
  pts[0] = a;
  pts[n] = b;
  return pts;
}

/**
 * Makes longitudes continuous (no jump > 180°) so lines crossing the
 * antimeridian are drawn the short way instead of across the whole map.
 */
export function unwrap(line: LngLat[]): LngLat[] {
  const out: LngLat[] = [];
  let offset = 0;
  let prev: number | undefined;
  for (const [lng, lat] of line) {
    if (prev !== undefined) {
      const delta = lng + offset - prev;
      if (delta > 180) offset -= 360;
      else if (delta < -180) offset += 360;
    }
    const l = lng + offset;
    out.push([l, lat]);
    prev = l;
  }
  return out;
}

/** Great-circle path through every waypoint, longitudes unwrapped. */
export function arcThrough(points: LngLat[]): LngLat[] {
  const out: LngLat[] = [];
  for (let i = 1; i < points.length; i++) {
    const seg = greatCircle(points[i - 1]!, points[i]!);
    out.push(...(i === 1 ? seg : seg.slice(1)));
  }
  return unwrap(out.length ? out : points);
}

/** Total length (km) of a polyline. */
export function lineLengthKm(line: LngLat[]): number {
  let total = 0;
  for (let i = 1; i < line.length; i++) total += haversineKm(line[i - 1]!, line[i]!);
  return total;
}

/** Portion of a polyline from its start up to fraction `t` (0..1) of its length. */
export function sliceLine(line: LngLat[], t: number): LngLat[] {
  if (t >= 1 || line.length < 2) return line;
  if (t <= 0) return [line[0]!];
  const lengths: number[] = [0];
  for (let i = 1; i < line.length; i++) {
    lengths.push(lengths[i - 1]! + Math.hypot(line[i]![0] - line[i - 1]![0], line[i]![1] - line[i - 1]![1]));
  }
  const target = lengths[lengths.length - 1]! * t;
  const out: LngLat[] = [line[0]!];
  for (let i = 1; i < line.length; i++) {
    if (lengths[i]! >= target) {
      const seg = lengths[i]! - lengths[i - 1]!;
      const f = seg ? (target - lengths[i - 1]!) / seg : 0;
      const a = line[i - 1]!;
      const b = line[i]!;
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      return out;
    }
    out.push(line[i]!);
  }
  return out;
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km).toLocaleString('fr-FR')} km`;
}

export function formatCoords([lng, lat]: LngLat): string {
  const f = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(2).replace('.', ',')}° ${v >= 0 ? pos : neg}`;
  return `${f(lat, 'N', 'S')} · ${f(lng, 'E', 'O')}`;
}

/** Centre of a set of points on the sphere (mean of unit vectors). */
export function sphericalCentroid(points: LngLat[]): LngLat {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const [lng, lat] of points) {
    x += Math.cos(rad(lat)) * Math.cos(rad(lng));
    y += Math.cos(rad(lat)) * Math.sin(rad(lng));
    z += Math.sin(rad(lat));
  }
  return [deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.hypot(x, y)))];
}
