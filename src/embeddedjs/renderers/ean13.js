// EAN-13: 13 digits (12 data + 1 check). Each digit = 7 modules.
// L-encoding: left half when parity = L
const L = ['0001101','0011001','0010011','0111101','0100011',
           '0110001','0101111','0111011','0110111','0001011'];
// R-encoding: right half always
const R = ['1110010','1100110','1101100','1000010','1011100',
           '1001110','1010000','1000100','1001000','1110100'];
// G-encoding = L reversed (precomputed to avoid XS chunk pressure from map/split/reverse)
const G = ['1011000','1001100','1100100','1011110','1100010',
           '1000110','1111010','1101110','1110110','1101000'];

// Parity for first digit: which encoding (L or G) for each of 6 left digits
const PARITY = [
  'LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG',
  'LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'
];

function checkDigit(digits12) {
  let odd = 0, even = 0;
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) odd += digits12[i]; else even += digits12[i];
  }
  return (10 - ((odd + even * 3) % 10)) % 10;
}

export function drawEAN13(render, data) {
  const black = render.makeColor(0, 0, 0);

  const digits = data.replace(/\D/g, '');
  if (digits.length !== 12 && digits.length !== 13) {
    render.drawText("EAN-13: need 12-13 digits", new render.Font("Gothic-Bold", 14),
      black, 4, Math.floor(render.height / 2), render.width - 8, 20, 0);
    return;
  }

  const d = digits.slice(0, 12).split('').map(Number);
  d.push(checkDigit(d));

  const firstDigit = d[0];
  const parity = PARITY[firstDigit];

  const leftBits  = parity.split('').map((p, i) => (p === 'L' ? L : G)[d[i + 1]]);
  const rightBits = d.slice(7).map(digit => R[digit]);

  const bits = '101' + leftBits.join('') + '01010' + rightBits.join('') + '101';
  // Total: 3 + 42 + 5 + 42 + 3 = 95 modules

  const barcodeH = Math.floor(render.height * 0.55);
  const barcodeY = Math.floor(render.height * 0.2);
  const moduleW  = Math.max(1, Math.floor(render.width / bits.length));
  const totalW   = moduleW * bits.length;
  let x          = Math.floor((render.width - totalW) / 2);

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      render.fillRectangle(black, x, barcodeY, moduleW, barcodeH);
    }
    x += moduleW;
  }

  // Draw digit string below barcode
  render.drawText(d.join(''), new render.Font("Gothic-Bold", 14), black,
    Math.floor((render.width - totalW) / 2), barcodeY + barcodeH + 4, totalW, 16, 0);
}
