// Generates the PWA app icons (brand-green square + white checkmark) with no
// external dependencies, using a tiny built-in PNG encoder.
// Run: node scripts/genicons.js
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function makePng(size, draw) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
const GREEN = [0, 106, 78];
const WHITE = [255, 255, 255];
function drawIcon(size) {
  const th = size * 0.075;
  const a = [0.30, 0.52], b = [0.44, 0.66], c = [0.72, 0.33];
  return (x, y) => {
    const nx = x / size, ny = y / size;
    const d1 = distSeg(nx, ny, a[0], a[1], b[0], b[1]) * size;
    const d2 = distSeg(nx, ny, b[0], b[1], c[0], c[1]) * size;
    if (d1 < th || d2 < th) return [...WHITE, 255];
    return [...GREEN, 255];
  };
}
const outDir = path.join(__dirname, "..", "frontend", "public");
for (const size of [192, 512, 180]) {
  const buf = makePng(size, drawIcon(size));
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`wrote ${name} (${buf.length} bytes)`);
}
