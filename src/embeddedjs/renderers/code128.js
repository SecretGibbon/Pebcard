// Code128-B symbol patterns: 6 bar/space widths summing to 11 each.
// Indices 0-105 are data/special symbols; index 106 is the STOP symbol.
// Source: python-barcode (ISO/IEC 15417).
const PATTERNS = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],  // 0-4
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],  // 5-9
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],  // 10-14
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],  // 15-19
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],  // 20-24
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],  // 25-29
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],  // 30-34
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],  // 35-39
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],  // 40-44
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],  // 45-49
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],  // 50-54
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],  // 55-59
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],  // 60-64
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],  // 65-69
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],  // 70-74
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],  // 75-79
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],  // 80-84
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],  // 85-89
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],  // 90-94
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],  // 95-99
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],  // 100-104
  [2,1,1,2,3,2],[2,3,3,1,1,1,2],                                            // 105 (START_C), 106 (STOP+terminator)
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
    return sum + PATTERNS[v].reduce((a, b) => a + b, 0);
  }, 0);

  const barcodeH = Math.floor(render.height * 0.6);
  const barcodeY = Math.floor((render.height - barcodeH) / 2);
  const moduleW = Math.max(1, Math.floor(render.width / totalModules));
  const totalW  = moduleW * totalModules;
  let x = Math.floor((render.width - totalW) / 2);

  symbols.forEach(v => {
    let bar = true;
    PATTERNS[v].forEach(width => {
      if (bar) render.fillRectangle(black, x, barcodeY, moduleW * width, barcodeH);
      x += moduleW * width;
      bar = !bar;
    });
  });
}
