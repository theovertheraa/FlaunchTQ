// wallet.js — Mock trading wallet, persisted in localStorage
// Global across all token pages

(function () {
  const KEY = "novus_wallet_v1";
  const STARTING_USDT = 10_000;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  }

  function defaultState() {
    return { v: 1, usdt: STARTING_USDT, holdings: {}, trades: [] };
  }

  let _w = load() || defaultState();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(_w)); } catch(e) {}
  }

  function getUSDTO()     { return _w.usdt; }
  function getHolding(k)  { return _w.holdings[k] || { qty: 0, avgCost: 0 }; }
  function getAllHoldings(){ return _w.holdings; }
  function getTrades()    { return _w.trades; }

  // key = TICKER_SEED (unique per token)
  function buy(key, usd, price, meta) {
    usd = Math.min(usd, _w.usdt);
    if (usd < 0.01) return { ok: false, msg: "Insufficient USDT balance" };
    const qty       = usd / price;
    const existing  = _w.holdings[key] || { qty: 0, avgCost: 0, ...meta };
    const totalQty  = existing.qty + qty;
    const avgCost   = (existing.qty * existing.avgCost + usd) / totalQty;
    _w.usdt        -= usd;
    _w.holdings[key] = { ...existing, ...meta, qty: totalQty, avgCost };
    _w.trades.unshift({ type:"buy", key, ticker: meta.ticker, usd, qty, price, ts: Date.now() });
    if (_w.trades.length > 200) _w.trades.length = 200;
    save();
    return { ok: true, qty, avgCost };
  }

  function sell(key, usdWorth, price, meta) {
    const holding = _w.holdings[key];
    if (!holding || holding.qty <= 0) return { ok: false, msg: "No holdings to sell" };
    const maxUSD  = holding.qty * price;
    usdWorth      = Math.min(usdWorth, maxUSD);
    if (usdWorth < 0.01) return { ok: false, msg: "Amount too small" };
    const qty     = usdWorth / price;
    holding.qty  -= qty;
    _w.usdt      += usdWorth;
    if (holding.qty < 0.0001) delete _w.holdings[key];
    _w.trades.unshift({ type:"sell", key, ticker: meta.ticker, usd: usdWorth, qty, price, ts: Date.now() });
    if (_w.trades.length > 200) _w.trades.length = 200;
    save();
    return { ok: true, qty, received: usdWorth };
  }

  function reset() {
    _w = defaultState();
    save();
  }

  // Portfolio value = USDT + sum(holding.qty * currentPrice)
  // currentPrice must be passed in since each token engine is separate
  function portfolioValue(prices) {
    let total = _w.usdt;
    for (const [key, h] of Object.entries(_w.holdings)) {
      const p = prices[key] || h.avgCost;
      total += h.qty * p;
    }
    return total;
  }

  window.NovusWallet = {
    getUSDTO,
    getHolding,
    getAllHoldings,
    getTrades,
    buy,
    sell,
    reset,
    portfolioValue,
    startingUSDTO: STARTING_USDT,
  };
})();
