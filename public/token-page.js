// token-page.js — Chart + Feed + Bottom Sheet Trading
// Requires: token-engine.js, wallet.js

const E   = window.TokenEngine;
const W   = window.NovusWallet;
const CFG = window.AGENT_CFG || {};

const TOKEN_KEY   = CFG.ticker + "_" + CFG.seed;
let activeTF      = E.isNew ? "1m" : "1H";
let _lastTradeLen = 0;
let _sheetMode    = "buy"; // "buy" | "sell"

const TICK_REAL_MS  = 500;
const TICK_SIM_SECS = 3;

/* ─── FORMAT ────────────────────────────────────────── */
function fmtPrice(p) {
  if (!p || p === 0)  return "—";
  if (p < 0.000001)  return "$" + p.toExponential(2);
  if (p < 0.0001)    return "$" + p.toFixed(8);
  if (p < 0.01)      return "$" + p.toFixed(6);
  if (p < 1)         return "$" + p.toFixed(4);
  if (p < 1000)      return "$" + p.toFixed(2);
  return "$" + (p / 1000).toFixed(1) + "K";
}
function fmtNum(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(2);
}
function fmtUSD(n) {
  return "$" + parseFloat(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── CHART ─────────────────────────────────────────── */
function initChart() {
  const canvas = document.getElementById("tokenCanvas");
  if (!canvas) return;
  function resize() {
    const dpr  = devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width  = rect.width  + "px";
    canvas.style.height = rect.height + "px";
    canvas.getContext("2d").scale(dpr, dpr);
    drawChart();
  }
  window.addEventListener("resize", resize);
  resize();
}

function drawChart() {
  const canvas = document.getElementById("tokenCanvas");
  if (!canvas) return;
  const ctx  = canvas.getContext("2d");
  const dpr  = devicePixelRatio || 1;
  const W    = canvas.width / dpr;
  const H    = canvas.height / dpr;
  const all  = E.candles(activeTF);
  const view = all.slice(-80);
  const n    = view.length;

  const PAD = { top: 14, right: 82, bottom: 32, left: 6 };
  const CW  = W - PAD.left - PAD.right;
  const CH  = H - PAD.top  - PAD.bottom;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#050508";
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 16); ctx.fill();

  if (n < 2) {
    ctx.fillStyle = "#27272a"; ctx.font = "12px Inter,sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Building chart…", W / 2, H / 2);
    return;
  }

  const TOTAL = E.isNew ? Math.max(n + Math.ceil(n * 0.3), 24) : n;
  const cw    = CW / TOTAL;
  const bw    = Math.max(1.5, cw * 0.72);

  const allH  = Math.max(...view.map(c => c.high));
  const allL  = Math.min(...view.map(c => c.low));
  const pPad  = Math.max((allH - allL) * 0.1, allH * 0.03);
  const pMax  = allH + pPad;
  const pMin  = Math.max(0, allL - pPad);

  const px = i => PAD.left + (i + 0.5) * cw;
  const py = p => PAD.top  + (1 - (p - pMin) / (pMax - pMin)) * CH;

  // Grid
  for (let i = 0; i <= 5; i++) {
    const p = pMin + (i / 5) * (pMax - pMin);
    const y = py(p);
    ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + CW, y); ctx.stroke();
    ctx.fillStyle = "#3f3f46"; ctx.font = "10px Inter,sans-serif"; ctx.textAlign = "left";
    ctx.fillText(fmtPrice(p), PAD.left + CW + 4, y + 4);
  }

  // Future zone for new tokens
  if (E.isNew) {
    const fx = PAD.left + n * cw;
    ctx.fillStyle = "rgba(255,255,255,0.01)";
    ctx.fillRect(fx, PAD.top, PAD.left + CW - fx, CH);
    ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.moveTo(fx, PAD.top); ctx.lineTo(fx, PAD.top + CH); ctx.stroke(); ctx.setLineDash([]);
  }

  // Launch price
  const lp = E.launchPrice();
  if (pMin <= lp && lp <= pMax) {
    ctx.beginPath(); ctx.strokeStyle = "rgba(252,211,77,0.15)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.moveTo(PAD.left, py(lp)); ctx.lineTo(PAD.left + CW, py(lp)); ctx.stroke(); ctx.setLineDash([]);
  }

  // Candles
  view.forEach((c, i) => {
    const bull  = c.close >= c.open;
    const color = bull ? "#34d399" : "#f87171";
    const cx    = px(i);
    const bTop  = py(Math.max(c.open, c.close));
    const bBot  = py(Math.min(c.open, c.close));
    const bH    = Math.max(1, bBot - bTop);
    ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.moveTo(cx, py(c.high)); ctx.lineTo(cx, py(c.low)); ctx.stroke();
    if (bull) {
      ctx.fillStyle = color; ctx.fillRect(cx - bw/2, bTop, bw, bH);
    } else {
      ctx.fillStyle = "#050508"; ctx.fillRect(cx - bw/2, bTop, bw, bH);
      ctx.strokeStyle = color; ctx.strokeRect(cx - bw/2, bTop, bw, bH);
    }
  });

  // Current price line
  const curP = E.price();
  const cly  = py(curP);
  const up   = curP >= lp;
  ctx.beginPath();
  ctx.strokeStyle = up ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)";
  ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.moveTo(PAD.left, cly); ctx.lineTo(PAD.left + CW, cly); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = up ? "#34d399" : "#f87171";
  ctx.fillRect(PAD.left + CW + 2, cly - 9, 80, 18);
  ctx.fillStyle = "#000"; ctx.font = "bold 9px Inter,sans-serif"; ctx.textAlign = "left";
  ctx.fillText(fmtPrice(curP), PAD.left + CW + 5, cly + 4);

  // X labels
  const step = Math.max(1, Math.floor(n / 7));
  ctx.fillStyle = "#3f3f46"; ctx.font = "10px Inter,sans-serif"; ctx.textAlign = "center";
  view.forEach((_, i) => {
    if (i % step === 0 || i === n - 1) {
      const mul = activeTF === "1m" ? 60 : activeTF === "5m" ? 300 : activeTF === "15m" ? 900 : 3600;
      const s   = (i + 1) * mul;
      const lbl = s < 60 ? s + "s" : s < 3600 ? Math.floor(s/60) + "m" : Math.floor(s/3600) + "h";
      ctx.fillText(lbl, px(i), PAD.top + CH + 20);
    }
  });

  // Header stats
  const change = ((curP - lp) / lp * 100);
  const qs = id => document.getElementById(id);
  if (qs("livePrice"))  qs("livePrice").textContent  = fmtPrice(curP);
  if (qs("liveChange")) {
    qs("liveChange").textContent = (change >= 0 ? "+" : "") + change.toFixed(2) + "%";
    qs("liveChange").style.color = change >= 0 ? "#34d399" : "#f87171";
  }
  if (qs("liveMC")) {
    const mc = E.mc();
    qs("liveMC").textContent = mc >= 1e6 ? "$" + (mc/1e6).toFixed(2) + "M"
      : mc >= 1e3 ? "$" + (mc/1e3).toFixed(1) + "K" : "$" + mc.toFixed(0);
  }
  if (qs("simTime")) {
    const s = E.simSec();
    qs("simTime").textContent = s < 60 ? s + "s"
      : s < 3600 ? Math.floor(s/60) + "m " + (s%60) + "s"
      : Math.floor(s/3600) + "h " + Math.floor((s%3600)/60) + "m";
  }
  refreshSheet();
}

