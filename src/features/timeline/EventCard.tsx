import { forwardRef } from 'react';
import { formatKm } from '../../domain/geo';
import type { CompiledEvent, Story } from '../../domain/story';
import { formatDate, formatDuration, formatTime } from '../../domain/time';
import type { Certainty } from '../../domain/types';

export const CERTAINTY_LABEL: Record<Certainty, string> = {
  confirmed: 'Confirmé',
  reported: 'Déclaratif',
  hypothesis: 'Hypothèse',
};

interface Props {
  event: CompiledEvent;
  story: Story;
  state: 'past' | 'current' | 'future';
  onSelect: () => void;
}

export const EventCard = forwardRef<HTMLLIElement, Props>(function EventCard({ event: e, story, state, onSelect }, ref) {
  const warnings = e.actorLegs.filter((l) => l.implausible);
  const actorIndex = (a: string) => story.actors.indexOf(a);

  return (
    <li ref={ref} className={`card card--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
      <span className="card__node" aria-hidden="true">
        {String(e.index + 1).padStart(2, '0')}
      </span>
      <button type="button" className="card__body" onClick={onSelect}>
        <span className="card__when">
          <time dateTime={e.date}>{formatDate(e.when)}</time>
          {e.when.precision === 'minute' && <span className="card__time">{formatTime(e.when)}</span>}
        </span>
        <span className="card__title">{e.title}</span>
        <span className="card__place">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5A4.5 4.5 0 0 0 8 1.5Zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Z" />
          </svg>
          {e.approximate && <abbr title="Localisation approximative">≈ </abbr>}
          {e.place}
        </span>
        <span className="card__desc">{e.description}</span>

        {(e.certainty || e.tags?.length || e.actors?.length) && (
          <span className="card__chips">
            {e.certainty && <span className={`chip chip--${e.certainty}`}>{CERTAINTY_LABEL[e.certainty]}</span>}
            {e.actors?.map((a) => (
              <span key={a} className="chip chip--actor" style={{ '--hue': `${(actorIndex(a) * 97 + 200) % 360}` } as React.CSSProperties}>
                {a}
              </span>
            ))}
            {e.tags?.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </span>
        )}

        {e.index > 0 && (
          <span className="card__leg">
            {formatKm(e.legKm)} · {formatDuration(e.legMs)} après l’étape précédente
          </span>
        )}
        {warnings.map((w) => (
          <span key={w.actor} className="card__warning" role="note">
            ⚠ {w.actor} : {formatKm(w.km)} en {formatDuration(w.ms)}, soit {Number.isFinite(w.kmh) ? `${Math.round(w.kmh)} km/h` : 'un déplacement instantané'} — trajet impossible
          </span>
        ))}
      </button>
    </li>
  );
});
