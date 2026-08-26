import { Buffer } from 'buffer';

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export function base64ToBytes(value: string): Uint8Array {
  const trimmed = value.includes(',') ? value.slice(value.indexOf(',') + 1) : value;
  const buf = Buffer.from(trimmed, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 10) {
    return `${kb.toFixed(1)} KB`;
  }
  return `${Math.round(kb)} KB`;
}