/* ─── TRADE FEED ─────────────────────────────────────── */
function updateFeed() {
  const trades = E.trades();
  if (trades.length === _lastTradeLen) return;
  _lastTradeLen = trades.length;
  const tbody = document.getElementById("tradeFeedBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  trades.slice(0, 25).forEach((t, i) => {
    const tr = document.createElement("tr");
    if (i === 0) tr.classList.add("new-row");
    const secAgo  = Math.max(0, E.simSec() - t.simSec);
    const timeStr = secAgo < 60 ? secAgo + "s" : Math.floor(secAgo/60) + "m";
    tr.innerHTML = `
      <td><span class="${t.isBuy ? "buy-tag" : "sell-tag"}">${t.isBuy ? "Buy" : "Sell"}</span></td>
      <td>${fmtPrice(t.price)}</td>
      <td>${fmtNum(t.qty)} ${E.ticker}</td>
      <td>${fmtUSD(t.usd)}</td>
      <td class="addr">${t.wallet}</td>
      <td style="color:#52525b">${timeStr} ago</td>`;
    tbody.appendChild(tr);
  });
}

/* ─── BOTTOM SHEET ───────────────────────────────────── */
function openSheet(mode) {
  _sheetMode = mode;
  document.getElementById("tradeSheet").classList.add("open");
  document.getElementById("sheetOverlay").classList.add("open");
  setSheetTab(mode);
  refreshSheet();
  document.getElementById(_sheetMode === "buy" ? "sheetAmt" : "sheetAmt").value = "";
  document.getElementById("sheetEst").textContent = "";
}

