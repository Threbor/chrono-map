import type { ReactNode } from 'react';
import type { Story } from '../../domain/story';
import { EventCard } from './EventCard';
import { useScrollSpy } from './useScrollSpy';
import './timeline.css';

interface Props {
  story: Story;
  active: number;
  onActiveChange: (index: number) => void;
  onUserScroll: () => void;
  header: ReactNode;
  footer: ReactNode;
}

export function TimelinePanel({ story, active, onActiveChange, onUserScroll, header, footer }: Props) {
  const { scroller, register } = useScrollSpy(
    active,
    (i) => {
      onUserScroll();
      onActiveChange(i);
    },
    story,
  );
  const { timeline, events } = story;
  const first = events[0];
  const last = events[events.length - 1];

  return (
    <div className="panel" ref={scroller} style={{ '--accent': timeline.accent } as React.CSSProperties}>
      {header}

      <section className="intro" aria-labelledby="story-title">
        <p className="intro__theme">{timeline.theme}</p>
        <h1 id="story-title" className="intro__title">
          {timeline.title}
        </h1>
        <p className="intro__subtitle">{timeline.subtitle}</p>
        {timeline.intro && <p className="intro__text">{timeline.intro}</p>}
        <dl className="intro__facts">
          <div>
            <dt>Événements</dt>
            <dd>{events.length}</dd>
          </div>
          <div>
            <dt>Début</dt>
            <dd>{first?.place.split(',')[0]}</dd>
          </div>
          <div>
            <dt>Fin</dt>
            <dd>{last?.place.split(',')[0]}</dd>
          </div>
        </dl>
        <p className="intro__hint" aria-hidden="true">
          <span className="intro__mouse" />
          Faites défiler pour remonter le fil
        </p>
      </section>

      <ol className="rail" style={{ '--progress': `${Math.max(0, (active + 0.5) / events.length) * 100}%` } as React.CSSProperties}>
        {events.map((e) => (
          <EventCard
            key={e.id}
            ref={register(e.index)}
            event={e}
            story={story}
            state={e.index === active ? 'current' : e.index < active ? 'past' : 'future'}
            onSelect={() => onActiveChange(e.index)}
          />
        ))}
      </ol>

      <div className="panel__end">
        {timeline.credits && <p className="panel__credits">{timeline.credits}</p>}
        {footer}
      </div>
    </div>
  );
}
