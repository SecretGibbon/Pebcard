import Bitmap from "commodetto/Bitmap";
import qrCode from "qrcode";

export function drawQR(render, data, ecLevel) {
  const black = render.makeColor(0, 0, 0);
  const white = render.makeColor(255, 255, 255);
  const size = Math.min(render.width, render.height) - 20;

  const opts = { input: data, bitmap: 32, fit: size };
  if (ecLevel) opts.errorCorrectionLevel = ecLevel;
  const code = qrCode(opts);
  const bitmap = new Bitmap(code.size, code.size, Bitmap.MonochromeAligned, code, 0);

  render.drawMonochrome(
    bitmap, white, black,
    (render.width - bitmap.width) >> 1,
    (render.height - bitmap.height) >> 1
  );
}
