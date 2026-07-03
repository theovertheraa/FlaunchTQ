// create-agent.js — FlaunchFactory bonding curve launcher
// Creator pays gas only. No liquidity needed — buyers provide it via bonding curve.
// Requires: ethers (CDN), web3.js loaded first.

let _imageUrl = "";

function showToast(msg, type) {
  const t = document.getElementById("launchToast");
  if (!t) return;
  t.innerHTML = msg;
  t.className = "launch-toast " + type;
  t.style.display = "block";
  t.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function launchAgent() {
  const user = window.NovusAuth && window.NovusAuth.getUser();
  if (!user) { window.location.href = "/login"; return; }

  const name   = (document.getElementById("agentName")?.value   || "").trim();
  const ticker = (document.getElementById("agentTicker")?.value  || "").trim().toUpperCase();
  const desc   = (document.getElementById("agentDesc")?.value    || "").trim();

  if (!name)   { showToast("Enter agent name.", "error");   return; }
  if (!ticker) { showToast("Enter ticker symbol.", "error"); return; }

  // Ensure MetaMask is available
  if (!window.ethereum) {
    showToast("⚠️ Install <a href='https://metamask.io' target='_blank' style='color:#93c5fd'>MetaMask</a> to launch on-chain.", "error");
    return;
  }

  // Connect + switch network if needed
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await window.FlaunchWeb3.switchToCoti();
  } catch(e) {
    showToast("❌ Wallet connection rejected.", "error"); return;
  }

  const btn = document.getElementById("launchBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Launching…"; }

  showToast("⏳ Launching token to COTI Testnet… confirm in wallet.", "loading");

  try {
    const result = await window.FlaunchWeb3.launchToken({
      name,
      symbol:      ticker,
      imageUrl:    _imageUrl,
      description: desc
    });

    const tokenAddr = result.tokenAddress;
    const curveAddr = result.curveAddress;
    const txHash    = result.receipt.hash;

    // Show success
    showToast(`
      🎉 <b>${name} (${ticker})</b> is live on COTI Testnet!<br><br>
      <span style="color:#a1a1aa;font-size:11px">Token CA</span><br>
      <span style="font-size:12px;font-family:monospace;color:#e4e4e7">${tokenAddr}</span><br><br>
      <span style="color:#a1a1aa;font-size:11px">Bonding curve — graduates at 50 COTI collected</span><br><br>
      <a href="https://testnet.cotiscan.io/tx/${txHash}" target="_blank" style="color:#93c5fd;font-size:12px">View tx →</a>
    `, "success");

    if (btn) {
      btn.textContent = "✅ Launched!";
      btn.style.background = "#052e16";
      btn.style.color = "#34d399";
    }

    // Add view token button
    const onchainSlug = ticker.toLowerCase() + "-" + tokenAddr.slice(2, 8).toLowerCase();
    const linkDiv = document.createElement("div");
    linkDiv.style.cssText = "margin-top:16px;display:flex;gap:10px;flex-wrap:wrap";
    linkDiv.innerHTML = `
      <a href="/agents/${onchainSlug}" class="btn primary" style="flex:1;justify-content:center;display:flex;padding:12px;border-radius:12px;text-decoration:none;min-width:140px">
        🚀 View Token Page
      </a>
      <a href="https://testnet.cotiscan.io/address/${tokenAddr}" target="_blank"
         style="flex:1;justify-content:center;display:flex;padding:12px;border-radius:12px;text-decoration:none;border:1px solid #27272a;color:#a1a1aa;font-size:13px;min-width:140px">
        Explorer ↗
      </a>
    `;
    document.getElementById("launchToast")?.appendChild(linkDiv);

    // Hide liquidity step if visible (old UI)
    const liqStep = document.getElementById("liquidityStep");
    if (liqStep) liqStep.style.display = "none";

  } catch(err) {
    const msg = err?.reason || err?.shortMessage || err?.message || "Transaction failed";
    showToast("❌ " + msg, "error");
    if (btn) { btn.textContent = "🚀 Launch Agent"; btn.disabled = false; }
  }
}

// Boot
function _createAgentInit() {
  // Avatar upload
  const avatarFile = document.getElementById("avatarFile");
  if (avatarFile) {
    avatarFile.addEventListener("change", function() {
      const file = this.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        _imageUrl = ev.target.result;
        const img = document.getElementById("avatarImg");
        const ph  = document.getElementById("avatarPlaceholder");
        if (img) { img.src = _imageUrl; img.style.display = "block"; }
        if (ph)  ph.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  // Auto-uppercase ticker
  const tickerInput = document.getElementById("agentTicker");
  if (tickerInput) {
    tickerInput.addEventListener("input", function() { this.value = this.value.toUpperCase(); });
  }

  // Wire launch button
  document.getElementById("launchBtn")?.addEventListener("click", launchAgent);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _createAgentInit);
} else {
  _createAgentInit();
}
