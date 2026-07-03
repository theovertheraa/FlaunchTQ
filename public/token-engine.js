// token-engine.js — Generic price engine for any token
// State persisted to localStorage per ticker — survives page refresh
// Configure via window.AGENT_CFG before loading this script

(function () {
  const CFG        = window.AGENT_CFG || {};
  const TICKER     = CFG.ticker   || "TKN";
  const SUPPLY     = CFG.supply   || 100_000_000_000;
  const LAUNCH_MC  = CFG.launchMC || 20_000;
  const STATUS     = CFG.status   || "bonding";
  const SEED       = CFG.seed     || 42;
  const IS_NEW     = STATUS === "bonding" || STATUS === "deploying";
  const LAUNCH_PRICE = LAUNCH_MC / SUPPLY;
  const STORAGE_KEY  = "novus_v2_" + TICKER + "_" + SEED;

  const WALLETS = [
    "0x3f2a...9c1d","0xb8e4...12fa","0x91cc...4a7b","0x5d30...e8f2",
    "0xa17f...3301","0x2e9b...cc44","0x7704...8812","0xf0dd...6609",
    "0x19de...aa90","0x6fa2...3d71","0x44ab...1122","0x8bc3...55ea",
    "0xc901...77ab","0xd445...f33e","0xe120...0099","0xf882...4411",
  ];

  /* ─── LCG ─────────────────────────────────────────── */
  function lcg(seed) {
    let s = seed >>> 0;
    return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff; };
  }

  /* ─── STATE ────────────────────────────────────────── */
  let _price  = LAUNCH_PRICE;
  let _mcap   = LAUNCH_MC;
  let _simSec = 0;
  let _trades = [];
  const TF_SECS = { "1m": 60, "5m": 300, "15m": 900, "1H": 3600 };
  let _closed = { "1m":[], "5m":[], "15m":[], "1H":[] };
  let _open   = {};
  let _tickCount = 0;

  function initOpenCandles() {
    _open = {};
    for (const tf of Object.keys(TF_SECS)) {
      _open[tf] = { open: _price, high: _price, low: _price, close: _price, t: _simSec };
    }
  }

  /* ─── PERSIST ──────────────────────────────────────── */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 2,
        simSec: _simSec,
        price:  _price,
        mcap:   _mcap,
        closed: _closed,
        trades: _trades.slice(0, 40),
        savedAt: Date.now(),
      }));
    } catch(e) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || s.v !== 2) return false;
      // Discard state older than 48h
      if (Date.now() - s.savedAt > 172_800_000) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      _simSec = s.simSec || 0;
      _price  = s.price  || LAUNCH_PRICE;
      _mcap   = s.mcap   || LAUNCH_MC;
      _closed = s.closed || { "1m":[], "5m":[], "15m":[], "1H":[] };
      _trades = s.trades || [];
      initOpenCandles();
      return true;
    } catch(e) { return false; }
  }

  /* ─── AMM ──────────────────────────────────────────── */
  function applyOrder(usd, isBuy) {
    const vLiq  = Math.max(_mcap * 0.15, 200);
    const impact = usd / (vLiq + usd);
    _price = isBuy
      ? _price * (1 + impact)
      : _price * (1 - impact * 0.88);
    _price = Math.max(_price, LAUNCH_PRICE * 0.003);
    _mcap  = _price * SUPPLY;
  }

  /* ─── BOT LOGIC ────────────────────────────────────── */
  function getBuyBias(sec) {
    const m = sec / 60;
    if (m < 3)   return 0.78;
    if (m < 8)   return 0.40;
    if (m < 20)  return 0.46;
    if (m < 35)  return 0.52;
    return 0.58;
  }

  function getOrderUSD(sec) {
    const m   = sec / 60;
    const cap = m < 5 ? 2000 : m < 15 ? 800 : 400;
    const r   = Math.random();
    if (r < 0.55) return 20  + Math.random() * 180;
    if (r < 0.80) return 200 + Math.random() * 600;
    if (r < 0.95) return 800 + Math.random() * (cap - 800);
    return cap + Math.random() * cap;
  }

  /* ─── INTERNAL TICK ────────────────────────────────── */
  function _tick(simTickSecs, rngFn) {
    const rand = rngFn || Math.random.bind(Math);
    for (let s = 0; s < simTickSecs; s++) {
      _simSec++;

      // Close candles
      for (const [tf, dur] of Object.entries(TF_SECS)) {
        if (_simSec % dur === 0) {
          _closed[tf].push({ ..._open[tf] });
          // Keep max 200 candles per TF in memory
          if (_closed[tf].length > 200) _closed[tf].shift();
          _open[tf] = { open: _price, high: _price, low: _price, close: _price, t: _simSec };
        }
      }

      // 0–3 orders per sim-second
      const n = rand() < 0.38 ? 0 : Math.floor(1 + rand() * 2.5);
      for (let i = 0; i < n; i++) {
        const isBuy = rand() < getBuyBias(_simSec);
        const usd   = getOrderUSD(_simSec);
        const pBefore = _price;
        applyOrder(usd, isBuy);

        for (const tf of Object.keys(TF_SECS)) {
          const c = _open[tf];
          c.close = _price;
          c.high  = Math.max(c.high, _price);
          c.low   = Math.min(c.low,  _price);
        }

        _trades.unshift({
          isBuy, usd, qty: usd / pBefore,
          price:  _price,
          wallet: WALLETS[Math.floor(rand() * WALLETS.length)],
          simSec: _simSec,
        });
      }
      if (_trades.length > 80) _trades.length = 80;
    }
  }

  /* ─── INIT ─────────────────────────────────────────── */
  function engineInit() {
    _price  = LAUNCH_PRICE;
    _mcap   = LAUNCH_MC;
    _simSec = 0;
    _trades = [];
    _closed = { "1m":[], "5m":[], "15m":[], "1H":[] };
    initOpenCandles();

    // Try restore from localStorage first
    if (loadState()) return;

    // No saved state — fresh start
    if (!IS_NEW) {
      // Live tokens: pre-simulate 2H history deterministically
      const rng = lcg(SEED);
      _tick(7200, rng);
      _trades = []; // clear history trades, keep chart
    }
  }

  /* ─── PUBLIC TICK ──────────────────────────────────── */
  function engineTick(simTickSecs) {
    _tick(simTickSecs);
    _tickCount++;
    // Save every 10 ticks (~5s)
    if (_tickCount % 10 === 0) saveState();
  }

  /* ─── READS ────────────────────────────────────────── */
  function engineCandles(tf) {
    return [...(_closed[tf] || []), { ..._open[tf] }];
  }

  /* ─── RESET (wipes localStorage too) ──────────────── */
  function engineReset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    _price  = LAUNCH_PRICE;
    _mcap   = LAUNCH_MC;
    _simSec = 0;
    _trades = [];
    _closed = { "1m":[], "5m":[], "15m":[], "1H":[] };
    _tickCount = 0;
    initOpenCandles();
  }

  window.TokenEngine = {
    init:        engineInit,
    tick:        engineTick,
    reset:       engineReset,
    candles:     engineCandles,
    trades:      () => _trades,
    price:       () => _price,
    mc:          () => _mcap,
    simSec:      () => _simSec,
    supply:      SUPPLY,
    launchMC:    LAUNCH_MC,
    launchPrice: () => LAUNCH_PRICE,
    ticker:      TICKER,
    isNew:       IS_NEW,
  };
})();
