import { drawQR } from "renderers/qr";

export function drawBarcode(render, code) {
  switch (code.format) {
    case "QR":    drawQR(render, code.data); break;
    default:
      drawUnsupported(render, code.format);
  }
}

function drawUnsupported(render, format) {
  const white = render.makeColor(255, 255, 255);
  const black = render.makeColor(0, 0, 0);
  render.fillRectangle(white, 0, 0, render.width, render.height);
  render.drawText(`Format\n${format}\nnot supported`, render.Font("Gothic-Bold", 18),
    black, 10, render.height / 2 - 30, render.width - 20, 80, 0);
}
