import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // CRC table for PNG chunks
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcBuf = Buffer.alloc(4 + len);
    buf.copy(crcBuf, 0, 4, 8 + len);
    buf.writeUInt32BE(crc32(crcBuf), 8 + len);
    return buf;
  }

  // Draw pixel data (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: none

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base background: Dark Slate
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Inner icon emblem: Backpack silhouette (in safe zone)
      const bpX1 = cx - 100 * scale;
      const bpX2 = cx + 100 * scale;
      const bpY1 = cy - 90 * scale;
      const bpY2 = cy + 130 * scale;

      // Outer ring
      if (Math.abs(dist - 160 * scale) < 6 * scale) {
        r = 99; g = 102; b = 241; a = 200; // Indigo
      }

      // Backpack shape
      if (x >= bpX1 && x <= bpX2 && y >= bpY1 && y <= bpY2) {
        const cornerR = 24 * scale;
        const inCorner =
          (x < bpX1 + cornerR && y < bpY1 + cornerR && Math.hypot(x - (bpX1 + cornerR), y - (bpY1 + cornerR)) > cornerR) ||
          (x > bpX2 - cornerR && y < bpY1 + cornerR && Math.hypot(x - (bpX2 - cornerR), y - (bpY1 + cornerR)) > cornerR) ||
          (x < bpX1 + cornerR && y > bpY2 - cornerR && Math.hypot(x - (bpX1 + cornerR), y - (bpY2 - cornerR)) > cornerR) ||
          (x > bpX2 - cornerR && y > bpY2 - cornerR && Math.hypot(x - (bpX2 - cornerR), y - (bpY2 - cornerR)) > cornerR);

        if (!inCorner) {
          // Backpack body gradient
          const grad = (y - bpY1) / (bpY2 - bpY1);
          r = Math.round(129 * (1 - grad) + 56 * grad);
          g = Math.round(140 * (1 - grad) + 189 * grad);
          b = Math.round(248 * (1 - grad) + 248 * grad);

          // Front pocket
          const pkX1 = cx - 65 * scale;
          const pkX2 = cx + 65 * scale;
          const pkY1 = cy + 15 * scale;
          const pkY2 = cy + 105 * scale;

          if (x >= pkX1 && x <= pkX2 && y >= pkY1 && y <= pkY2) {
            r = 15; g = 23; b = 42;
          }

          // Center checkmark badge
          const checkDist = Math.hypot(x - cx, y - (cy + 60 * scale));
          if (checkDist < 18 * scale) {
            r = 16; g = 185; b = 129; // Emerald green
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));

console.log('Successfully generated PWA icon assets in public/');
