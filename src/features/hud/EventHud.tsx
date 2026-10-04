import { formatCoords, formatKm } from '../../domain/geo';
import type { Story } from '../../domain/story';
import { formatDate, formatDuration, formatTime } from '../../domain/time';
import { CERTAINTY_LABEL } from '../timeline/EventCard';
import './hud.css';

interface Props {
  story: Story;
  active: number;
}

/** Floating caption over the map: where and when we are. */
export function EventHud({ story, active }: Props) {
  const e = story.events[active];
  const total = story.events.length;

  if (!e) {
    return (
      <div className="hud hud--intro" key={`intro-${story.timeline.id}`}>
        <p className="hud__kicker">{story.timeline.theme} · Vue d’ensemble</p>
        <p className="hud__date">
          {formatDate(story.events[0]!.when)}
          <span className="hud__arrow">→</span>
          {formatDate(story.events[total - 1]!.when)}
        </p>
        <p className="hud__place">
          {total} événements · {formatDuration(story.end - story.start)} · appuyez sur ▶ ou faites défiler la frise
        </p>
      </div>
    );
  }

  const elapsed = e.when.ms - story.start;
  const warnings = e.actorLegs.filter((l) => l.implausible);

  return (
    <div className="hud" key={`${story.timeline.id}-${e.id}`} aria-live="polite">
      <p className="hud__kicker">
        <span className="hud__count">
          {String(active + 1).padStart(2, '0')}
          <span>/{String(total).padStart(2, '0')}</span>
        </span>
        {e.certainty && <span className={`chip chip--${e.certainty}`}>{CERTAINTY_LABEL[e.certainty]}</span>}
      </p>
      <p className="hud__date">
        {formatDate(e.when)}
        {e.when.precision === 'minute' && <span className="hud__time">{formatTime(e.when)}</span>}
      </p>
      <p className="hud__place">
        {e.approximate && '≈ '}
        {e.place}
        <span className="hud__coords">{formatCoords(e.coords)}</span>
      </p>
      {active > 0 && (
        <p className="hud__meta">
          <span>↳ {formatKm(e.legKm)}</span>
          <span>{formatDuration(e.legMs)} plus tard</span>
          <span>T + {formatDuration(elapsed)}</span>
        </p>
      )}
      {warnings.map((w) => (
        <p key={w.actor} className="hud__warning">
          Incohérence — {w.actor} aurait parcouru {formatKm(w.km)} en {formatDuration(w.ms)} (
          {Number.isFinite(w.kmh) ? `${Math.round(w.kmh)} km/h` : '∞'})
        </p>
      ))}
    </div>
  );
}
