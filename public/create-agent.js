// create-agent.js — Deploy + liquidity logic for Create Agent page
// Requires: ethers (CDN), web3.js, auth.js loaded first

let _imageUrl = "";
let _deployedTokenAddr = "";
let _deployedTicker    = "";

function showToast(msg, type) {
  const t = document.getElementById("launchToast");
  if (!t) return;
  t.innerHTML = msg;
  t.className = "launch-toast " + type;
  t.style.display = "block";
  t.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function connectWalletForDeploy() {
  if (!window.ethereum) { showToast("Install MetaMask to connect a wallet.", "error"); return; }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const address  = accounts[0];
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x6C0360" }] });
    } catch(se) {
      if (se.code === 4902) await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x6C0360", chainName: "COTI Testnet", nativeCurrency: { name: "COTI", symbol: "COTI", decimals: 18 }, rpcUrls: ["https://testnet.coti.io/rpc"], blockExplorerUrls: ["https://testnet.cotiscan.io"] }] });
    }
    const user    = window.NovusAuth && window.NovusAuth.getUser();
    const updated = { ...(user || {}), type: "wallet", address };
    if (window.NovusAuth) window.NovusAuth.setUser(updated);
    const ws = document.getElementById("walletStatus");
    if (ws) { ws.textContent = address.slice(0,6) + "..." + address.slice(-4) + " — COTI Testnet"; ws.style.color = "#34d399"; }
    showToast("✅ Wallet connected!", "success");
  } catch(e) {
    showToast("Wallet connection cancelled.", "error");
  }
}

async function launchAgent() {
  const user = window.NovusAuth && window.NovusAuth.getUser();
  if (!user) { window.location.href = "/login"; return; }

  const name   = (document.getElementById("agentName")?.value || "").trim();
  const ticker = (document.getElementById("agentTicker")?.value || "").trim().toUpperCase();
  const supply = (document.getElementById("agentSupply")?.value || "100000000000").trim();
  const desc   = (document.getElementById("agentDesc")?.value || "").trim();

  if (!name)   { showToast("Enter agent name.", "error"); return; }
  if (!ticker) { showToast("Enter ticker symbol.", "error"); return; }

  if (user.type !== "wallet" || !window.ethereum) {
    if (!window.ethereum) {
      showToast("⚠️ No wallet detected. Install <a href='https://metamask.io' target='_blank' style='color:#93c5fd'>MetaMask</a> to deploy on-chain.", "error");
      return;
    }
    showToast("🔗 Connecting wallet to deploy…", "loading");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address  = accounts[0];
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x6C0360" }] });
      } catch(se) {
        if (se.code === 4902) await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x6C0360", chainName: "COTI Testnet", nativeCurrency: { name: "COTI", symbol: "COTI", decimals: 18 }, rpcUrls: ["https://testnet.coti.io/rpc"], blockExplorerUrls: ["https://testnet.cotiscan.io"] }] });
      }
      const updated = { ...user, type: "wallet", address };
      if (window.NovusAuth) window.NovusAuth.setUser(updated);
      const ws = document.getElementById("walletStatus");
      if (ws) { ws.textContent = address.slice(0,6) + "..." + address.slice(-4) + " — COTI Testnet"; ws.style.color = "#34d399"; }
      showToast("✅ Wallet connected! Deploying…", "success");
    } catch(e) {
      showToast("❌ Wallet connection rejected.", "error"); return;
    }
  }

  const btn = document.getElementById("launchBtn");
  if (btn) { btn.disabled = true; btn.textContent = "Deploying…"; }
  showToast("⏳ Step 1/2 — Deploying token to COTI Testnet… confirm in wallet.", "loading");

  try {
    const result = await window.FlaunchWeb3.launchToken({ name, symbol: ticker, supply, imageUrl: _imageUrl, description: desc });
    const tokenAddr    = result.tokenAddress;
    _deployedTokenAddr = tokenAddr;
    _deployedTicker    = ticker;

    showToast(`✅ Token deployed! <span style="color:#a1a1aa;font-size:12px">${tokenAddr}</span><br>
      <a href="https://testnet.cotiscan.io/tx/${result.receipt.hash}" target="_blank" style="color:#93c5fd;font-size:12px">View tx →</a><br><br>
      <b>Step 2:</b> Add initial liquidity to enable trading.`, "success");

    const liqStep = document.getElementById("liquidityStep");
    const liqAddr = document.getElementById("liquidityTokenAddr");
    if (liqStep) liqStep.style.display = "block";
    if (liqAddr) liqAddr.textContent = tokenAddr;
    if (btn) { btn.textContent = "✅ Token Deployed"; btn.style.background = "#052e16"; btn.style.color = "#34d399"; }
  } catch(err) {
    showToast("❌ " + (err.reason || err.message || "Transaction failed"), "error");
    if (btn) { btn.textContent = "🚀 Launch Agent"; btn.disabled = false; }
  }
}

