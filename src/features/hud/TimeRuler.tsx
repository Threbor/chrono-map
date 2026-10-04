import { timeRatio, type Story } from '../../domain/story';
import { formatDate, formatYear } from '../../domain/time';

interface Props {
  story: Story;
  active: number;
  onSelect: (index: number) => void;
}

/**
 * Proportional time axis: the gaps between ticks are true to the time that
 * separates the events — accelerations and long silences become visible.
 */
export function TimeRuler({ story, active, onSelect }: Props) {
  const { events } = story;
  const first = events[0]!.when;
  const last = events[events.length - 1]!.when;
  const sameDay = first.year === last.year && first.month === last.month && first.day === last.day;
  const label = (i: number) => {
    const w = events[i]!.when;
    return first.year === last.year ? formatDate(w, true) : formatYear(w.year);
  };
  const current = events[active];
  const progress = current ? timeRatio(story, current.when.ms) : 0;

  return (
    <div className="ruler" role="group" aria-label="Axe du temps">
      <span className="ruler__bound">{sameDay ? formatDate(first, true) : label(0)}</span>
      <div className="ruler__track">
        <div className="ruler__fill" style={{ width: `${progress * 100}%` }} />
        {events.map((e) => {
          const state = e.index === active ? 'current' : e.index < active ? 'past' : 'future';
          return (
            <button
              key={e.id}
              type="button"
              className={`ruler__tick ruler__tick--${state}`}
              style={{ left: `${timeRatio(story, e.when.ms) * 100}%` }}
              onClick={() => onSelect(e.index)}
              aria-label={`${e.index + 1}. ${formatDate(e.when)} — ${e.title}`}
            >
              <span className="ruler__tip">
                <strong>{formatDate(e.when, true)}</strong>
                {e.title}
              </span>
            </button>
          );
        })}
      </div>
      <span className="ruler__bound">{label(events.length - 1)}</span>
    </div>
  );
}
