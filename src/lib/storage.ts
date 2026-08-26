import { Directory, File, Paths } from 'expo-file-system';

import { Shot } from '../types';

function rootDir(): Directory {
  return new Directory(Paths.document, 'kbcam');
}

function shotsDir(): Directory {
  return new Directory(rootDir(), 'shots');
}

function indexFile(): File {
  return new File(rootDir(), 'index.json');
}

export function ensureStore(): void {
  const root = rootDir();
  if (!root.exists) {
    root.create({ intermediates: true, idempotent: true });
  }
  const shots = shotsDir();
  if (!shots.exists) {
    shots.create({ intermediates: true, idempotent: true });
  }
}

export function listShots(): Shot[] {
  try {
    ensureStore();
  } catch {
    return [];
  }
  const file = indexFile();
  if (!file.exists) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(file.textSync());
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isShot).sort((a, b) => b.createdAtMs - a.createdAtMs);
  } catch {
    return [];
  }
}

export function saveShot(
  jpegBytes: Uint8Array,
  meta: Omit<Shot, 'id' | 'uri'>,
): Shot {
  ensureStore();
  const id = `${meta.createdAtMs}-${randomId()}`;
  const file = new File(shotsDir(), `${id}.jpg`);
  file.create({ overwrite: true });
  file.write(jpegBytes);
  const shot: Shot = {
    ...meta,
    id,
    uri: file.uri,
  };
  const next = [shot, ...listShots().filter((item) => item.id !== id)];
  writeIndex(next);
  return shot;
}

export function deleteShot(id: string): void {
  try {
    const shots = listShots();
    const match = shots.find((shot) => shot.id === id);
    if (match && match.uri.startsWith('file:')) {
      const file = new File(match.uri);
      if (file.exists) {
        file.delete();
      }
    }
    writeIndex(shots.filter((shot) => shot.id !== id));
  } catch {
    // Memory-only shots (web) have nothing on disk.
  }
}

function writeIndex(shots: Shot[]): void {
  ensureStore();
  const file = indexFile();
  if (!file.exists) {
    file.create({ overwrite: true });
  }
  file.write(JSON.stringify(shots));
}

function isShot(value: unknown): value is Shot {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const shot = value as Shot;
  return (
    typeof shot.id === 'string' &&
    typeof shot.uri === 'string' &&
    typeof shot.createdAtMs === 'number' &&
    typeof shot.bytes === 'number' &&
    typeof shot.width === 'number' &&
    typeof shot.height === 'number' &&
    typeof shot.dateStamp === 'string' &&
    typeof shot.climateStamp === 'string'
  );
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}