function closeSheet() {
  document.getElementById("tradeSheet").classList.remove("open");
  document.getElementById("sheetOverlay").classList.remove("open");
}

function setSheetTab(mode) {
  _sheetMode = mode;
  document.getElementById("tabBuy").classList.toggle("active", mode === "buy");
  document.getElementById("tabSell").classList.toggle("active", mode === "sell");
  const btn = document.getElementById("sheetExecBtn");
  if (mode === "buy") {
    btn.textContent = "Buy " + E.ticker;
    btn.className   = "trade-exec-btn buy";
    document.getElementById("sheetLabel").textContent = "Amount (COTI)";
    document.getElementById("sheetAmt").placeholder   = "COTI to spend";
  } else {
    btn.textContent = "Sell " + E.ticker;
    btn.className   = "trade-exec-btn sell";
    document.getElementById("sheetLabel").textContent = "Amount (" + E.ticker + ")";
    document.getElementById("sheetAmt").placeholder   = E.ticker + " to sell";
  }
  document.getElementById("sheetAmt").value = "";
  document.getElementById("sheetEst").textContent = "";
  refreshSheet();
}

function refreshSheet() {
  const price   = E.price();
  const balance = W.getCOTI();
  const holding = W.getHolding(TOKEN_KEY);
  const holdVal = holding.qty * price;
  const pnl     = holding.qty > 0 ? ((price - holding.avgCost) / holding.avgCost * 100) : null;

  const qs = id => document.getElementById(id);
  if (qs("sheetBalance")) {
    if (_sheetMode === "buy") {
      qs("sheetBalance").innerHTML = `Balance: <span>${fmtUSD(balance)}</span>`;
    } else {
      qs("sheetBalance").innerHTML = `Holding: <span>${fmtNum(holding.qty)} ${E.ticker} (${fmtUSD(holdVal)})</span>`;
    }
  }
  if (qs("sheetPnl")) {
    qs("sheetPnl").textContent = pnl !== null
      ? (pnl >= 0 ? "+" : "") + pnl.toFixed(2) + "% P&L"
      : "No position";
    qs("sheetPnl").style.color = pnl !== null ? (pnl >= 0 ? "#34d399" : "#f87171") : "#3f3f46";
  }
  // Live estimate
  const amt = parseFloat(qs("sheetAmt")?.value || 0);
  if (qs("sheetEst") && amt > 0) {
    if (_sheetMode === "buy") {
      qs("sheetEst").textContent = "≈ " + fmtNum(amt / price) + " " + E.ticker;
    } else {
      qs("sheetEst").textContent = "≈ " + fmtUSD(amt * price);
    }
  }
}

function execTrade() {
  const amt = parseFloat(document.getElementById("sheetAmt")?.value || 0);
  if (!amt || amt <= 0) return flash("sheetExecBtn", "Enter amount");

  // Route to on-chain or mock based on wallet + contract availability
  execTradeOnChain(amt);
}

/* ─── HYBRID EXEC (real on-chain if wallet + contract, else mock) ──── */
async function execTradeOnChain(amt) {
  const contractAddr = CFG.contractAddress;
  const user         = window.NovusAuth && window.NovusAuth.getUser();
  const hasWallet    = user && user.type === "wallet" && window.ethereum;

  if (!hasWallet || !contractAddr || !window.FlaunchWeb3 || !window.ethers) {
    // Fallback to mock
    execTradeMock(amt);
    return;
  }

  const btn = document.getElementById("sheetExecBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Confirm in wallet…"; }

  try {
    if (_sheetMode === "buy") {
      const ethAmt = ethers.parseEther(String(amt));
      await FlaunchWeb3.buyToken(contractAddr, ethAmt);
      showToast("✅ Bought " + E.ticker + " on-chain for " + amt + " COTI");
    } else {
      const tokenAmt = ethers.parseUnits(String(amt), 18);
      await FlaunchWeb3.sellToken(contractAddr, tokenAmt);
      showToast("✅ Sold " + fmtNum(amt) + " " + E.ticker + " on-chain");
    }
    document.getElementById("sheetAmt").value = "";
    document.getElementById("sheetEst").textContent = "";
    refreshSheet();
    drawChart();
    setTimeout(closeSheet, 800);
  } catch(err) {
    showToast("❌ " + (err.reason || err.message || "Transaction failed"));
  } finally {
    if (btn) { btn.disabled = false; }
    setSheetTab(_sheetMode);
  }
}

