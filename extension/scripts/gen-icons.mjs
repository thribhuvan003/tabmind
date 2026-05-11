// Generates icon16.png, icon48.png, icon128.png — pure Node, no deps.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
}

function makePng(size) {
  // RGBA pixels — purple gradient with rounded corners
  const raw = Buffer.alloc(size * size * 4);
  const r0 = 0.22; // corner radius as fraction
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * (size - 1));
      const r = Math.round(139 - 60 * t); // #8b → #53
      const g = Math.round(92 - 60 * t);  // #5c → #20
      const b = Math.round(246 - 103 * t);// #f6 → #8f
      // rounded rect mask
      const cx = (size - 1) / 2, cy = (size - 1) / 2;
      const rx = cx * (1 - r0), ry = cy * (1 - r0);
      const dx = Math.max(0, Math.abs(x - cx) - rx);
      const dy = Math.max(0, Math.abs(y - cy) - ry);
      const dist = Math.hypot(dx, dy);
      const a = dist === 0 ? 255 : Math.max(0, Math.min(255, Math.round(255 * (1 - dist / (size * 0.03)))));
      const i = (y * size + x) * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }
  // PNG filter byte (0 = None) per row
  const filtered = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    filtered[y * (size * 4 + 1)] = 0;
    raw.copy(filtered, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = deflateSync(filtered);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

mkdirSync("public/icons", { recursive: true });
for (const size of [16, 48, 128]) {
  const path = `public/icons/icon${size}.png`;
  writeFileSync(path, makePng(size));
  console.log(`  wrote ${path}`);
}
