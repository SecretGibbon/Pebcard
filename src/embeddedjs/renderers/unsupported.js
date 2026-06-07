export function drawUnsupported(render, format) {
  const black = render.makeColor(0, 0, 0);
  const font = render.Font("Gothic-Bold", 18);
  render.drawText(format, font, black,
    4, Math.floor(render.height / 2) - 22, render.width - 8, 22, 0);
  render.drawText("not yet supported", render.Font("Gothic-Bold", 14), black,
    4, Math.floor(render.height / 2) + 4, render.width - 8, 18, 0);
}
