// web3.js — COTI Network contract layer for FlaunchTQ
// Chain: COTI Testnet (chain ID 7082400)
// Bonding curve model (pump.fun style) — creator pays gas only.

(function () {
  const CHAIN_ID   = 7082400;
  const CHAIN_HEX  = "0x6C0360";
  const RPC_URL    = "https://testnet.coti.io/rpc";
  const EXPLORER   = "https://testnet.cotiscan.io";
  const CHAIN_NAME = "COTI Testnet";
  const CURRENCY   = { name: "COTI", symbol: "COTI", decimals: 18 };

  // ── Contract addresses ────────────────────────────────────────
  const FLAUNCH_FACTORY = "0x50a8904A42845fAe7Cdb31FA86eB080cA44EA635"; // FlaunchFactory (bonding curve)
  const ROUTER_ADDR     = "0xD713704b5E7f36fA0d91692091861B13059cD514"; // UniV2 Router (post-graduation)
  const WETH_ADDR       = "0xaD52D874A04b0b7274A1Bb0043963C27016F1DbA"; // WCOTI
  const UNI_FACTORY     = "0x830c09A07674b21D2808DAcFeCFb6Ff7C09efD76"; // UniV2 Factory

  // Graduation: 50 COTI collected → auto-list on UniV2, LP burned forever
  const GRADUATION_THRESHOLD = "50"; // in COTI

  // ── ABIs ──────────────────────────────────────────────────────
  const FACTORY_ABI = [
    "function launch(string _name, string _symbol, string _imageUrl, string _description) returns (address tokenAddr, address curveAddr)",
    "function tokenCount() view returns (uint256)",
    "function getToken(uint256 idx) view returns (tuple(address tokenAddress, address curveAddress, address creator, string name, string symbol, string imageUrl, string description, uint256 createdAt))",
    "function tokenToCurve(address token) view returns (address)",
    "function getCreatorTokens(address creator) view returns (uint256[])",
    "event TokenLaunched(address indexed tokenAddress, address indexed curveAddress, address indexed creator, string name, string symbol, string imageUrl, uint256 timestamp)"
  ];

  const CURVE_ABI = [
    "function buy(uint256 minTokensOut) payable",
    "function sell(uint256 tokensIn, uint256 minCotiOut)",
    "function getBuyAmount(uint256 cotiIn) view returns (uint256)",
    "function getSellAmount(uint256 tokensIn) view returns (uint256)",
    "function currentPrice() view returns (uint256)",
    "function progress() view returns (uint256)",
    "function marketCap() view returns (uint256)",
    "function cotiCollected() view returns (uint256)",
    "function graduated() view returns (bool)",
    "function token() view returns (address)",
    "function GRADUATION_THRESHOLD() view returns (uint256)",
    "function graduate()",
    "event Buy(address indexed buyer, uint256 cotiIn, uint256 tokensOut, uint256 newPrice, uint256 cotiCollected)",
    "event Sell(address indexed seller, uint256 tokensIn, uint256 cotiOut, uint256 newPrice, uint256 cotiCollected)",
    "event Graduated(address indexed token, address indexed pair, uint256 cotiAdded, uint256 tokensAdded)"
  ];

  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];

  // ── Network helpers ───────────────────────────────────────────
  async function addCotiNetwork() {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{ chainId: CHAIN_HEX, chainName: CHAIN_NAME, nativeCurrency: CURRENCY, rpcUrls: [RPC_URL], blockExplorerUrls: [EXPLORER] }]
    });
  }

  async function switchToCoti() {
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_HEX }] });
    } catch (e) {
      if (e.code === 4902) await addCotiNetwork();
      else throw e;
    }
  }

  async function getSigner() {
    if (!window.ethers) throw new Error("ethers.js not loaded");
    if (!window.ethereum) throw new Error("No wallet detected. Install MetaMask.");
    await switchToCoti();
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  }

  async function getReadProvider() {
    if (!window.ethers) throw new Error("ethers.js not loaded");
    return new ethers.JsonRpcProvider(RPC_URL);
  }

  // ── Native COTI balance ───────────────────────────────────────
  async function getCotiBalance(address) {
    const provider = await getReadProvider();
    const bal = await provider.getBalance(address);
    return ethers.formatEther(bal);
  }

  async function getTokenBalance(tokenAddress, walletAddress) {
    const provider = await getReadProvider();
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const raw = await erc20.balanceOf(walletAddress);
    return ethers.formatUnits(raw, 18);
  }

  // ── Launch token (bonding curve — gas only) ───────────────────
  // Creator pays gas only. No COTI required for liquidity.
  // Factory deploys token + bonding curve in one tx.
  async function launchToken({ name, symbol, imageUrl, description }) {
    const signer  = await getSigner();
    const factory = new ethers.Contract(FLAUNCH_FACTORY, FACTORY_ABI, signer);
    const tx = await factory.launch(
      name,
      symbol,
      imageUrl  || "",
      description || "",
      { gasLimit: 20_000_000 }
    );
    const receipt = await tx.wait();
    const iface = new ethers.Interface(FACTORY_ABI);
    let tokenAddress = null, curveAddress = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === "TokenLaunched") {
          tokenAddress = parsed.args.tokenAddress;
          curveAddress = parsed.args.curveAddress;
          break;
        }
      } catch(e) {}
    }
    return { tx, receipt, tokenAddress, curveAddress };
  }

  // ── Bonding curve buy ─────────────────────────────────────────
  async function buyCurve(curveAddress, cotiAmountWei, slippagePct = 5) {
    const signer = await getSigner();
    const curve  = new ethers.Contract(curveAddress, CURVE_ABI, signer);
    const provider = await getReadProvider();
    const curveRead = new ethers.Contract(curveAddress, CURVE_ABI, provider);

    let minOut = 0n;
    try {
      const quote = await curveRead.getBuyAmount(cotiAmountWei);
      minOut = quote * BigInt(100 - slippagePct) / 100n;
    } catch(e) {}

    const tx = await curve.buy(minOut, { value: cotiAmountWei, gasLimit: 500_000 });
    return tx.wait();
  }

  // ── Bonding curve sell ────────────────────────────────────────
  async function sellCurve(curveAddress, tokenAddress, tokenAmountWei, slippagePct = 5) {
    const signer = await getSigner();
    const curve  = new ethers.Contract(curveAddress, CURVE_ABI, signer);
    const erc20  = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const provider = await getReadProvider();
    const curveRead = new ethers.Contract(curveAddress, CURVE_ABI, provider);

    // Approve
    const owner = await signer.getAddress();
    const allowance = await erc20.allowance(owner, curveAddress);
    if (allowance < tokenAmountWei) {
      const approveTx = await erc20.approve(curveAddress, tokenAmountWei, { gasLimit: 200_000 });
      await approveTx.wait();
    }

    let minCoti = 0n;
    try {
      const quote = await curveRead.getSellAmount(tokenAmountWei);
      minCoti = quote * BigInt(100 - slippagePct) / 100n;
    } catch(e) {}

    const tx = await curve.sell(tokenAmountWei, minCoti, { gasLimit: 500_000 });
    return tx.wait();
  }

  // ── Read curve state ──────────────────────────────────────────
  async function getCurveState(curveAddress) {
    const provider = await getReadProvider();
    const curve = new ethers.Contract(curveAddress, CURVE_ABI, provider);
    const [price, prog, collected, graduated, threshold] = await Promise.all([
      curve.currentPrice(),
      curve.progress(),
      curve.cotiCollected(),
      curve.graduated(),
      curve.GRADUATION_THRESHOLD()
    ]);
    return {
      price:      ethers.formatEther(price),
      progress:   Number(prog),
      collected:  ethers.formatEther(collected),
      threshold:  ethers.formatEther(threshold),
      graduated:  graduated
    };
  }

  // ── Get all launched tokens from factory ─────────────────────
  async function getAllTokens() {
    const provider = await getReadProvider();
    const factory  = new ethers.Contract(FLAUNCH_FACTORY, FACTORY_ABI, provider);
    const count = await factory.tokenCount();
    const tokens = [];
    for (let i = 0; i < Number(count); i++) {
      try {
        const t = await factory.getToken(i);
        tokens.push({
          tokenAddress: t.tokenAddress,
          curveAddress: t.curveAddress,
          creator:      t.creator,
          name:         t.name,
          symbol:       t.symbol,
          imageUrl:     t.imageUrl,
          description:  t.description,
          createdAt:    Number(t.createdAt)
        });
      } catch(e) {}
    }
    return tokens;
  }

  // ── Get curve for a token ─────────────────────────────────────
  async function getCurveForToken(tokenAddress) {
    const provider = await getReadProvider();
    const factory  = new ethers.Contract(FLAUNCH_FACTORY, FACTORY_ABI, provider);
    return factory.tokenToCurve(tokenAddress);
  }

  window.FlaunchWeb3 = {
    // Config
    CHAIN_ID, CHAIN_HEX, RPC_URL, EXPLORER, CHAIN_NAME, CURRENCY,
    FLAUNCH_FACTORY, ROUTER_ADDR, WETH_ADDR, UNI_FACTORY,
    GRADUATION_THRESHOLD,
    // Network
    switchToCoti, addCotiNetwork, getSigner, getReadProvider,
    // Balances
    getCotiBalance, getTokenBalance,
    // Launch
    launchToken,
    // Bonding curve trading
    buyCurve, sellCurve, getCurveState,
    // Read
    getAllTokens, getCurveForToken,
  };
})();
