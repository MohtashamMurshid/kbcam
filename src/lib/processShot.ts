import { drawText, measureText } from './bitmapFont';
import { formatClimateStamp, formatDateStamp } from './climateClock';
import { applyLoFi, decodeJpeg, encodeJpeg, scaleToLongEdge } from './pixels';

export const TARGET_LONG_EDGE = 400;
export const JPEG_QUALITY = 32;

const AMBER = { r: 230, g: 184, b: 76 };
const OUTLINE = { r: 8, g: 8, b: 8 };

export type ProcessShotInput = {
  jpegBytes: Uint8Array;
  capturedAtMs: number;
  deadlineMs: number;
  longEdge?: number;
  quality?: number;
  grain?: number;
};

export type ProcessShotResult = {
  jpegBytes: Uint8Array;
  width: number;
  height: number;
  bytes: number;
  dateStamp: string;
  climateStamp: string;
};

export function processShot(input: ProcessShotInput): ProcessShotResult {
  const longEdge = input.longEdge ?? TARGET_LONG_EDGE;
  const quality = input.quality ?? JPEG_QUALITY;
  const grain = input.grain ?? 28;
  const dateStamp = formatDateStamp(input.capturedAtMs);
  const climateStamp = formatClimateStamp(input.deadlineMs, input.capturedAtMs);

  const decoded = decodeJpeg(input.jpegBytes);
  const scaled = scaleToLongEdge(decoded, longEdge);
  applyLoFi(scaled, grain);
  burnStamps(scaled.data, scaled.width, scaled.height, dateStamp, climateStamp);

  const jpegBytes = encodeJpeg(scaled, quality);
  return {
    jpegBytes,
    width: scaled.width,
    height: scaled.height,
    bytes: jpegBytes.byteLength,
    dateStamp,
    climateStamp,
  };
}

function burnStamps(
  pixels: Uint8Array,
  width: number,
  height: number,
  dateStamp: string,
  climateStamp: string,
): void {
  const scale = width >= 360 ? 2 : 1;
  const pad = 6;
  const lineGap = 3;
  const lineH = measureText(dateStamp, scale).height;
  const y1 = height - pad - lineH;
  const y0 = y1 - lineGap - lineH;
  drawText(pixels, width, height, dateStamp, pad, y0, scale, AMBER, OUTLINE);
  drawText(pixels, width, height, climateStamp, pad, y1, scale, AMBER, OUTLINE);
}
