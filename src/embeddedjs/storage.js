const STORAGE_KEY = "wallet";
const EMPTY_WALLET = { codes: [], categories: [] };

export function loadWallet() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return JSON.parse(JSON.stringify(EMPTY_WALLET));
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(EMPTY_WALLET));
  }
}

export function saveWallet(wallet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
}
