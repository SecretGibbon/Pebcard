import Poco from "commodetto/Poco";
import Button from "pebble/button";
import Message from "pebble/message";
import { loadWallet, saveWallet } from "storage";
import { drawBarcode as renderCode } from "renderer";

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
  const font = new render.Font("Gothic-Bold", FONT_SIZE);
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
    render.drawText("No items. Configure app.", font,
      gray, 4, render.height / 2 - 10, render.width - 8, FONT_SIZE, 0);
  }
  render.end();
}

function drawBarcode(code) {
  const font = new render.Font("Gothic-Bold", 14);
  render.begin();
  render.fillRectangle(white, 0, 0, render.width, render.height);
  renderCode(render, code);
  render.drawText(code.name, font, black, 4, 4, render.width - 8, 16, 0);
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

new Button({
  types: ["select", "up", "down", "back"],
  onPush(down, type) {
    if (type === "back") {
      if (down) return; // fire on release to catch short press
    } else {
      if (!down) return;
    }
    handleButton(type);
  }
});

new Message({
  keys: ["WALLET_JSON"],
  onReadable() {
    const msg = this.read();
    msg.forEach((value, key) => {
      if (key !== "WALLET_JSON") return;
      try {
        wallet = JSON.parse(value);
        saveWallet(wallet);
        state = { screen: "home", categoryId: null, scrollIndex: 0, selectedCode: null };
        redraw();
      } catch (e) {
        console.log("bad wallet payload:", e.message);
      }
    });
  }
});

function handleButton(type) {
  if (state.screen === "barcode") {
    if (type === "back") {
      state.screen = state.categoryId ? "category" : "home";
      state.selectedCode = null;
      redraw();
    }
    return;
  }

  const items = buildList();
  if (type === "up") {
    state.scrollIndex = Math.max(0, state.scrollIndex - 1);
    redraw();
  } else if (type === "down") {
    state.scrollIndex = items.length > 0 ? Math.min(items.length - 1, state.scrollIndex + 1) : 0;
    redraw();
  } else if (type === "select") {
    const item = items[state.scrollIndex];
    if (!item) return;
    if (item.type === "folder") {
      state.screen = "category";
      state.categoryId = item.categoryId;
      state.scrollIndex = 0;
      redraw();
    } else if (item.type === "code") {
      state.screen = "barcode";
      state.selectedCode = item.code;
      redraw();
    }
  } else if (type === "back") {
    if (state.screen === "home") {
      application.close();
    } else if (state.screen === "category") {
      state.screen = "home";
      state.categoryId = null;
      state.scrollIndex = 0;
      redraw();
    }
  }
}
