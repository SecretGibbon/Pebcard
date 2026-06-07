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

function redraw() {
  // placeholder — implemented in Task 3
}

redraw();
