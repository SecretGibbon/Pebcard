const CONFIG_BASE = "https://secretgibbon.github.io/Pebcard/config/";

Pebble.addEventListener("ready", () => {
  console.log("pkjs ready");
  const stored = localStorage.getItem("wallet");
  if (stored) {
    Pebble.sendAppMessage(
      { WALLET_JSON: stored },
      () => console.log("wallet synced on ready"),
      (e) => console.log("sync error:", e)
    );
  }
});

Pebble.addEventListener("showConfiguration", () => {
  const stored = localStorage.getItem("wallet") || '{"codes":[],"categories":[]}';
  const url = CONFIG_BASE + "?data=" + encodeURIComponent(stored);
  Pebble.openURL(url);
});

Pebble.addEventListener("webviewclosed", (e) => {
  if (!e.response || e.response === "CANCELLED") return;
  let json;
  try {
    json = decodeURIComponent(e.response);
    JSON.parse(json); // validate structure
  } catch (err) {
    console.log("bad config response:", err);
    return;
  }
  localStorage.setItem("wallet", json);
  Pebble.sendAppMessage(
    { WALLET_JSON: json },
    () => console.log("wallet sent to watch"),
    (err) => console.log("send error:", err)
  );
});
