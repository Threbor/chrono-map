import { describe, expect, it } from 'vitest';
import { compileStory } from '../domain/story';
import { validateTimeline } from '../domain/validate';
import { affaireAzur } from './affaire-azur';
import { builtInTimelines } from './index';

describe('built-in timelines', () => {
  it.each(builtInTimelines.map((t) => [t.id, t] as const))('%s is valid', (_id, timeline) => {
    expect(validateTimeline(timeline)).toEqual([]);
    expect(timeline.events.length).toBeGreaterThanOrEqual(10);
  });

  it('have unique ids', () => {
    const ids = builtInTimelines.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('flag the impossible journey in the investigation, and only that one', () => {
    const story = compileStory(affaireAzur);
    const flagged = story.events.flatMap((e) =>
      e.actorLegs.filter((l) => l.implausible).map((l) => `${e.id}:${l.actor}`),
    );
    expect(flagged).toEqual(['bornage:Marc Varenne']);
  });
});

describe('validateTimeline', () => {
  it('reports readable errors', () => {
    const errors = validateTimeline({
      id: 'x',
      title: 'X',
      events: [
        { id: 'a', title: 'A', place: 'P', description: 'D', date: '2000-01-02', coords: [0, 0] },
        { id: 'a', title: 'B', place: 'P', description: 'D', date: '2000-01-01', coords: [200, 0], links: ['zz'] },
      ],
    });
    expect(errors.some((e) => e.includes('en double'))).toBe(true);
    expect(errors.some((e) => e.includes('triés'))).toBe(true);
    expect(errors.some((e) => e.includes('coords'))).toBe(true);
    expect(errors.some((e) => e.includes('zz'))).toBe(true);
  });
});
