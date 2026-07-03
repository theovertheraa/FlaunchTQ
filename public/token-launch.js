// token-launch.js — Price driven by actual buy/sell orders

const LAUNCH_PRICE   = 1.000;
const LIQUIDITY      = 50000;   // higher = less price impact per order
let   price          = LAUNCH_PRICE;
let   simRunning     = false;
let   simTimer       = null;
let   simMinute      = 0;
let   secondInMin    = 0;
let   allCandles1m   = [];
let   currentCandle  = null;
let   activeTF       = "1m";

const TICK_MS        = 500;     // 0.5s real = 1 sim second
const SECONDS_PER_M  = 12;     // 12 ticks = 1 sim minute (so 60min = 12*60 ticks = ~6min real)

/* ─── Order Engine ───────────────────────────────────── */
const WALLETS = ["0x3f2a...9c1d","0xb8e4...12fa","0x91cc...4a7b","0x5d30...e8f2",
                 "0xa17f...3301","0x2e9b...cc44","0x7704...8812","0xf0dd...6609",
                 "0x19de...aa90","0x6fa2...3d71","0x44ab...1122","0x8bc3...55ea"];

function botOrder(minute) {
  // Phase-based buy/sell pressure
  let buyBias = 0.5;
  if (minute < 5)        buyBias = 0.72;   // launch hype
  else if (minute < 15)  buyBias = 0.32;   // early sellers
  else if (minute < 30)  buyBias = 0.48;   // chop
  else if (minute < 45)  buyBias = 0.55;   // accumulation
  else                   buyBias = 0.60;   // recovery

  const isBuy   = Math.random() < buyBias;
  const sizes   = [200, 500, 1200, 3000, 8000, 20000];
  const weights = [30,  25,  20,   12,   8,    5];
  let r = Math.random() * 100, acc = 0, size = 200;
  for (let i = 0; i < sizes.length; i++) {
    acc += weights[i];
    if (r < acc) { size = sizes[i]; break; }
  }
  return {
    isBuy,
    size,
    wallet: WALLETS[Math.floor(Math.random() * WALLETS.length)],
  };
}

function applyOrder(order) {
  // Price impact = order size / liquidity (simplified AMM)
  const impact = (order.size / LIQUIDITY) * 0.012;
  const slippage = (Math.random() * 0.002);
  if (order.isBuy) {
    price *= (1 + impact + slippage);
  } else {
    price *= (1 - impact * 0.85 - slippage);
  }
  price = Math.max(price, LAUNCH_PRICE * 0.05);
  return price;
}

/* ─── Trade Feed ─────────────────────────────────────── */
let tradeLog = [];

function addTradeRow(order, price) {
  const tbody = document.getElementById("tradeFeedBody");
  if (!tbody) return;

  const row = {
    isBuy: order.isBuy,
    size:  order.size,
    price: price,
    total: (order.size * price).toFixed(2),
    wallet: order.wallet,
    ts: Date.now(),
  };
  tradeLog.unshift(row);
  if (tradeLog.length > 30) tradeLog.pop();

  const tr = document.createElement("tr");
  tr.classList.add("new-row");
  tr.innerHTML = `
    <td><span class="${order.isBuy ? "buy-tag" : "sell-tag"}">${order.isBuy ? "Buy" : "Sell"}</span></td>
    <td>$${price.toFixed(4)}</td>
    <td>${order.size.toLocaleString()} SIM</td>
    <td>$${parseFloat(row.total).toLocaleString(undefined,{maximumFractionDigits:2})}</td>
    <td class="addr">${order.wallet}</td>
    <td style="color:#52525b">just now</td>`;
  tbody.insertBefore(tr, tbody.firstChild);
  while (tbody.children.length > 20) tbody.removeChild(tbody.lastChild);
}

/* ─── Candle Builder ─────────────────────────────────── */
function startNewCandle() {
  currentCandle = { open: price, high: price, low: price, close: price, minute: simMinute };
}

function updateCurrentCandle() {
  if (!currentCandle) startNewCandle();
  currentCandle.close = price;
  currentCandle.high  = Math.max(currentCandle.high, price);
  currentCandle.low   = Math.min(currentCandle.low, price);
}

function finalizeCandle() {
  if (currentCandle) {
    allCandles1m.push({ ...currentCandle });
  }
  startNewCandle();
}

/* ─── Aggregation ────────────────────────────────────── */
function aggregate(candles, size) {
  const result = [];
  for (let i = 0; i < candles.length; i += size) {
    const g = candles.slice(i, i + size);
    if (!g.length) continue;
    result.push({
      open:   g[0].open,
      high:   Math.max(...g.map(c => c.high)),
      low:    Math.min(...g.map(c => c.low)),
      close:  g[g.length - 1].close,
      minute: g[0].minute,
    });
  }
  return result;
}

