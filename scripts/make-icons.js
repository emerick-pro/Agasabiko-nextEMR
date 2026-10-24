import fs from 'node:fs';
import zlib from 'node:zlib';

function createSolidPNG(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData.writeUInt8(0, rowOffset); // filter 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Cross shape in center
      const inCrossH = Math.abs(y - height / 2) < height * 0.12 && Math.abs(x - width / 2) < width * 0.35;
      const inCrossV = Math.abs(x - width / 2) < width * 0.12 && Math.abs(y - height / 2) < height * 0.35;
      if (inCrossH || inCrossV) {
        rawData.writeUInt8(255, pxOffset);     // R
        rawData.writeUInt8(255, pxOffset + 1); // G
        rawData.writeUInt8(255, pxOffset + 2); // B
        rawData.writeUInt8(255, pxOffset + 3); // A
      } else {
        rawData.writeUInt8(r, pxOffset);
        rawData.writeUInt8(g, pxOffset + 1);
        rawData.writeUInt8(b, pxOffset + 2);
        rawData.writeUInt8(a, pxOffset + 3);
      }
    }
  }

  const idatCompressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', idatCompressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(12 + length);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);
  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeInt32BE(crc, 8 + length);
  return buffer;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
    }
  }
  return ~c;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Teal color #0891b2 -> RGB(8, 145, 178)
const p192 = createSolidPNG(192, 192, 8, 145, 178);
const p512 = createSolidPNG(512, 512, 8, 145, 178);
const touch = createSolidPNG(180, 180, 8, 145, 178);

fs.writeFileSync('public/pwa-192x192.png', p192);
fs.writeFileSync('public/pwa-512x512.png', p512);
fs.writeFileSync('public/pwa-maskable-512x512.png', p512);
fs.writeFileSync('public/apple-touch-icon.png', touch);
console.log('PNG Icons successfully created!');
