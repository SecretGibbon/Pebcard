import Bitmap from "commodetto/Bitmap";
import qrCode from "qrcode";

// v1 ECL-M limits — native XS qrcode module crashes on v2+
const NUMERIC_RE  = /^[0-9]*$/;
const ALPHANUM_RE = /^[0-9A-Z $%*+\-./:]*$/;

function needsV2(data) {
  if (NUMERIC_RE.test(data))  return data.length > 34;
  if (ALPHANUM_RE.test(data)) return data.length > 20;
  return data.length > 14;
}

function renderFromModules(render, size, hex) {
  const black = render.makeColor(0, 0, 0);
  const white = render.makeColor(255, 255, 255);
  const ppm = Math.floor((Math.min(render.width, render.height) - 20) / size);
  if (ppm < 1) return;
  const x0 = (render.width  - size * ppm) >> 1;
  const y0 = (render.height - size * ppm) >> 1;

  const byteLen = (size * size + 7) >> 3;
  const bytes = [];
  for (let i = 0; i < byteLen; i++) {
    const hi = hex.charCodeAt(i * 2);
    const lo = hex.charCodeAt(i * 2 + 1);
    bytes.push(((hi < 58 ? hi - 48 : hi - 87) << 4) | (lo < 58 ? lo - 48 : lo - 87));
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const bit = row * size + col;
      const dark = (bytes[bit >> 3] >> (7 - (bit & 7))) & 1;
      render.fillRectangle(dark ? black : white, x0 + col * ppm, y0 + row * ppm, ppm, ppm);
    }
  }
}

export function drawQR(render, code) {
  if (code.qrModules) {
    renderFromModules(render, code.qrModules.size, code.qrModules.hex);
    return;
  }

  // Legacy fallback: native module, v1 ECL-M only
  const data  = code.data;
  const black = render.makeColor(0, 0, 0);
  const white = render.makeColor(255, 255, 255);
  const size  = Math.min(render.width, render.height) - 20;

  if (needsV2(data)) {
    render.drawText("Re-sync from config", new render.Font("Gothic-Bold", 14), black,
      4, Math.floor(render.height / 2) - 10, render.width - 8, 18, 0);
    return;
  }

  const c = qrCode({ input: data, bitmap: 32, fit: size });
  const bmp = new Bitmap(c.size, c.size, Bitmap.MonochromeAligned, c, 0);
  render.drawMonochrome(bmp, white, black,
    (render.width - bmp.width) >> 1,
    (render.height - bmp.height) >> 1);
}
