import { drawQR }          from "renderers/qr";
import { drawCode128 }     from "renderers/code128";
import { drawEAN13 }       from "renderers/ean13";
import { drawUnsupported } from "renderers/unsupported";

export function drawBarcode(render, code) {
  switch (code.format) {
    case "QR":      drawQR(render, code.data, code.ecLevel); break;
    case "CODE128": drawCode128(render, code.data);      break;
    case "EAN13":   drawEAN13(render, code.data);        break;
    case "AZTEC":
    case "PDF417":  drawUnsupported(render, code.format); break;
    default:        drawUnsupported(render, code.format); break;
  }
}
