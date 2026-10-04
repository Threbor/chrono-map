interface Props {
  playing: boolean;
  canPrev: boolean;
  canNext: boolean;
  showFuture: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onOverview: () => void;
  onToggleFuture: () => void;
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export function Controls(p: Props) {
  return (
    <div className="controls" role="toolbar" aria-label="Lecture">
      <button type="button" className="ctrl" onClick={p.onPrev} disabled={!p.canPrev} title="Précédent (↑)">
        <Icon d="M15.5 5 8.5 12l7 7" />
      </button>
      <button
        type="button"
        className="ctrl ctrl--play"
        onClick={p.onTogglePlay}
        title={p.playing ? 'Pause (espace)' : 'Lecture automatique (espace)'}
        aria-pressed={p.playing}
      >
        {p.playing ? <Icon d="M8 5v14M16 5v14" /> : <Icon d="M8 5.5v13l10.5-6.5z" />}
      </button>
      <button type="button" className="ctrl" onClick={p.onNext} disabled={!p.canNext} title="Suivant (↓)">
        <Icon d="m8.5 5 7 7-7 7" />
      </button>
      <span className="controls__sep" />
      <button type="button" className="ctrl" onClick={p.onOverview} title="Vue d’ensemble (O)">
        <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      </button>
      <button
        type="button"
        className="ctrl"
        onClick={p.onToggleFuture}
        aria-pressed={p.showFuture}
        title={p.showFuture ? 'Masquer les événements à venir (F)' : 'Montrer toute la frise (F)'}
      >
        <Icon d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </button>
    </div>
  );
}
