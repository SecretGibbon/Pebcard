// Code128 symbol patterns: each is 6 bar/space widths summing to 11
// Format: [bar, space, bar, space, bar, space]
// Source: ISO/IEC 15417
const PATTERNS = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,4,1],[1,2,1,4,2,1],
  [1,4,1,2,2,1],[1,2,3,2,2,1],[1,2,3,4,1,1],[1,4,3,2,1,1],[3,1,1,2,2,3],
  [3,1,1,4,2,1],[3,4,1,2,1,1],[2,2,1,3,2,1],[2,2,3,1,2,1],[2,1,3,2,2,1],
  [2,2,3,2,1,1],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,3,1,2],[1,1,3,2,2,2],
  [1,2,3,1,2,2],[1,2,3,2,1,2],[2,2,1,2,3,1],[2,2,1,3,2,1],[2,1,3,1,2,2],
  [2,2,3,1,1,2],[2,1,3,3,1,1],[2,3,3,1,1,1],[2,1,1,4,3,1],[2,1,1,2,3,3],
  [2,3,1,1,3,1],[1,1,2,4,2,1],[1,2,4,1,2,1],[1,4,2,1,2,1],[1,1,2,2,4,1],
  [1,2,2,1,4,1],[1,4,2,2,1,1],[1,2,1,2,1,4],[1,2,1,4,1,2],[1,4,1,2,1,2],
  [1,1,1,4,3,1],[1,1,3,4,1,1],[3,1,1,1,4,1],[1,1,4,1,3,1],[1,3,4,1,1,1],
  [1,1,3,1,4,1],[3,1,4,1,1,1],[3,1,1,3,1,2],[1,1,1,3,4,1],[1,1,4,3,1,1],
  [4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,1,4],[1,1,4,1,1,3],[3,1,1,1,1,4],
  [4,1,1,1,3,1],[4,1,3,1,1,1],[1,3,1,1,3,1],[1,1,4,1,3,1],[1,3,1,4,1,1],
  [1,1,1,1,4,3],[1,1,1,4,1,3],[1,3,1,1,1,4],[1,1,4,1,1,3],[4,1,1,3,1,1],
  [4,1,1,1,3,1],[1,3,4,1,1,1],[1,3,1,1,4,1],[1,1,1,4,3,1],[3,1,1,4,1,1],
  [1,1,1,3,1,4],[1,1,1,4,1,3],[1,3,1,1,1,4],[1,1,4,1,1,3],[1,1,1,1,3,4],
  [1,1,1,3,4,1],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[4,3,1,1,1,1],
  [3,1,4,1,1,1],[3,4,1,1,1,1],[1,1,1,4,1,3],[1,1,1,3,1,4],[3,1,1,1,4,1],
  [2,1,1,2,1,4],[2,1,1,4,1,2],[2,1,1,2,3,1],[2,3,1,1,2,1],[1,1,2,2,2,3],
  [1,1,2,2,4,1],[1,1,2,4,2,1],[1,1,4,2,2,1],[1,4,2,2,1,1],[1,4,2,1,1,2],
  [1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,1,1,2,2],[3,1,2,1,1,2],[3,2,1,1,2,1],
  [3,1,1,2,1,2]  // 106
];

const START_B = 104;
const STOP    = 106;

export function encode128(str) {
  const values = [START_B];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 32 || c > 127) throw new Error(`Code128B: char ${c} out of range`);
    values.push(c - 32);
  }
  let check = START_B;
  for (let i = 0; i < str.length; i++) check += (i + 1) * (str.charCodeAt(i) - 32);
  values.push(check % 103);
  values.push(STOP);
  return values;
}

export function drawCode128(render, data) {
  const white = render.makeColor(255, 255, 255);
  const black = render.makeColor(0, 0, 0);

  let symbols;
  try {
    symbols = encode128(data);
  } catch (e) {
    render.drawText("Invalid Code128", render.Font("Gothic-Bold", 14),
      black, 4, render.height / 2, render.width - 8, 20, 0);
    return;
  }

  let totalModules = symbols.reduce((sum, v) => {
    const pat = PATTERNS[v];
    return sum + pat.reduce((a, b) => a + b, 0);
  }, 0) + 2;

  const barcodeH = Math.floor(render.height * 0.6);
  const barcodeY = (render.height - barcodeH) / 2;
  const moduleW = Math.max(1, Math.floor(render.width / totalModules));
  const totalW  = moduleW * totalModules;
  let x = (render.width - totalW) / 2;

  symbols.forEach(v => {
    const pat = PATTERNS[v];
    let bar = true;
    pat.forEach(width => {
      if (bar) render.fillRectangle(black, x, barcodeY, moduleW * width, barcodeH);
      x += moduleW * width;
      bar = !bar;
    });
  });
  render.fillRectangle(black, x, barcodeY, moduleW * 2, barcodeH);
}
