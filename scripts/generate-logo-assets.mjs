/**
 * Generates brand assets from public/logo-original.jpg:
 *  - logo-transparent.png  (plum backdrop removed, gold art kept, 2x padded)
 *  - favicon.png + icon-192/apple icon (gold flame on deep-purple tile)
 * Run: node scripts/generate-logo-assets.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const src = jpeg.decode(readFileSync("public/logo-original.jpg"), {
  useTArray: true,
});
const { width: W, height: H, data } = src;

// Backdrop is a plum field; sample the corners to get its exact color.
const corners = [
  [0, 0],
  [W - 1, 0],
  [0, H - 1],
  [W - 1, H - 1],
].map(([x, y]) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
});
const avg = (vals) => vals.reduce((a, b) => a + b, 0) / vals.length;
const bg = [avg(corners.map((c) => c[0])), avg(corners.map((c) => c[1])), avg(corners.map((c) => c[2]))];

const dist = (r, g, b) =>
  Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);

// 1) Find the bounding box of all gold-ish (non-backdrop) pixels.
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (dist(data[i], data[i + 1], data[i + 2]) > 60) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX <= minX) throw new Error("No foreground found");
console.log(`art bbox: ${minX},${minY} -> ${maxX},${maxY} (${maxX - minX}x${maxY - minY})`);

// 2) Crop with a margin, cut the background to transparency with a soft edge.
const M = 10;
const cw = maxX - minX + M * 2;
const ch = maxY - minY + M * 2;
const out = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const sx = minX - M + x;
    const sy = minY - M + y;
    const si = (sy * W + sx) * 4;
    const di = (y * cw + x) * 4;
    const d = dist(data[si], data[si + 1], data[si + 2]);
    const alpha = d < 30 ? 0 : d > 60 ? 255 : Math.round(((d - 30) / 30) * 255);
    out.data[di] = data[si];
    out.data[di + 1] = data[si + 1];
    out.data[di + 2] = data[si + 2];
    out.data[di + 3] = alpha;
  }
}
writeFileSync("public/logo-transparent.png", PNG.sync.write(out));

// 3) Favicons: gold flame crop centered on the deep-purple brand tile.
function tile(size) {
  const tilePng = new PNG({ width: size, height: size });
  // Draw the full transparent logo, scaled to fit with padding.
  const pad = Math.round(size * 0.14);
  const avail = size - pad * 2;
  const scale = Math.min(avail / out.width, avail / out.height);
  const dw = Math.round(out.width * scale);
  const dh = Math.round(out.height * scale);
  const ox = Math.round((size - dw) / 2);
  const oy = Math.round((size - dh) / 2);

  // Deep purple background (#241441)
  for (let i = 0; i < size * size; i++) {
    tilePng.data[i * 4] = 0x24;
    tilePng.data[i * 4 + 1] = 0x14;
    tilePng.data[i * 4 + 2] = 0x41;
    tilePng.data[i * 4 + 3] = 255;
  }
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(out.width - 1, Math.round(x / scale));
      const sy = Math.min(out.height - 1, Math.round(y / scale));
      const si = (sy * out.width + sx) * 4;
      const a = out.data[si + 3] / 255;
      if (a === 0) continue;
      const di = ((oy + y) * size + (ox + x)) * 4;
      tilePng.data[di] = Math.round(out.data[si] * a + tilePng.data[di] * (1 - a));
      tilePng.data[di + 1] = Math.round(out.data[si + 1] * a + tilePng.data[di + 1] * (1 - a));
      tilePng.data[di + 2] = Math.round(out.data[si + 2] * a + tilePng.data[di + 2] * (1 - a));
    }
  }
  return tilePng;
}

writeFileSync("src/app/icon.png", PNG.sync.write(tile(192)));
writeFileSync("src/app/apple-icon.png", PNG.sync.write(tile(180)));
if (!existsSync("src/app/favicon.ico")) {
  // Next serves app/icon.png automatically; keep an ico-free setup.
  console.log("no favicon.ico (app/icon.png will be used)");
}
console.log("wrote public/logo-transparent.png, src/app/icon.png, src/app/apple-icon.png");
