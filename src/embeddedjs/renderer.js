import { drawQR }     from "renderers/qr";
import { drawCode128 } from "renderers/code128";
import { drawEAN13 }   from "renderers/ean13";

export function drawBarcode(render, code) {
  switch (code.format) {
    case "QR":      drawQR(render, code.data);      break;
    case "CODE128": drawCode128(render, code.data); break;
    case "EAN13":   drawEAN13(render, code.data);   break;
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