function getDisplayCandles() {
  const all = currentCandle
    ? [...allCandles1m, currentCandle]
    : allCandles1m;
  if (activeTF === "1m")  return all;
  if (activeTF === "5m")  return aggregate(all, 5);
  if (activeTF === "15m") return aggregate(all, 15);
  if (activeTF === "1H")  return aggregate(all, 60);
  return all;
}

/* ─── Canvas Chart ───────────────────────────────────── */
function initChart() {
  const canvas = document.getElementById("launchCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width  = rect.width  + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);
    draw();
  }

  window._drawChart = draw;

  function draw() {
    const { w, h } = lsz();
    const candles = getDisplayCandles();
    const PAD = { top: 16, right: 72, bottom: 32, left: 8 };
    const cw_total = w - PAD.left - PAD.right;
    const ch = h - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#050508";
    ctx.beginPath(); ctx.roundRect(0, 0, w, h, 16); ctx.fill();

    if (!candles.length) {
      ctx.fillStyle = "#3f3f46";
      ctx.font = "13px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Press Launch Token to start", w / 2, h / 2);
      return;
    }

    const n  = Math.max(candles.length, 30); // min 30 slots for breathing room
    const cw = cw_total / n;
    const candleW = Math.max(1.5, cw * 0.72);

    const allHigh = Math.max(...candles.map(c => c.high));
    const allLow  = Math.min(...candles.map(c => c.low));
    const padP    = Math.max((allHigh - allLow) * 0.1, allHigh * 0.02);
    const pMax    = allHigh + padP;
    const pMin    = Math.max(0, allLow  - padP);

    const px = i => PAD.left + (i + 0.5) * cw;
    const py = p => PAD.top  + (1 - (p - pMin) / (pMax - pMin)) * ch;

    // Grid
    for (let i = 0; i <= 5; i++) {
      const p = pMin + (i / 5) * (pMax - pMin);
      const y = py(p);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cw_total, y); ctx.stroke();
      ctx.fillStyle = "#3f3f46";
      ctx.font = "11px Inter,sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("$" + p.toFixed(p < 1 ? 4 : 3), PAD.left + cw_total + 4, y + 4);
    }

    // Candles
    candles.forEach((c, i) => {
      const isBull  = c.close >= c.open;
      const color   = isBull ? "#34d399" : "#f87171";
      const cx      = px(i);
      const bodyTop = py(Math.max(c.open, c.close));
      const bodyBot = py(Math.min(c.open, c.close));
      const bodyH   = Math.max(1, bodyBot - bodyTop);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.moveTo(cx, py(c.high));
      ctx.lineTo(cx, py(c.low));
      ctx.stroke();

      if (isBull) {
        ctx.fillStyle = color;
        ctx.fillRect(cx - candleW/2, bodyTop, candleW, bodyH);
      } else {
        ctx.fillStyle = "#050508";
        ctx.fillRect(cx - candleW/2, bodyTop, candleW, bodyH);
        ctx.strokeStyle = color;
        ctx.strokeRect(cx - candleW/2, bodyTop, candleW, bodyH);
      }
    });

    // Current price line
    const ly = py(price);
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(PAD.left, ly); ctx.lineTo(PAD.left + cw_total, ly); ctx.stroke();
    ctx.setLineDash([]);
    const priceUp = price >= LAUNCH_PRICE;
    ctx.fillStyle = priceUp ? "#34d399" : "#f87171";
    ctx.fillRect(PAD.left + cw_total + 2, ly - 9, 70, 18);
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Inter,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("$" + price.toFixed(4), PAD.left + cw_total + 5, ly + 4);

    // X labels
    const step = Math.max(1, Math.floor(candles.length / 6));
    ctx.fillStyle = "#3f3f46";
    ctx.font = "11px Inter,sans-serif";
    ctx.textAlign = "center";
    candles.forEach((c, i) => {
      if (i % step === 0 || i === candles.length - 1) {
        const m = c.minute;
        ctx.fillText(m >= 60 ? "1H" : m + "m", px(i), PAD.top + ch + 20);
      }
    });
  }

  function lsz() {
    const dpr = devicePixelRatio || 1;
    return { w: canvas.width / dpr, h: canvas.height / dpr };
  }

  window.addEventListener("resize", resize);
  resize();
}

/* ─── Stats Update ───────────────────────────────────── */
function updateStats() {
  const change = ((price - LAUNCH_PRICE) / LAUNCH_PRICE * 100).toFixed(2);
  const el = id => document.getElementById(id);
  const up = parseFloat(change) >= 0;

  if (el("statPrice"))  { el("statPrice").textContent  = "$" + price.toFixed(4); }
  if (el("statChange")) {
    el("statChange").textContent = (up ? "+" : "") + change + "%";
    el("statChange").style.color = up ? "#34d399" : "#f87171";
  }
  const all = currentCandle ? [...allCandles1m, currentCandle] : allCandles1m;
  if (all.length) {
    if (el("statHigh")) el("statHigh").textContent = "$" + Math.max(...all.map(c=>c.high)).toFixed(4);
    if (el("statLow"))  el("statLow").textContent  = "$" + Math.min(...all.map(c=>c.low)).toFixed(4);
  }
  if (el("simClock")) {
    const h = Math.floor(simMinute / 60);
    const m = simMinute % 60;
    el("simClock").textContent = h > 0 ? `${h}h ${m}m` : `${m}m ${secondInMin}s`;
  }
}

