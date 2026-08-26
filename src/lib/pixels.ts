import jpeg from 'jpeg-js';

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

const LEVELS = 6;
const STEP = 255 / (LEVELS - 1);

export type RgbaImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

export function decodeJpeg(jpegBytes: Uint8Array): RgbaImage {
  const decoded = jpeg.decode(jpegBytes, {
    useTArray: true,
    formatAsRGBA: true,
  });
  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data,
  };
}

export function encodeJpeg(image: RgbaImage, quality: number): Uint8Array {
  const q = Math.round(Math.min(100, Math.max(1, quality)));
  const encoded = jpeg.encode(
    {
      data: image.data,
      width: image.width,
      height: image.height,
    },
    q,
  );
  const raw = encoded.data;
  return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
}

export function scaleToLongEdge(image: RgbaImage, longEdge: number): RgbaImage {
  const current = Math.max(image.width, image.height);
  if (current <= longEdge) {
    return image;
  }
  const scale = longEdge / current;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  return nearestNeighbor(image, width, height);
}

function nearestNeighbor(image: RgbaImage, width: number, height: number): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  const xRatio = image.width / width;
  const yRatio = image.height / height;
  for (let y = 0; y < height; y += 1) {
    const srcY = Math.min(image.height - 1, Math.floor(y * yRatio));
    for (let x = 0; x < width; x += 1) {
      const srcX = Math.min(image.width - 1, Math.floor(x * xRatio));
      const si = (srcY * image.width + srcX) * 4;
      const di = (y * width + x) * 4;
      data[di] = image.data[si] ?? 0;
      data[di + 1] = image.data[si + 1] ?? 0;
      data[di + 2] = image.data[si + 2] ?? 0;
      data[di + 3] = 255;
    }
  }
  return { width, height, data };
}

export function applyLoFi(image: RgbaImage, grain: number): void {
  const { width, height, data } = image;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const noise = (hash2(x, y) / 255 - 0.5) * grain;
      const threshold = ((BAYER8[y & 7]?.[x & 7] ?? 0) / 64 - 0.5) * STEP;
      data[i] = quantize(r + noise + threshold);
      data[i + 1] = quantize(g + noise * 0.85 + threshold);
      data[i + 2] = quantize(b + noise * 0.7 + threshold);
      data[i + 3] = 255;
    }
  }
}

function quantize(value: number): number {
  const clamped = Math.max(0, Math.min(255, value));
  return Math.round(clamped / STEP) * STEP;
}

function hash2(x: number, y: number): number {
  let n = x * 374761393 + y * 668265263;
  n = (n ^ (n >>> 13)) * 1274126177;
  return (n ^ (n >>> 16)) & 255;
}
