import Poco from "commodetto/Poco";
import Button from "pebble/button";
import Message from "pebble/message";
import { loadWallet, saveWallet } from "storage";

const render = new Poco(screen);
const white = render.makeColor(255, 255, 255);
const black = render.makeColor(0, 0, 0);
const gray  = render.makeColor(180, 180, 180);
const blue  = render.makeColor(0, 120, 215);

// wallet shape: { codes: [...], categories: [{ id, name, codes: [...] }] }
let wallet = loadWallet();

// Navigation state
// screen: "home" | "category" | "barcode"
let state = { screen: "home", categoryId: null, scrollIndex: 0, selectedCode: null };

// Returns a flat ordered list of items for the current screen.
// Each item: { type: "code"|"folder", label: string, code?: object, categoryId?: string }
function buildList() {
  if (state.screen === "home") {
    const folders = wallet.categories.map(c => ({
      type: "folder",
      label: c.name,
      categoryId: c.id
    }));
    const rootCodes = wallet.codes.map(c => ({
      type: "code",
      label: c.name,
      code: c
    }));
    return [...folders, ...rootCodes];
  }
  if (state.screen === "category") {
    const cat = wallet.categories.find(c => c.id === state.categoryId);
    if (!cat) return [];
    return cat.codes.map(c => ({ type: "code", label: c.name, code: c }));
  }
  return [];
}

const ROW_H = 36;
const FONT_SIZE = 18;

function drawList(items) {
  const font = render.Font("Gothic-Bold", FONT_SIZE);
  render.begin();
  render.fillRectangle(white, 0, 0, render.width, render.height);

  items.forEach((item, i) => {
    const y = i * ROW_H - state.scrollIndex * ROW_H;
    if (y + ROW_H < 0 || y >= render.height) return;

    const isSelected = i === state.scrollIndex;
    if (isSelected) render.fillRectangle(blue, 0, y, render.width, ROW_H);

    const prefix = item.type === "folder" ? "> " : "  ";
    render.drawText(
      prefix + item.label,
      font,
      isSelected ? white : black,
      4, y + (ROW_H - FONT_SIZE) / 2,
      render.width - 8, FONT_SIZE,
      0  // no wrap
    );
  });

  if (items.length === 0) {
    render.drawText("No items. Configure app.", render.Font("Gothic-Bold", FONT_SIZE),
      gray, 4, render.height / 2 - 10, render.width - 8, FONT_SIZE, 0);
  }
  render.end();
}

function drawBarcode(code) {
  render.begin();
  render.fillRectangle(white, 0, 0, render.width, render.height);
  render.drawText(code.name, render.Font("Gothic-Bold", 18), black,
    4, 8, render.width - 8, 20, 0);
  render.drawText("(rendering...)", render.Font("Gothic-Bold", 14), gray,
    4, 40, render.width - 8, 18, 0);
  render.end();
}

function redraw() {
  if (state.screen === "barcode") {
    drawBarcode(state.selectedCode);
    return;
  }
  const items = buildList();
  drawList(items);
}

redraw();
