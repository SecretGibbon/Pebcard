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
  const white = render.makeColor(255, 255, 255);
  const black = render.makeColor(0, 0, 0);
  const ppm = Math.floor((Math.min(render.width, render.height) - 20) / size);
  if (ppm < 1) return;

  const w      = size * ppm;
  const stride = ((w + 31) >> 5) << 2;   // MonochromeAligned row stride (bytes)
  const view   = new Uint8Array(stride * w); // zeroed = all white

  for (let mr = 0; mr < size; mr++) {
    for (let mc = 0; mc < size; mc++) {
      const idx = mr * size + mc;
      const hc  = hex.charCodeAt((idx >> 3) * 2);
      const lc  = hex.charCodeAt((idx >> 3) * 2 + 1);
      const b   = ((hc < 58 ? hc - 48 : hc - 87) << 4) | (lc < 58 ? lc - 48 : lc - 87);
      if (!((b >> (7 - (idx & 7))) & 1)) continue;   // light module — skip

      // Dark module: stamp ppm×ppm block of 1-bits into the bitmap
      for (let pr = 0; pr < ppm; pr++) {
        const base = (mr * ppm + pr) * stride;
        for (let pc = 0; pc < ppm; pc++) {
          const col = mc * ppm + pc;
          view[base + (col >> 3)] |= 0x80 >> (col & 7);
        }
      }
    }
  }

  const bmp = new Bitmap(w, w, Bitmap.MonochromeAligned, view.buffer, 0);
  render.drawMonochrome(bmp, white, black,
    (render.width  - w) >> 1,
    (render.height - w) >> 1);
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
