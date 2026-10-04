import type { CompiledEvent } from '../../domain/story';

/**
 * DOM element of a map pin. MapLibre positions the root element with an
 * inline transform (and fades it behind the globe), so all visual effects
 * live on the inner button. State is driven by `data-state` (see map.css).
 */
export function createPin(e: CompiledEvent, onClick: () => void): HTMLElement {
  const root = document.createElement('div');
  root.className = 'pin-root';
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `pin pin--${e.certainty ?? 'confirmed'}`;
  el.setAttribute('aria-label', `${e.index + 1}. ${e.title} — ${e.place}`);
  el.innerHTML = `
    <span class="pin__pulse"></span>
    <span class="pin__dot"><span class="pin__num">${e.index + 1}</span></span>
    <span class="pin__label"></span>`;
  el.querySelector('.pin__label')!.textContent = e.place.split(',')[0]!;
  el.addEventListener('click', (ev) => {
    ev.stopPropagation();
    onClick();
  });
  root.appendChild(el);
  return root;
}

export function updatePin(root: HTMLElement, index: number, active: number, showFuture: boolean) {
  const state = index === active ? 'current' : index < active ? 'past' : showFuture ? 'future' : 'hidden';
  root.dataset.state = state;
  (root.firstElementChild as HTMLElement).tabIndex = state === 'hidden' ? -1 : 0;
  // Latest events on top; the current one above everything.
  root.style.zIndex = state === 'current' ? '1000' : String(index);
  // Older pins fade slightly to keep the eye on the present.
  root.style.setProperty('--age', state === 'past' ? String(Math.min(1, (active - index) / 8)) : '0');
}
