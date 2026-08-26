import { encodeJpeg } from './pixels';

export function makeSampleJpeg(): Uint8Array {
  const width = 1280;
  const height = 960;
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
  return encodeJpeg({ width, height, data }, 85);
}
