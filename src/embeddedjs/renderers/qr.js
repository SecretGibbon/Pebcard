import Poco from "commodetto/Poco";
import Bitmap from "commodetto/Bitmap";
import qrCode from "qrcode";

export function drawQR(render, data) {
  const white = render.makeColor(255, 255, 255);
  const black = render.makeColor(0, 0, 0);
  const size = Math.min(render.width, render.height) - 20;

  const code = qrCode({ input: data, bitmap: 32, fit: size });
  const bitmap = new Bitmap(code.size, code.size, Bitmap.MonochromeAligned, code, 0);

  render.fillRectangle(white, 0, 0, render.width, render.height);
  render.drawMonochrome(
    bitmap, black, white,
    (render.width - bitmap.width) >> 1,
    (render.height - bitmap.height) >> 1
  );
}
