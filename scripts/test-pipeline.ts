import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { FALLBACK_DEADLINE_MS, formatClimateStamp, formatDateStamp, parseDeadlineMs } from '../src/lib/climateClock';
import { encodeJpeg } from '../src/lib/pixels';
import { processShot, TARGET_LONG_EDGE } from '../src/lib/processShot';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function makeScene(width: number, height: number): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const sky = y < height * 0.42;
      data[i] = sky ? 70 + (x % 40) : 110 + ((x + y) % 50);
      data[i + 1] = sky ? 120 + (y % 30) : 90 + (y % 40);
      data[i + 2] = sky ? 180 : 55 + (x % 25);
      data[i + 3] = 255;
    }
  }
  return data;
}

const capturedAtMs = Date.parse('2026-08-26T15:04:00-04:00');
const source = encodeJpeg({ width: 1280, height: 960, data: makeScene(1280, 960) }, 85);
const result = processShot({
  jpegBytes: source,
  capturedAtMs,
  deadlineMs: FALLBACK_DEADLINE_MS,
});

assert(Math.max(result.width, result.height) === TARGET_LONG_EDGE, 'long edge should be 400');
assert(result.bytes > 4_000, `JPEG too small: ${result.bytes}`);
assert(result.bytes < 80_000, `JPEG too large: ${result.bytes}`);
assert(result.dateStamp === formatDateStamp(capturedAtMs), 'date stamp mismatch');
assert(result.climateStamp === formatClimateStamp(FALLBACK_DEADLINE_MS, capturedAtMs), 'climate stamp mismatch');
assert(parseDeadlineMs({ data: { modules: { carbon_deadline_1: { timestamp: '2029-07-22T16:00:00+00:00' } } } }) === FALLBACK_DEADLINE_MS, 'parser failed');
assert(parseDeadlineMs({}) === null, 'parser should reject empty payloads');

const out = join(process.cwd(), 'scripts', 'sample-shot.jpg');
writeFileSync(out, result.jpegBytes);

const kb = (result.bytes / 1024).toFixed(1);
console.log(`ok  ${result.width}x${result.height}  ${result.bytes} bytes (${kb} KB)`);
console.log(`    ${result.dateStamp}`);
console.log(`    ${result.climateStamp}`);
console.log(`    wrote ${out}`);
