import { useRef, useState } from 'react';
import type { Timeline } from '../../domain/types';
import './library.css';

interface SwitcherProps {
  library: Timeline[];
  currentId: string;
  importedIds: Set<string>;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Brand() {
  return (
    <div className="brand">
      <svg viewBox="0 0 32 32" aria-hidden="true" className="brand__logo">
        <circle cx="16" cy="16" r="11" />
        <path d="M5 16h22M16 5c-4 3.5-4 18.5 0 22M16 5c4 3.5 4 18.5 0 22" />
        <circle cx="22" cy="11" r="3" className="brand__dot" />
      </svg>
      <span className="brand__name">
        Chrono<span>·</span>Carte
      </span>
    </div>
  );
}

/** Tabs to switch between the available timelines. */
export function TimelineSwitcher({ library, currentId, importedIds, onSelect, onRemove }: SwitcherProps) {
  return (
    <nav className="switcher" aria-label="Frises disponibles">
      {library.map((t) => (
        <div key={t.id} className="switcher__item" style={{ '--accent': t.accent } as React.CSSProperties}>
          <button
            type="button"
            className="switcher__tab"
            aria-current={t.id === currentId ? 'true' : undefined}
            onClick={() => onSelect(t.id)}
          >
            <span className="switcher__theme">{t.theme}</span>
            <span className="switcher__title">{t.title}</span>
          </button>
          {importedIds.has(t.id) && (
            <button type="button" className="switcher__remove" onClick={() => onRemove(t.id)} title="Retirer cette frise importée">
              ×
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}

interface ImportExportProps {
  timeline: Timeline;
  onImport: (data: unknown) => string[];
}

/** Bring your own data: import a JSON timeline, or export one as a template. */
export function ImportExport({ timeline, onImport }: ImportExportProps) {
  const input = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setErrors(onImport(JSON.parse(await file.text())));
    } catch {
      setErrors(['Le fichier n’est pas un JSON valide.']);
    }
    if (input.current) input.current.value = '';
  };

  const onExport = () => {
    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${timeline.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="io">
      <p className="io__title">Vos propres frises</p>
      <p className="io__text">
        Une enquête, un cours, un voyage… Exportez cette frise pour obtenir un modèle, modifiez-la, puis importez-la.
        Tout reste dans votre navigateur.
      </p>
      <div className="io__actions">
        <button type="button" className="btn" onClick={() => input.current?.click()}>
          Importer (.json)
        </button>
        <button type="button" className="btn btn--ghost" onClick={onExport}>
          Exporter cette frise
        </button>
      </div>
      <input ref={input} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {errors.length > 0 && (
        <ul className="io__errors" role="alert">
          {errors.slice(0, 8).map((err) => (
            <li key={err}>{err}</li>
          ))}
          {errors.length > 8 && <li>… et {errors.length - 8} autre(s) problème(s).</li>}
        </ul>
      )}
    </div>
  );
}
