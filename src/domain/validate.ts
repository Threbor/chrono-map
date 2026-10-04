import { parseDate } from './time';
import type { Certainty, LngLat, StoryEvent, Timeline } from './types';

const CERTAINTIES: Certainty[] = ['confirmed', 'reported', 'hypothesis'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isCoord = (v: unknown): v is LngLat =>
  Array.isArray(v) &&
  v.length === 2 &&
  typeof v[0] === 'number' &&
  typeof v[1] === 'number' &&
  Math.abs(v[0]) <= 180 &&
  Math.abs(v[1]) <= 90;
const isCoordList = (v: unknown) => Array.isArray(v) && v.every(isCoord);
const isStrList = (v: unknown) => Array.isArray(v) && v.every(isStr);

/**
 * Validates untrusted data (e.g. an imported JSON file) and returns the list
 * of problems, in French, ready to be displayed. Empty list = valid.
 */
export function validateTimeline(data: unknown): string[] {
  const errors: string[] = [];
  if (!isObj(data)) return ['Le fichier doit contenir un objet JSON.'];

  for (const key of ['id', 'title'] as const) {
    if (!isStr(data[key])) errors.push(`Champ « ${key} » manquant ou vide.`);
  }
  if (data.accent !== undefined && !(typeof data.accent === 'string' && /^#[0-9a-f]{6}$/i.test(data.accent))) {
    errors.push('« accent » doit être une couleur hexadécimale (#rrggbb).');
  }
  if (!Array.isArray(data.events) || data.events.length === 0) {
    errors.push('« events » doit être une liste non vide.');
    return errors;
  }

  const ids = new Set<string>();
  let prevMs = -Infinity;
  data.events.forEach((raw: unknown, i: number) => {
    const at = `Événement n° ${i + 1}`;
    if (!isObj(raw)) {
      errors.push(`${at} : doit être un objet.`);
      return;
    }
    const e = raw as Partial<Record<keyof StoryEvent, unknown>>;
    if (!isStr(e.id)) errors.push(`${at} : « id » manquant.`);
    else if (ids.has(e.id)) errors.push(`${at} : identifiant « ${e.id} » en double.`);
    else ids.add(e.id);
    for (const key of ['title', 'place', 'description'] as const) {
      if (!isStr(e[key])) errors.push(`${at} : « ${key} » manquant.`);
    }
    if (!isCoord(e.coords)) errors.push(`${at} : « coords » doit valoir [longitude, latitude].`);
    if (e.via !== undefined && !isCoordList(e.via)) errors.push(`${at} : « via » doit être une liste de coordonnées.`);
    if (e.route !== undefined && !isCoordList(e.route)) errors.push(`${at} : « route » doit être une liste de coordonnées.`);
    for (const key of ['links', 'actors', 'tags'] as const) {
      if (e[key] !== undefined && !isStrList(e[key])) errors.push(`${at} : « ${key} » doit être une liste de textes.`);
    }
    if (e.certainty !== undefined && !CERTAINTIES.includes(e.certainty as Certainty)) {
      errors.push(`${at} : « certainty » doit valoir ${CERTAINTIES.join(', ')}.`);
    }
    if (typeof e.date !== 'string') {
      errors.push(`${at} : « date » manquante.`);
    } else {
      try {
        const { ms } = parseDate(e.date);
        if (ms < prevMs) errors.push(`${at} : les événements doivent être triés par date.`);
        prevMs = ms;
      } catch (err) {
        errors.push(`${at} : ${(err as Error).message}`);
      }
    }
  });

  data.events.forEach((raw: unknown, i: number) => {
    if (!isObj(raw) || !Array.isArray(raw.links)) return;
    for (const link of raw.links) {
      if (typeof link === 'string' && !ids.has(link)) {
        errors.push(`Événement n° ${i + 1} : lien vers « ${link} » introuvable.`);
      }
    }
  });
  return errors;
}

/** Fills optional presentation fields of an imported timeline. */
export function normalizeTimeline(data: Timeline): Timeline {
  return {
    ...data,
    subtitle: data.subtitle ?? '',
    intro: data.intro ?? '',
    theme: data.theme ?? 'Importée',
    accent: data.accent ?? '#9b8cff',
  };
}