function execTradeMock(amt) {
  if (_sheetMode === "buy") {
    const result = W.buy(TOKEN_KEY, amt, E.price(), {
      ticker: E.ticker, name: CFG.name || E.ticker, color: CFG.color, slug: CFG.slug
    });
    if (!result.ok) return flash("sheetExecBtn", result.msg);
    showToast("✅ Bought " + fmtNum(result.qty) + " " + E.ticker + " for " + fmtUSD(amt));
  } else {
    const usdWorth = amt * E.price();
    const result   = W.sell(TOKEN_KEY, usdWorth, E.price(), {
      ticker: E.ticker, name: CFG.name || E.ticker, color: CFG.color, slug: CFG.slug
    });
    if (!result.ok) return flash("sheetExecBtn", result.msg);
    showToast("✅ Sold " + fmtNum(amt) + " " + E.ticker + " for " + fmtUSD(result.received));
  }
  document.getElementById("sheetAmt").value = "";
  document.getElementById("sheetEst").textContent = "";
  refreshSheet();
  drawChart();
  setTimeout(closeSheet, 800);
}

function flash(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const orig = el.textContent;
  el.textContent = msg; el.style.opacity = "0.6";
  setTimeout(() => { el.textContent = orig; el.style.opacity = "1"; }, 1800);
}

function showToast(msg) {
  let t = document.getElementById("tradeToast");
  if (!t) {
    t = document.createElement("div"); t.id = "tradeToast";
    t.style.cssText = "position:fixed;bottom:130px;left:50%;transform:translateX(-50%);background:#0d0d0f;border:1px solid rgba(255,255,255,.12);color:#f5f5f5;padding:12px 24px;border-radius:999px;font-size:13px;font-weight:500;z-index:200;transition:opacity .3s;white-space:nowrap";
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = "0", 2400);
}

/* ─── BOOT ───────────────────────────────────────────── */
function _tokenPageInit() {
  E.init();
  initChart();
  drawChart();
  updateFeed();
  refreshSheet();

  // TF buttons
  document.querySelectorAll(".tf-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tf === activeTF));
  document.querySelectorAll(".tf-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTF = btn.dataset.tf;
      document.querySelectorAll(".tf-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      drawChart();
    });
  });

  // Float bar
  document.getElementById("floatBuyBtn")?.addEventListener("click",  () => openSheet("buy"));
  document.getElementById("floatSellBtn")?.addEventListener("click", () => openSheet("sell"));

  // Sheet tabs
  document.getElementById("tabBuy")?.addEventListener("click",  () => setSheetTab("buy"));
  document.getElementById("tabSell")?.addEventListener("click", () => setSheetTab("sell"));

  // Close sheet
  document.getElementById("sheetOverlay")?.addEventListener("click", closeSheet);
  document.getElementById("sheetClose")?.addEventListener("click",   closeSheet);

  // Execute
  document.getElementById("sheetExecBtn")?.addEventListener("click", () => {
    const amt = parseFloat(document.getElementById("sheetAmt")?.value || 0);
    if (!amt || amt <= 0) return flash("sheetExecBtn", "Enter amount");
    execTradeOnChain(amt);
  });

  // Live estimate
  document.getElementById("sheetAmt")?.addEventListener("input", refreshSheet);

  // % presets
  document.querySelectorAll("[data-pct]").forEach(btn => {
    btn.addEventListener("click", () => {
      const pct = parseFloat(btn.dataset.pct) / 100;
      const el  = document.getElementById("sheetAmt");
      if (!el) return;
      if (_sheetMode === "buy") {
        el.value = (W.getCOTI() * pct).toFixed(2);
      } else {
        el.value = (W.getHolding(TOKEN_KEY).qty * pct).toFixed(4);
      }
      refreshSheet();
    });
  });

  // Auto-tick
  setInterval(() => {
    E.tick(TICK_SIM_SECS);
    drawChart();
    updateFeed();
  }, TICK_REAL_MS);
}
// Boot immediately if DOM ready, else wait
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _tokenPageInit);
} else {
  _tokenPageInit();
}
