import { drawQR } from "renderers/qr";

export function drawBarcode(render, code) {
  switch (code.format) {
    case "QR":    drawQR(render, code.data); break;
    default:
      drawUnsupported(render, code.format);
  }
}

function drawUnsupported(render, format) {
  const black = render.makeColor(0, 0, 0);
  const font = render.Font("Gothic-Bold", 18);
  render.drawText("Format", font, black, 10, render.height / 2 - 36, render.width - 20, 22, 0);
  render.drawText(format, font, black, 10, render.height / 2 - 12, render.width - 20, 22, 0);
  render.drawText("not supported", font, black, 10, render.height / 2 + 12, render.width - 20, 22, 0);
}
