import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { Shot } from '../types';
import { base64ToBytes, bytesToBase64 } from './base64';
import { processShot, TARGET_LONG_EDGE } from './processShot';
import { makeSampleJpeg } from './sampleScene';
import { saveShot } from './storage';

const PRE_SCALE_EDGE = 480;

export async function developCapture(
  uri: string,
  sourceWidth: number,
  sourceHeight: number,
  capturedAtMs: number,
  deadlineMs: number,
): Promise<Shot> {
  const context = ImageManipulator.manipulate(uri);
  if (sourceHeight > sourceWidth) {
    context.resize({ height: PRE_SCALE_EDGE });
  } else {
    context.resize({ width: PRE_SCALE_EDGE });
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!saved.base64) {
    throw new Error('Could not read the capture for developing');
  }

  const processed = processShot({
    jpegBytes: base64ToBytes(saved.base64),
    capturedAtMs,
    deadlineMs,
    longEdge: TARGET_LONG_EDGE,
  });

  return persistProcessed(processed, capturedAtMs);
}

export function developSample(capturedAtMs: number, deadlineMs: number): Shot {
  const processed = processShot({
    jpegBytes: makeSampleJpeg(),
    capturedAtMs,
    deadlineMs,
    longEdge: TARGET_LONG_EDGE,
  });
  return persistProcessed(processed, capturedAtMs);
}

function persistProcessed(
  processed: ReturnType<typeof processShot>,
  createdAtMs: number,
): Shot {
  const meta = {
    createdAtMs,
    bytes: processed.bytes,
    width: processed.width,
    height: processed.height,
    dateStamp: processed.dateStamp,
    climateStamp: processed.climateStamp,
  };
  try {
    return saveShot(processed.jpegBytes, meta);
  } catch {
    return {
      ...meta,
      id: `mem-${createdAtMs}`,
      uri: `data:image/jpeg;base64,${bytesToBase64(processed.jpegBytes)}`,
    };
  }
}
