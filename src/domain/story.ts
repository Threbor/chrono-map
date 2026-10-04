import { arcThrough, haversineKm, lineLengthKm } from './geo';
import { parseDate, type ParsedDate } from './time';
import type { LngLat, StoryEvent, Timeline } from './types';

/** Movement of one actor between two of their consecutive events. */
export interface ActorLeg {
  actor: string;
  fromIndex: number;
  km: number;
  ms: number;
  kmh: number;
  /** Speed exceeds the timeline's plausibility threshold. */
  implausible: boolean;
}

export interface CompiledEvent extends StoryEvent {
  index: number;
  when: ParsedDate;
  /** Great-circle path from the previous event (via waypoints), empty for the first. */
  leg: LngLat[];
  /** Straight distance from the previous event (km). */
  legKm: number;
  /** Elapsed time since the previous event (ms). */
  legMs: number;
  /** Trajectory owned by the event (unwrapped), if any. */
  path: LngLat[];
  actorLegs: ActorLeg[];
}

export interface Story {
  timeline: Timeline;
  events: CompiledEvent[];
  start: number;
  end: number;
  actors: string[];
}

/**
 * Turns raw timeline data into everything the views need: parsed dates,
 * paths between events, distances, and per-actor plausibility checks.
 */
export function compileStory(timeline: Timeline): Story {
  const maxKmh = timeline.coherence?.maxSpeedKmh;
  const lastByActor = new Map<string, number>();
  const events: CompiledEvent[] = [];

  timeline.events.forEach((e, index) => {
    const when = parseDate(e.date);
    const prev = events[index - 1];
    const leg = prev ? arcThrough([prev.coords, ...(e.via ?? []), e.coords]) : [];
    const actorLegs: ActorLeg[] = [];

    for (const actor of e.actors ?? []) {
      const fromIndex = lastByActor.get(actor);
      if (fromIndex !== undefined) {
        const from = events[fromIndex]!;
        const km = haversineKm(from.coords, e.coords);
        const ms = when.ms - from.when.ms;
        const kmh = ms > 0 ? km / (ms / 3_600_000) : km > 0.5 ? Infinity : 0;
        actorLegs.push({ actor, fromIndex, km, ms, kmh, implausible: maxKmh !== undefined && kmh > maxKmh });
      }
      lastByActor.set(actor, index);
    }

    events.push({
      ...e,
      index,
      when,
      leg,
      legKm: prev ? lineLengthKm(leg) : 0,
      legMs: prev ? when.ms - prev.when.ms : 0,
      path: e.route?.length ? arcThrough([...e.route, e.coords]) : [],
      actorLegs,
    });
  });

  const actors = [...new Set(events.flatMap((e) => e.actors ?? []))];
  return {
    timeline,
    events,
    start: events[0]?.when.ms ?? 0,
    end: events[events.length - 1]?.when.ms ?? 0,
    actors,
  };
}

/** Position (0..1) of an event on the story's time axis. */
export function timeRatio(story: Story, ms: number): number {
  const span = story.end - story.start;
  return span > 0 ? (ms - story.start) / span : 0;
}
