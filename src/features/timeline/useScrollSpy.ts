import { useCallback, useEffect, useRef } from 'react';

/** Fraction of the scroller's height where the "reading line" sits. */
const READING_LINE = 0.42;

/**
 * Two-way binding between a scrolling list and the active index:
 * - the user scrolls → the item crossing the reading line becomes active;
 * - the active index changes elsewhere → the list scrolls to the item,
 *   ignoring the items it passes on the way.
 * Index -1 is the introduction (anything before the first item).
 */
export function useScrollSpy(active: number, onChange: (index: number) => void, resetKey: unknown) {
  const scroller = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const reported = useRef(-1);
  /** Scroll position a programmatic scroll is heading to (null = idle). */
  const target = useRef<number | null>(null);
  const safety = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const register = useCallback((index: number) => (el: HTMLElement | null) => {
    items.current[index] = el;
  }, []);

  const compute = useCallback(() => {
    const root = scroller.current;
    if (!root) return;
    const line = root.getBoundingClientRect().top + root.clientHeight * READING_LINE;
    let found = -1;
    items.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) found = Math.max(found, i);
    });
    if (found !== reported.current) {
      reported.current = found;
      onChangeRef.current(found);
    }
  }, []);

  const release = useCallback(() => {
    target.current = null;
    window.clearTimeout(safety.current);
  }, []);

  // User scroll → active index.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    let frame = 0;
    const onScroll = () => {
      // A programmatic scroll is running: stay silent until it reaches its target.
      if (target.current !== null) {
        if (Math.abs(root.scrollTop - target.current) > 2) return;
        release();
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };
    // The user grabs the list again: programmatic scrolling gives way.
    const onUserInput = () => {
      if (target.current !== null) release();
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('wheel', onUserInput, { passive: true });
    root.addEventListener('touchstart', onUserInput, { passive: true });
    return () => {
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('wheel', onUserInput);
      root.removeEventListener('touchstart', onUserInput);
      cancelAnimationFrame(frame);
    };
  }, [compute, release]);

  // Active index changed elsewhere → scroll to the item.
  useEffect(() => {
    const root = scroller.current;
    if (!root || active === reported.current) return;
    reported.current = active;
    const el = active >= 0 ? items.current[active] : null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Item top aligned slightly above the reading line.
    const wanted = el
      ? el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - root.clientHeight * READING_LINE + 24
      : 0;
    const top = Math.round(Math.max(0, Math.min(wanted, root.scrollHeight - root.clientHeight)));
    if (Math.abs(root.scrollTop - top) <= 2) return;
    target.current = top;
    // Safety net if the scroll is interrupted before reaching its target.
    window.clearTimeout(safety.current);
    safety.current = window.setTimeout(release, 2500);
    root.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, release]);

  // New story → back to the top (not on first render: a shared link may
  // point to an event further down).
  const lastKey = useRef(resetKey);
  useEffect(() => {
    if (lastKey.current === resetKey) return;
    lastKey.current = resetKey;
    reported.current = -1;
    scroller.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  return { scroller, register };
}