async function addLiquidity() {
  if (!_deployedTokenAddr) { showToast("Deploy a token first.", "error"); return; }
  const cotiAmt = parseFloat(document.getElementById("liquidityCoti")?.value || "0");
  if (!cotiAmt || cotiAmt <= 0) { showToast("Enter COTI amount for liquidity.", "error"); return; }

  const liqBtn = document.getElementById("liqBtn");
  if (liqBtn) { liqBtn.disabled = true; liqBtn.textContent = "Adding liquidity…"; }
  showToast("⏳ Step 2/2 — Adding liquidity… approve 2 txns in wallet.", "loading");

  try {
    const supply    = document.getElementById("agentSupply")?.value || "100000000000";
    const supplyBig = BigInt(supply) * 10n ** 18n;
    const tokenAmt  = supplyBig / 2n;
    const cotiWei   = ethers.parseEther(String(cotiAmt));

    await window.FlaunchWeb3.addLiquidity(_deployedTokenAddr, tokenAmt, cotiWei);

    const onchainSlug = _deployedTicker.toLowerCase() + "-" + _deployedTokenAddr.slice(2, 8).toLowerCase();
    showToast(`🎉 Liquidity added! Your agent token is now live.<br>
      <a href="/agents/${onchainSlug}" style="color:#6ee7b7;font-weight:600;font-size:13px">View Token Page →</a>
      &nbsp;&nbsp;
      <a href="https://testnet.cotiscan.io/address/${_deployedTokenAddr}" target="_blank" style="color:#93c5fd;font-size:12px">Explorer ↗</a>`, "success");

    if (liqBtn) { liqBtn.textContent = "✅ Live!"; liqBtn.style.background = "#052e16"; liqBtn.style.color = "#34d399"; }

    const linkDiv = document.createElement("div");
    linkDiv.style.cssText = "margin-top:12px;text-align:center";
    linkDiv.innerHTML = `<a href="/agents/${onchainSlug}" class="btn primary" style="width:100%;justify-content:center;display:flex;padding:12px;border-radius:12px;text-decoration:none">🚀 View Token Page</a>`;
    document.getElementById("liquidityStep")?.appendChild(linkDiv);
  } catch(err) {
    showToast("❌ " + (err.reason || err.message || "Liquidity failed"), "error");
    if (liqBtn) { liqBtn.disabled = false; liqBtn.textContent = "⊕ Add Liquidity"; }
  }
}

// Boot: wire avatar + ticker listeners
function _createAgentInit() {
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

  const tickerInput = document.getElementById("agentTicker");
  if (tickerInput) {
    tickerInput.addEventListener("input", function() { this.value = this.value.toUpperCase(); });
  }

  // Wire buttons
  document.getElementById("launchBtn")?.addEventListener("click", launchAgent);
  document.getElementById("liqBtn")?.addEventListener("click", addLiquidity);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _createAgentInit);
} else {
  _createAgentInit();
}
