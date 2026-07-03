// web3.js — COTI Network contract layer for FlaunchTQ
// Chain: COTI Testnet (chain ID 7082400)
// Uses ethers v6 via CDN.

(function () {
  const CHAIN_ID    = 7082400;
  const CHAIN_HEX   = "0x6C0360"; // 7082400 in hex
  const RPC_URL     = "https://testnet.coti.io/rpc";
  const EXPLORER    = "https://testnet.cotiscan.io";
  const CHAIN_NAME  = "COTI Testnet";
  const CURRENCY    = { name: "COTI", symbol: "COTI", decimals: 18 };

  // Contract addresses on COTI Testnet
  const FACTORY_ADDR = "0x6d8FDF3813dABFEe9f7b34b81903A1705A8ecb53";
  const ROUTER_ADDR  = "0xD713704b5E7f36fA0d91692091861B13059cD514";
  const WETH_ADDR    = "0xaD52D874A04b0b7274A1Bb0043963C27016F1DbA";
  const UNI_FACTORY  = "0x830c09A07674b21D2808DAcFeCFb6Ff7C09efD76";

  // ── Add/switch COTI network in MetaMask ──────────────────────
  async function addCotiNetwork() {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: CHAIN_HEX,
        chainName: CHAIN_NAME,
        nativeCurrency: CURRENCY,
        rpcUrls: [RPC_URL],
        blockExplorerUrls: [EXPLORER]
      }]
    });
  }

  async function switchToCoti() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_HEX }]
      });
    } catch (e) {
      if (e.code === 4902) await addCotiNetwork();
      else throw e;
    }
  }

  // ── Provider ──────────────────────────────────────────────────
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

  // ── ERC20 (standard, no privacy for now) ─────────────────────
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
  ];

  async function getTokenBalance(tokenAddress, walletAddress) {
    const provider = await getReadProvider();
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return erc20.balanceOf(walletAddress);
  }

  // ── Launch token (generic — works when factory is deployed) ──
  const FACTORY_ABI = [
    "function launchToken(string _name, string _symbol, uint256 _totalSupply, string _imageUrl, string _description) payable returns (address)",
    "function tokenCount() view returns (uint256)",
    "function tokens(uint256) view returns (address tokenAddress, string name, string symbol, uint256 totalSupply, address creator, string imageUrl, string description, uint256 createdAt)"
  ];

  async function launchToken({ name, symbol, supply, imageUrl, description }) {
    const signer  = await getSigner();
    const factory = new ethers.Contract(FACTORY_ADDR, FACTORY_ABI, signer);
    const supplyWei = ethers.parseUnits(String(supply), 18);
    const tx = await factory.launchToken(
      name, symbol, supplyWei, imageUrl || "", description || "",
      { gasLimit: 8_000_000 }
    );
    const receipt = await tx.wait();
    const iface = new ethers.Interface([
      "event TokenLaunched(address indexed tokenAddress, address indexed creator, string name, string symbol, uint256 totalSupply, string imageUrl, uint256 timestamp)"
    ]);
    let tokenAddress = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed) { tokenAddress = parsed.args.tokenAddress; break; }
      } catch(e) {}
    }
    return { tx, receipt, tokenAddress };
  }

  // ── Add initial liquidity (COTI + tokens) to UniswapV2 ───────────────
  async function addLiquidity(tokenAddress, tokenAmountWei, cotiAmountWei) {
    const signer  = await getSigner();
    const erc20   = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const router  = new ethers.Contract(ROUTER_ADDR, ROUTER_ABI, signer);
    const owner   = await signer.getAddress();
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    // Approve router to spend tokens
    const approveTx = await erc20.approve(ROUTER_ADDR, tokenAmountWei, { gasLimit: 500_000 });
    await approveTx.wait();
    // Add liquidity
    const tx = await router.addLiquidityETH(
      tokenAddress, tokenAmountWei, 0n, 0n,
      owner, deadline,
      { value: cotiAmountWei, gasLimit: 5_000_000 }
    );
    return tx.wait();
  }

  // ── Router swap (standard UniV2, when deployed) ───────────────
  const ROUTER_ABI = [
    "function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[])",
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[])",
    "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[])",
    "function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)"
  ];

  async function buyToken(tokenAddress, cotiAmountWei, slippagePct = 5) {
    const signer = await getSigner();
    const router = new ethers.Contract(ROUTER_ADDR, ROUTER_ABI, signer);
    const path   = [WETH_ADDR, tokenAddress];
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    // Get quote
    let amountOutMin = 0n;
    try {
      const amounts = await router.getAmountsOut(cotiAmountWei, path);
      amountOutMin = amounts[1] * BigInt(100 - slippagePct) / 100n;
    } catch(e) {}
    const tx = await router.swapExactETHForTokens(amountOutMin, path, await signer.getAddress(), deadline, { value: cotiAmountWei, gasLimit: 3_000_000 });
    return tx.wait();
  }

  async function sellToken(tokenAddress, tokenAmountWei, slippagePct = 5) {
    const signer = await getSigner();
    const erc20  = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const router = new ethers.Contract(ROUTER_ADDR, ROUTER_ABI, signer);
    const path   = [tokenAddress, WETH_ADDR];
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    // Approve
    const allowance = await erc20.allowance(await signer.getAddress(), ROUTER_ADDR);
    if (allowance < tokenAmountWei) {
      const approveTx = await erc20.approve(ROUTER_ADDR, tokenAmountWei);
      await approveTx.wait();
    }
    let amountOutMin = 0n;
    try {
      const amounts = await router.getAmountsOut(tokenAmountWei, path);
      amountOutMin = amounts[1] * BigInt(100 - slippagePct) / 100n;
    } catch(e) {}
    const tx = await router.swapExactTokensForETH(tokenAmountWei, amountOutMin, path, await signer.getAddress(), deadline, { gasLimit: 3_000_000 });
    return tx.wait();
  }

  window.FlaunchWeb3 = {
    CHAIN_ID, CHAIN_HEX, RPC_URL, EXPLORER, CHAIN_NAME, CURRENCY,
    FACTORY_ADDR, ROUTER_ADDR, WETH_ADDR, UNI_FACTORY,
    switchToCoti, addCotiNetwork,
    getSigner, getReadProvider,
    getCotiBalance, getTokenBalance,
    launchToken, addLiquidity, buyToken, sellToken,
  };
})();
