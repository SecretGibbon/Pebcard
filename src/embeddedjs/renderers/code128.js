// Code128-B: 106 symbol patterns as a flat string (6 chars each, '1'-'4' = width).
// Symbol i -> PAT offset i*6. Avoids Array-of-Arrays to spare XS chunk memory.
// Source: ISO/IEC 15417 / python-barcode (all sums verified = 11).
const PAT =
  "212222222122222221121223121322" +  // 0-4
  "131222122213122312132212221213" +  // 5-9
  "221312231212112232122132122231" +  // 10-14
  "113222123122123221223211221132" +  // 15-19
  "221231213212223112312131311222" +  // 20-24
  "321122321221312212322112322211" +  // 25-29
  "212123212321232121111323131123" +  // 30-34
  "131321112313132113132311211313" +  // 35-39
  "231113231311112133112331132131" +  // 40-44
  "113123113321133121313121211331" +  // 45-49
  "231131213113213311213131311123" +  // 50-54
  "311321331121312113312311332111" +  // 55-59
  "314111221411431111111224111422" +  // 60-64
  "121124121421141122141221112214" +  // 65-69
  "112412122114122411142112142211" +  // 70-74
  "241211221114413111241112134111" +  // 75-79
  "111242121142121241114212124112" +  // 80-84
  "124211411212421112421211212141" +  // 85-89
  "214121412121111143111341131141" +  // 90-94
  "114113114311411113411311113141" +  // 95-99
  "114131311141411131211412211214" +  // 100-104
  "211232";                           // 105 (START_C)

// STOP symbol pattern (6 elements, sum=11); 2-module terminator drawn after.
const STOP_PAT = "233111";
const START_B = 104;
const STOP    = 106; // sentinel value pushed into symbols array

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
    render.drawText("Invalid Code128", new render.Font("Gothic-Bold", 14),
      black, 4, Math.floor(render.height / 2), render.width - 8, 20, 0);
    return;
  }

  // Sum modules without creating sub-arrays; STOP uses STOP_PAT, rest use PAT.
  let totalModules = 2; // 2-module terminator bar
  for (let i = 0; i < symbols.length; i++) {
    const isStop = symbols[i] === STOP;
    const src = isStop ? STOP_PAT : PAT;
    const base = isStop ? 0 : symbols[i] * 6;
    for (let j = 0; j < 6; j++) totalModules += src.charCodeAt(base + j) - 48;
  }

  const barcodeH = Math.floor(render.height * 0.6);
  const barcodeY = Math.floor((render.height - barcodeH) / 2);
  const moduleW  = Math.max(1, Math.floor(render.width / totalModules));
  const totalW   = moduleW * totalModules;
  let x = Math.floor((render.width - totalW) / 2);

  for (let i = 0; i < symbols.length; i++) {
    const isStop = symbols[i] === STOP;
    const src = isStop ? STOP_PAT : PAT;
    const base = isStop ? 0 : symbols[i] * 6;
    let bar = true;
    for (let j = 0; j < 6; j++) {
      const width = src.charCodeAt(base + j) - 48;
      if (bar) render.fillRectangle(black, x, barcodeY, moduleW * width, barcodeH);
      x += moduleW * width;
      bar = !bar;
    }
  }
  render.fillRectangle(black, x, barcodeY, moduleW * 2, barcodeH);
}
