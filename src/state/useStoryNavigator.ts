import { useCallback, useEffect, useMemo, useState } from 'react';
import { builtInTimelines } from '../data';
import { compileStory, type Story } from '../domain/story';
import type { Timeline } from '../domain/types';
import { normalizeTimeline, validateTimeline } from '../domain/validate';

const STORAGE_KEY = 'chrono-map:imported';
const PLAY_INTERVAL_MS = 5200;

function readImported(): Timeline[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown[];
    return raw.filter((t) => validateTimeline(t).length === 0).map((t) => normalizeTimeline(t as Timeline));
  } catch {
    return [];
  }
}

function writeImported(list: Timeline[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: the import still works for this visit */
  }
}

/** `#/magellan/4` → timeline "magellan", 4th event (index 3). */
function readHash(): { id?: string; index: number } {
  const [, id, n] = window.location.hash.split('/');
  const num = Number(n);
  return { id: id || undefined, index: Number.isInteger(num) && num > 0 ? num - 1 : -1 };
}

/**
 * Application state: the library of timelines, the selected story, the active
 * event (-1 = introduction) and the playback. Kept in the URL so any moment
 * of any story can be shared as a link.
 */
export function useStoryNavigator() {
  const [imported, setImported] = useState<Timeline[]>(readImported);
  const library = useMemo(() => [...builtInTimelines, ...imported], [imported]);

  const initial = readHash();
  const [timelineId, setTimelineId] = useState(() =>
    library.some((t) => t.id === initial.id) ? initial.id! : builtInTimelines[0]!.id,
  );
  const timeline = library.find((t) => t.id === timelineId) ?? builtInTimelines[0]!;
  const story: Story = useMemo(() => compileStory(timeline), [timeline]);
  const count = story.events.length;

  const [active, setActiveRaw] = useState(() => (initial.id === timelineId ? Math.min(initial.index, count - 1) : -1));
  const [playing, setPlaying] = useState(false);
  const [showFuture, setShowFuture] = useState(false);

  const setActive = useCallback((i: number) => setActiveRaw(Math.max(-1, Math.min(count - 1, i))), [count]);
  const next = useCallback(() => setActiveRaw((i) => Math.min(count - 1, i + 1)), [count]);
  const prev = useCallback(() => setActiveRaw((i) => Math.max(-1, i - 1)), []);

  const selectTimeline = useCallback((id: string) => {
    setTimelineId(id);
    setActiveRaw(-1);
    setPlaying(false);
  }, []);

  // URL ← state
  useEffect(() => {
    const hash = `#/${timelineId}${active >= 0 ? `/${active + 1}` : ''}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [timelineId, active]);

  // State ← URL (manual edits, shared links opened in the same tab)
  useEffect(() => {
    const onHash = () => {
      const { id, index } = readHash();
      if (id && library.some((t) => t.id === id)) {
        setTimelineId(id);
        setActiveRaw(index);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [library]);

  // Playback
  useEffect(() => {
    if (!playing) return;
    if (active >= count - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(next, active < 0 ? 1200 : PLAY_INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [playing, active, count, next]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && active >= count - 1) setActiveRaw(-1);
      return !p;
    });
  }, [active, count]);

  const importTimeline = useCallback(
    (data: unknown): string[] => {
      const errors = validateTimeline(data);
      if (errors.length) return errors;
      const t = normalizeTimeline(data as Timeline);
      if (builtInTimelines.some((b) => b.id === t.id)) {
        return [`L’identifiant « ${t.id} » est réservé à une frise intégrée : choisissez-en un autre.`];
      }
      const list = [...imported.filter((x) => x.id !== t.id), t];
      setImported(list);
      writeImported(list);
      selectTimeline(t.id);
      return [];
    },
    [imported, selectTimeline],
  );

  const removeImported = useCallback(
    (id: string) => {
      const list = imported.filter((t) => t.id !== id);
      setImported(list);
      writeImported(list);
      if (id === timelineId) selectTimeline(builtInTimelines[0]!.id);
    },
    [imported, timelineId, selectTimeline],
  );

  return {
    library,
    importedIds: new Set(imported.map((t) => t.id)),
    story,
    active,
    setActive,
    next,
    prev,
    selectTimeline,
    playing,
    togglePlay,
    stop: () => setPlaying(false),
    showFuture,
    setShowFuture,
    importTimeline,
    removeImported,
  };
}

export type StoryNavigator = ReturnType<typeof useStoryNavigator>;