/* ─── Simulation Tick ─────────────────────────────────── */
function tick() {
  // 1–3 bot orders per tick
  const orderCount = Math.floor(1 + Math.random() * 2.5);
  for (let i = 0; i < orderCount; i++) {
    const order = botOrder(simMinute);
    applyOrder(order);
    addTradeRow(order, price);
  }

  updateCurrentCandle();
  secondInMin++;

  if (secondInMin >= SECONDS_PER_M) {
    finalizeCandle();
    secondInMin = 0;
    simMinute++;

    const clockEl = document.getElementById("simClock");
    if (clockEl) {
      clockEl.textContent = simMinute < 60 ? simMinute + "m" : "1H";
    }

    if (simMinute >= 60) {
      clearInterval(simTimer);
      simRunning = false;
      const btn = document.getElementById("simBtn");
      if (btn) { btn.textContent = "Complete"; btn.disabled = true; }
      document.getElementById("simStatus").textContent = "Done";
    }
  }

  updateStats();
  if (window._drawChart) window._drawChart();
}

/* ─── User Order ─────────────────────────────────────── */
function userOrder(isBuy) {
  if (!simRunning) return;
  const order = { isBuy, size: 5000, wallet: "0xYou....self" };
  applyOrder(order);
  addTradeRow(order, price);
  updateCurrentCandle();
  updateStats();
  if (window._drawChart) window._drawChart();
}

/* ─── Controls ────────────────────────────────────────── */
function startSim() {
  if (simRunning) return;
  simRunning = true;
  startNewCandle();
  document.getElementById("simBtn").textContent = "Running…";
  document.getElementById("simStatus").textContent = "Live";
  simTimer = setInterval(tick, TICK_MS);
}

function fastForward() {
  if (simMinute >= 60) return;
  clearInterval(simTimer);
  simRunning = false;
  const remaining = 60 - simMinute;
  for (let m = 0; m < remaining; m++) {
    const ordersPerMin = 8 + Math.floor(Math.random() * 12);
    for (let o = 0; o < ordersPerMin; o++) {
      const order = botOrder(simMinute + m);
      applyOrder(order);
      addTradeRow(order, price);
    }
    updateCurrentCandle();
    finalizeCandle();
  }
  simMinute = 60;
  secondInMin = 0;
  updateStats();
  if (window._drawChart) window._drawChart();
  document.getElementById("simBtn").textContent = "Complete";
  document.getElementById("simBtn").disabled = true;
  document.getElementById("simStatus").textContent = "Done";
  document.getElementById("simClock").textContent = "1H";
}

function resetSim() {
  clearInterval(simTimer);
  simRunning   = false;
  simMinute    = 0;
  secondInMin  = 0;
  price        = LAUNCH_PRICE;
  allCandles1m = [];
  currentCandle = null;
  activeTF     = "1m";
  document.querySelectorAll(".tf-btn").forEach(b => b.classList.toggle("active", b.dataset.tf === "1m"));
  const btn = document.getElementById("simBtn");
  btn.textContent = "🚀 Launch Token"; btn.disabled = false;
  document.getElementById("simStatus").textContent = "Ready";
  document.getElementById("simClock").textContent  = "0m";
  document.getElementById("statPrice").textContent  = "$1.0000";
  document.getElementById("statChange").textContent = "+0.00%";
  document.getElementById("statChange").style.color = "#52525b";
  document.getElementById("statHigh").textContent   = "—";
  document.getElementById("statLow").textContent    = "—";
  document.getElementById("tradeFeedBody").innerHTML = "";
  if (window._drawChart) window._drawChart();
}

function _tokenLaunchInit() {
  initChart();

  document.getElementById("simBtn")?.addEventListener("click",   startSim);
  document.getElementById("ffBtn")?.addEventListener("click",    fastForward);
  document.getElementById("resetBtn")?.addEventListener("click", resetSim);
  document.getElementById("buyBtn")?.addEventListener("click",   () => userOrder(true));
  document.getElementById("sellBtn")?.addEventListener("click",  () => userOrder(false));

  document.querySelectorAll(".tf-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTF = btn.dataset.tf;
      document.querySelectorAll(".tf-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (window._drawChart) window._drawChart();
    });
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _tokenLaunchInit);
} else {
  _tokenLaunchInit();
}