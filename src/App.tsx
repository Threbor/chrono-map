import { useCallback, useEffect, useState } from 'react';
import { Controls } from './features/hud/Controls';
import { EventHud } from './features/hud/EventHud';
import { TimeRuler } from './features/hud/TimeRuler';
import { Brand, ImportExport, TimelineSwitcher } from './features/library/Library';
import { MapView } from './features/map/MapView';
import { TimelinePanel } from './features/timeline/TimelinePanel';
import { useReducedMotion } from './state/useReducedMotion';
import { useStoryNavigator } from './state/useStoryNavigator';

export function App() {
  const nav = useStoryNavigator();
  const { story, active } = nav;
  const reducedMotion = useReducedMotion();
  const [overviewKey, setOverviewKey] = useState(0);
  const overview = useCallback(() => setOverviewKey((k) => k + 1), []);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || target.closest('input, textarea, select')) return;
      const actions: Record<string, () => void> = {
        ArrowDown: nav.next,
        ArrowRight: nav.next,
        j: nav.next,
        ArrowUp: nav.prev,
        ArrowLeft: nav.prev,
        k: nav.prev,
        Home: () => nav.setActive(-1),
        End: () => nav.setActive(story.events.length - 1),
        ' ': nav.togglePlay,
        o: overview,
        f: () => nav.setShowFuture((v) => !v),
      };
      const action = actions[e.key];
      if (!action) return;
      // Let buttons keep their native space/enter behaviour.
      if (e.key === ' ' && target.closest('button')) return;
      e.preventDefault();
      if (e.key !== ' ') nav.stop();
      action();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nav, story.events.length, overview]);

  const select = (i: number) => {
    nav.stop();
    nav.setActive(i);
  };

  return (
    <div className="app" style={{ '--accent': story.timeline.accent } as React.CSSProperties}>
      <TimelinePanel
        story={story}
        active={active}
        onActiveChange={nav.setActive}
        onUserScroll={nav.stop}
        header={
          <header className="panel__header">
            <Brand />
            <TimelineSwitcher
              library={nav.library}
              currentId={story.timeline.id}
              importedIds={nav.importedIds}
              onSelect={nav.selectTimeline}
              onRemove={nav.removeImported}
            />
          </header>
        }
        footer={<ImportExport timeline={story.timeline} onImport={nav.importTimeline} />}
      />

      <main className="stage">
        <MapView
          story={story}
          active={active}
          showFuture={nav.showFuture}
          overviewKey={overviewKey}
          reducedMotion={reducedMotion}
          onSelect={select}
        />
        <EventHud story={story} active={active} />
        <div className="dock">
          <Controls
            playing={nav.playing}
            canPrev={active > -1}
            canNext={active < story.events.length - 1}
            showFuture={nav.showFuture}
            onPrev={() => select(active - 1)}
            onNext={() => select(active + 1)}
            onTogglePlay={nav.togglePlay}
            onOverview={overview}
            onToggleFuture={() => nav.setShowFuture((v) => !v)}
          />
          <TimeRuler story={story} active={active} onSelect={select} />
        </div>
      </main>
    </div>
  );
}
