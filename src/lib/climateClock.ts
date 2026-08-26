export const CLIMATE_CLOCK_URL = 'https://api.climateclock.world/v2/clock.json';

/** Last published 1.5°C deadline from climateclock.world if the device is offline. */
export const FALLBACK_DEADLINE_ISO = '2029-07-22T16:00:00+00:00';

export const FALLBACK_DEADLINE_MS = Date.parse(FALLBACK_DEADLINE_ISO);

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;
const MS_YEAR = 365.25 * MS_DAY;

export type ClimateClockPayload = {
  status?: string;
  data?: {
    modules?: {
      carbon_deadline_1?: {
        timestamp?: string;
      };
    };
  };
};

export function parseDeadlineMs(payload: unknown): number | null {
  if (payload === null || typeof payload !== 'object') {
    return null;
  }
  const typed = payload as ClimateClockPayload;
  const stamp = typed.data?.modules?.carbon_deadline_1?.timestamp;
  if (typeof stamp !== 'string') {
    return null;
  }
  const ms = Date.parse(stamp);
  return Number.isFinite(ms) ? ms : null;
}

export function formatDateStamp(atMs: number): string {
  const d = new Date(atMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day}  ${hh}:${mm}`;
}

export function formatClimateStamp(deadlineMs: number, nowMs: number): string {
  const remaining = Math.max(0, deadlineMs - nowMs);
  const years = Math.floor(remaining / MS_YEAR);
  const afterYears = remaining - years * MS_YEAR;
  const days = Math.floor(afterYears / MS_DAY);
  const hours = Math.floor((afterYears % MS_DAY) / MS_HOUR);
  return `CLIMATE  ${years}y ${days}d ${hours}h`;
}

export function formatCompactCountdown(deadlineMs: number, nowMs: number): string {
  const remaining = Math.max(0, deadlineMs - nowMs);
  const years = Math.floor(remaining / MS_YEAR);
  const afterYears = remaining - years * MS_YEAR;
  const days = Math.floor(afterYears / MS_DAY);
  return `${years}y ${days}d`;
}
