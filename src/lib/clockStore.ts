import { File, Paths } from 'expo-file-system';

import { ClockState } from '../types';
import {
  CLIMATE_CLOCK_URL,
  FALLBACK_DEADLINE_MS,
  parseDeadlineMs,
} from './climateClock';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function cacheFile(): File {
  return new File(Paths.document, 'kbcam', 'clock-cache.json');
}

export async function loadClock(nowMs: number): Promise<ClockState> {
  const cached = readCache();
  if (cached && nowMs - cached.fetchedAtMs < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const response = await fetch(CLIMATE_CLOCK_URL);
    if (!response.ok) {
      throw new Error(`Climate Clock HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    const deadlineMs = parseDeadlineMs(payload);
    if (deadlineMs === null) {
      throw new Error('Climate Clock payload missing carbon_deadline_1');
    }
    const next: ClockState = {
      deadlineMs,
      source: 'live',
      fetchedAtMs: nowMs,
    };
    writeCache(next);
    return next;
  } catch {
    if (cached) {
      return { ...cached, source: 'cache' };
    }
    return {
      deadlineMs: FALLBACK_DEADLINE_MS,
      source: 'fallback',
      fetchedAtMs: nowMs,
    };
  }
}

function readCache(): ClockState | null {
  try {
    const file = cacheFile();
    if (!file.exists) {
      return null;
    }
    const parsed: unknown = JSON.parse(file.textSync());
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'deadlineMs' in parsed &&
      'fetchedAtMs' in parsed &&
      typeof (parsed as ClockState).deadlineMs === 'number' &&
      typeof (parsed as ClockState).fetchedAtMs === 'number'
    ) {
      const state = parsed as ClockState;
      return {
        deadlineMs: state.deadlineMs,
        source: 'cache',
        fetchedAtMs: state.fetchedAtMs,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function writeCache(state: ClockState): void {
  try {
    const dir = cacheFile().parentDirectory;
    if (!dir.exists) {
      dir.create({ intermediates: true, idempotent: true });
    }
    if (!cacheFile().exists) {
      cacheFile().create();
    }
    cacheFile().write(
      JSON.stringify({
        deadlineMs: state.deadlineMs,
        source: 'cache',
        fetchedAtMs: state.fetchedAtMs,
      }),
    );
  } catch {
    // Cache is optional. Live or fallback still works.
  }
}
