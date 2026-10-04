/** Longitude, latitude (WGS 84) — same order as GeoJSON. */
export type LngLat = [lng: number, lat: number];

/**
 * Degree of confidence attached to an event.
 * Mostly useful for investigations: a statement is not a fact.
 */
export type Certainty = 'confirmed' | 'reported' | 'hypothesis';

export interface StoryEvent {
  /** Stable identifier, unique within a timeline (used in URLs and links). */
  id: string;
  /**
   * Date in an ISO-like format. The precision is inferred from the string:
   * `"1891"`, `"1522-05"`, `"1903-12-17"`, `"2025-03-14T23:41"`.
   * Negative years are allowed (`"-0490"` = 490 av. J.-C.).
   * Times are local wall-clock times, without time zone.
   */
  date: string;
  title: string;
  /** Human readable place name. */
  place: string;
  coords: LngLat;
  description: string;
  /** Location is approximate (displayed as such). */
  approximate?: boolean;
  /** Preferred maximum zoom when the camera frames this event. */
  zoom?: number;
  /** Intermediate points shaping the link drawn from the previous event. */
  via?: LngLat[];
  /** The event's own trajectory, ending at `coords` (e.g. a flight). */
  route?: LngLat[];
  /** Ids of other events this one relates to (drawn as dotted links). */
  links?: string[];
  /** People / vehicles physically present — used for coherence checks. */
  actors?: string[];
  certainty?: Certainty;
  tags?: string[];
}

export interface Timeline {
  id: string;
  title: string;
  subtitle: string;
  /** Short introduction displayed before the first event. */
  intro: string;
  /** Theme label, e.g. « Histoire », « Sciences », « Enquête ». */
  theme: string;
  /** Accent colour (hex) used across the UI and on the map. */
  accent: string;
  /** Default maximum zoom used by the camera. */
  defaultZoom?: number;
  /** Optional travel-plausibility check, per actor. */
  coherence?: { maxSpeedKmh: number };
  /** Source / disclaimer line. */
  credits?: string;
  events: StoryEvent[];
}
