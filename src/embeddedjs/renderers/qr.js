import Bitmap from "commodetto/Bitmap";
import qrCode from "qrcode";

export function drawQR(render, data) {
  const black = render.makeColor(0, 0, 0);
  const white = render.makeColor(255, 255, 255);
  const size = Math.min(render.width, render.height) - 20;

  const code = qrCode({ input: data, bitmap: 32, fit: size });
  const bitmap = new Bitmap(code.size, code.size, Bitmap.MonochromeAligned, code, 0);

  render.drawMonochrome(
    bitmap, black, white,
    (render.width - bitmap.width) >> 1,
    (render.height - bitmap.height) >> 1
  );
}
