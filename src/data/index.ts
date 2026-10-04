import type { Timeline } from '../domain/types';
import { affaireAzur } from './affaire-azur';
import { aviation } from './aviation';
import { magellan } from './magellan';

/** Built-in timelines, in display order. */
export const builtInTimelines: Timeline[] = [magellan, aviation, affaireAzur];
