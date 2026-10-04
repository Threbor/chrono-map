export type DatePrecision = 'year' | 'month' | 'day' | 'minute';

export interface ParsedDate {
  /** Milliseconds since epoch (UTC-based "wall clock"). */
  ms: number;
  precision: DatePrecision;
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

const DATE_RE = /^(-?\d{1,6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}))?)?)?$/;

export function parseDate(input: string): ParsedDate {
  const m = DATE_RE.exec(input.trim());
  if (!m) throw new Error(`Date invalide : « ${input} »`);
  const year = Number(m[1]);
  const month = m[2] ? Number(m[2]) : 1;
  const day = m[3] ? Number(m[3]) : 1;
  const hour = m[4] ? Number(m[4]) : 0;
  const minute = m[5] ? Number(m[5]) : 0;
  if (month < 1 || month > 12) throw new Error(`Mois invalide : « ${input} »`);
  if (day < 1 || day > 31) throw new Error(`Jour invalide : « ${input} »`);
  if (hour > 23 || minute > 59) throw new Error(`Heure invalide : « ${input} »`);

  // Date.UTC maps years 0-99 to 1900-1999: set the full year explicitly.
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(hour, minute, 0, 0);
  if (d.getUTCDate() !== day) throw new Error(`Jour inexistant : « ${input} »`);

  const precision: DatePrecision = m[4] ? 'minute' : m[3] ? 'day' : m[2] ? 'month' : 'year';
  return { ms: d.getTime(), precision, year, month, day, hour, minute };
}

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

export function formatYear(year: number): string {
  return year <= 0 ? `${1 - year} av. J.-C.` : String(year);
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(p: ParsedDate): string {
  return `${pad(p.hour)} h ${pad(p.minute)}`;
}

/** « 17 décembre 1903 », « mai 1522 », « 1891 », « 14 mars 2025 ». */
export function formatDate(p: ParsedDate, short = false): string {
  const months = short ? MONTHS_SHORT : MONTHS;
  const y = formatYear(p.year);
  switch (p.precision) {
    case 'year':
      return y;
    case 'month':
      return `${months[p.month - 1]} ${y}`;
    default:
      return `${p.day === 1 ? '1er' : p.day} ${months[p.month - 1]} ${y}`;
  }
}

export function formatDateTime(p: ParsedDate): string {
  return p.precision === 'minute' ? `${formatDate(p)} · ${formatTime(p)}` : formatDate(p);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365.2425 * DAY;
const MONTH = YEAR / 12;

/** Human readable duration, at most two units: « 2 ans 3 mois », « 4 h 12 min ». */
export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  if (abs < MINUTE) return 'quelques secondes';
  if (abs < HOUR) return `${Math.round(abs / MINUTE)} min`;
  if (abs < DAY) {
    const h = Math.floor(abs / HOUR);
    const m = Math.floor((abs - h * HOUR) / MINUTE);
    return m ? `${h} h ${pad(m)}` : `${h} h`;
  }
  if (abs < MONTH) {
    const d = Math.floor(abs / DAY);
    const h = Math.floor((abs - d * DAY) / HOUR);
    const days = `${d} jour${d > 1 ? 's' : ''}`;
    return h && d < 7 ? `${days} ${h} h` : days;
  }
  if (abs < YEAR) {
    const mo = Math.floor(abs / MONTH);
    const d = Math.floor((abs - mo * MONTH) / DAY);
    return d ? `${mo} mois ${d} j` : `${mo} mois`;
  }
  const y = Math.floor(abs / YEAR);
  const mo = Math.floor((abs - y * YEAR) / MONTH);
  const years = `${y} an${y > 1 ? 's' : ''}`;
  return mo && y < 20 ? `${years} ${mo} mois` : years;
}
