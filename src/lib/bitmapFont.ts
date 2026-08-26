/**
 * 5×7 bitmap glyphs for the on-photo stamp.
 * Only the characters we burn in: digits, date punctuation, and CLIMATE units.
 */
const GLYPH_ROWS = 7;
const GLYPH_COLS = 5;

const GLYPHS: Record<string, readonly number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b01110, 0b10000, 0b11110, 0b10001, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110],
  '.': [0, 0, 0, 0, 0, 0b00100, 0b00100],
  ':': [0, 0b00100, 0b00100, 0, 0b00100, 0b00100, 0],
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  d: [0b00001, 0b00001, 0b01111, 0b10001, 0b10001, 0b10001, 0b01111],
  h: [0b10000, 0b10000, 0b10110, 0b11001, 0b10001, 0b10001, 0b10001],
  y: [0b10001, 0b10001, 0b10001, 0b01111, 0b00001, 0b10001, 0b01110],
};

const EMPTY_GLYPH: readonly number[] = [0, 0, 0, 0, 0, 0, 0];

export const FONT = {
  cols: GLYPH_COLS,
  rows: GLYPH_ROWS,
  tracking: 1,
} as const;

export function glyphFor(char: string): readonly number[] {
  return GLYPHS[char] ?? EMPTY_GLYPH;
}

export function measureText(text: string, scale: number): { width: number; height: number } {
  const advance = (GLYPH_COLS + FONT.tracking) * scale;
  return {
    width: Math.max(0, text.length * advance - FONT.tracking * scale),
    height: GLYPH_ROWS * scale,
  };
}

export type StampColor = { r: number; g: number; b: number };

export function drawText(
  pixels: Uint8Array,
  width: number,
  height: number,
  text: string,
  originX: number,
  originY: number,
  scale: number,
  fill: StampColor,
  outline: StampColor | null,
): void {
  const advance = (GLYPH_COLS + FONT.tracking) * scale;
  for (let i = 0; i < text.length; i += 1) {
    const glyph = glyphFor(text[i] ?? ' ');
    const gx = originX + i * advance;
    drawGlyph(pixels, width, height, glyph, gx, originY, scale, fill, outline);
  }
}

function drawGlyph(
  pixels: Uint8Array,
  width: number,
  height: number,
  glyph: readonly number[],
  originX: number,
  originY: number,
  scale: number,
  fill: StampColor,
  outline: StampColor | null,
): void {
  if (outline) {
    for (let row = 0; row < GLYPH_ROWS; row += 1) {
      const bits = glyph[row] ?? 0;
      for (let col = 0; col < GLYPH_COLS; col += 1) {
        if (((bits >> (GLYPH_COLS - 1 - col)) & 1) === 0) {
          continue;
        }
        const x = originX + col * scale;
        const y = originY + row * scale;
        fillRect(pixels, width, height, x - 1, y - 1, scale + 2, scale + 2, outline);
      }
    }
  }

  for (let row = 0; row < GLYPH_ROWS; row += 1) {
    const bits = glyph[row] ?? 0;
    for (let col = 0; col < GLYPH_COLS; col += 1) {
      if (((bits >> (GLYPH_COLS - 1 - col)) & 1) === 0) {
        continue;
      }
      const x = originX + col * scale;
      const y = originY + row * scale;
      fillRect(pixels, width, height, x, y, scale, scale, fill);
    }
  }
}

function fillRect(
  pixels: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: StampColor,
): void {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(width, x + w);
  const y1 = Math.min(height, y + h);
  for (let py = y0; py < y1; py += 1) {
    let i = (py * width + x0) * 4;
    for (let px = x0; px < x1; px += 1) {
      pixels[i] = color.r;
      pixels[i + 1] = color.g;
      pixels[i + 2] = color.b;
      pixels[i + 3] = 255;
      i += 4;
    }
  }
}
