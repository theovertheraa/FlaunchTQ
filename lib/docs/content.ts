// All documentation content for FlaunchTQ

export interface DocSection {
  slug: string;
  title: string;
  group: string;
}

export interface DocPage {
  slug: string;
  title: string;
  content: string; // markdown-like HTML string
}

export const DOC_NAV: { group: string; pages: DocSection[] }[] = [
  {
    group: "General",
    pages: [
      { slug: "introduction", title: "Introduction", group: "General" },
      { slug: "how-it-works", title: "How It Works", group: "General" },
      { slug: "getting-started", title: "Getting Started", group: "General" },
    ],
  },
  {
    group: "AI Agents",
    pages: [
      { slug: "what-are-agents", title: "What Are AI Agents?", group: "AI Agents" },
      { slug: "trading-agents", title: "Trading Agents", group: "AI Agents" },
      { slug: "agent-tokens", title: "Agent Tokens", group: "AI Agents" },
      { slug: "create-agent", title: "Creating an Agent", group: "AI Agents" },
    ],
  },
  {
    group: "Trading",
    pages: [
      { slug: "buying-selling", title: "Buying & Selling", group: "Trading" },
      { slug: "portfolio", title: "Portfolio", group: "Trading" },
      { slug: "mock-trading", title: "Mock Trading (USDT)", group: "Trading" },
    ],
  },
  {
    group: "On-Chain",
    pages: [
      { slug: "coti-testnet", title: "COTI Testnet", group: "On-Chain" },
      { slug: "token-launch", title: "Token Launch", group: "On-Chain" },
      { slug: "liquidity", title: "Adding Liquidity", group: "On-Chain" },
    ],
  },
  {
    group: "FAQ",
    pages: [
      { slug: "faq", title: "FAQ", group: "FAQ" },
    ],
  },
];

export const DOC_PAGES: Record<string, DocPage> = {
  introduction: {
    slug: "introduction",
    title: "Introduction",
    content: `
<h1>Introduction</h1>
<p>FlaunchTQ is an AI Agent Marketplace built on the COTI blockchain. It lets anyone discover, trade, and launch autonomous AI agent tokens — each agent has its own token, price chart, and live trade feed.</p>

<h2>What is FlaunchTQ?</h2>
<p>FlaunchTQ combines two ideas:</p>
<ul>
  <li><strong>AI Agent Marketplace</strong> — Browse 100+ AI agents, each represented as a tradeable token</li>
  <li><strong>Token Launchpad</strong> — Deploy your own AI agent token directly on COTI Testnet with a single transaction</li>
</ul>

<h2>Key Features</h2>
<ul>
  <li>🤖 100+ AI agent tokens to trade</li>
  <li>📈 Live candlestick charts and trade feeds per agent</li>
  <li>💼 Portfolio tracking with P&L</li>
  <li>🚀 One-click token launch on COTI Testnet</li>
  <li>🔐 Privy authentication (Google, X, Wallet, Email)</li>
  <li>⛓️ On-chain positions via COTI Testnet</li>
</ul>

<h2>Who is it for?</h2>
<p>FlaunchTQ is for developers, traders, and AI enthusiasts who want to participate in the emerging AI-agent economy — owning a piece of the agents powering the next generation of autonomous systems.</p>
    `,
  },
  "how-it-works": {
    slug: "how-it-works",
    title: "How It Works",
    content: `
<h1>How It Works</h1>
<p>FlaunchTQ uses a bonding curve model where each AI agent has its own token. The price of the token moves based on supply and demand.</p>

<h2>The Flow</h2>
<ol>
  <li><strong>Browse</strong> — Explore the agent marketplace on the home page. Filter by All, Trending, New, or Volume.</li>
  <li><strong>Research</strong> — Click any agent to see its price chart, live trade feed, market cap, and 24h volume.</li>
  <li><strong>Trade</strong> — Buy or sell agent tokens using USDT (mock) or on-chain COTI.</li>
  <li><strong>Launch</strong> — Create your own agent by filling out the form and deploying a token on COTI Testnet.</li>
</ol>

<h2>Mock Trading vs On-Chain</h2>
<p>FlaunchTQ supports two trading modes:</p>
<ul>
  <li><strong>Mock Trading</strong> — Uses a simulated USDT balance ($10,000 on signup). No real money, great for exploring.</li>
  <li><strong>On-Chain</strong> — Real transactions on COTI Testnet. Requires a connected wallet and COTI testnet tokens.</li>
</ul>

<h2>Token Price Model</h2>
<p>Each agent token starts at a base price and moves based on simulated market activity. The price engine runs client-side using a seeded random walk — consistent across sessions for the same agent slug.</p>
    `,
  },
  "getting-started": {
    slug: "getting-started",
    title: "Getting Started",
    content: `
<h1>Getting Started</h1>
<p>Get up and running on FlaunchTQ in under 2 minutes.</p>

<h2>1. Login</h2>
<p>Click the <strong>Login</strong> button in the top-right navbar. Choose from:</p>
<ul>
  <li>Google</li>
  <li>X (Twitter)</li>
  <li>Wallet (MetaMask or any EVM wallet)</li>
  <li>Email (OTP)</li>
</ul>
<p>After login, Privy automatically creates an embedded wallet for you — no setup needed.</p>

<h2>2. Browse Agents</h2>
<p>The home page lists all available AI agent tokens. Use the search bar to find a specific agent, or filter by Trending, New, or Volume.</p>

<h2>3. Trade</h2>
<p>Click any agent to open its token page. Use the Buy/Sell panel at the bottom to trade. Your holdings appear in the Portfolio page.</p>

<h2>4. Launch Your Own Agent</h2>
<p>Go to <strong>Create</strong> in the navbar. Fill in your agent's name, ticker, description, and category. Click <strong>Launch Agent</strong> to deploy on COTI Testnet.</p>
    `,
  },
  "what-are-agents": {
    slug: "what-are-agents",
    title: "What Are AI Agents?",
    content: `
<h1>What Are AI Agents?</h1>
<p>In FlaunchTQ, an AI Agent is an autonomous entity with its own token economy. Think of it like a company with a publicly traded stock — except the company is an AI system.</p>

<h2>Agent Properties</h2>
<ul>
  <li><strong>Name & Ticker</strong> — Each agent has a unique name (e.g. "Nova Agent") and ticker symbol (e.g. <code>$NOVA</code>)</li>
  <li><strong>Category</strong> — Agents are categorized: DeFi, Data, Security, Infrastructure, etc.</li>
  <li><strong>Color</strong> — A unique accent color used in charts and UI</li>
  <li><strong>Market Cap & Volume</strong> — Calculated from the token price and supply</li>
</ul>

<h2>Agent Token</h2>
<p>Every agent has an ERC-20 token deployed on COTI Testnet. Holding an agent's token gives you economic exposure to that agent's growth.</p>

<h2>100 Live Agents</h2>
<p>The marketplace currently features 100 AI agent tokens across categories including:</p>
<ul>
  <li>DeFi (liquidity, yield, trading bots)</li>
  <li>Data (indexers, oracles, analytics)</li>
  <li>Security (auditors, monitors)</li>
  <li>Infrastructure (nodes, bridges, validators)</li>
  <li>Social (content, moderation)</li>
</ul>
    `,
  },
  "trading-agents": {
    slug: "trading-agents",
    title: "Trading Agents",
    content: `
<h1>Trading Agents</h1>
<p>Each agent has a dedicated token page with live chart and trade feed.</p>

<h2>Token Page</h2>
<p>Navigate to any agent from the home page. The token page shows:</p>
<ul>
  <li><strong>Candlestick Chart</strong> — 1m, 5m, 15m, 1h, 4h, 1d intervals</li>
  <li><strong>Live Trade Feed</strong> — Real-time buy/sell events</li>
  <li><strong>Market Stats</strong> — Price, market cap, 24h volume, 24h change</li>
  <li><strong>Buy/Sell Panel</strong> — Bottom sheet for entering trades</li>
</ul>

<h2>Placing a Trade</h2>
<ol>
  <li>Open the token page for any agent</li>
  <li>The Buy/Sell panel is at the bottom of the screen</li>
  <li>Enter a USD amount to buy, or a token amount to sell</li>
  <li>Click <strong>Buy</strong> or <strong>Sell</strong></li>
  <li>Your balance updates instantly</li>
</ol>

<h2>Price Mechanics</h2>
<p>Prices are generated by a deterministic engine seeded from the agent slug and current time. Each agent has unique volatility, trend, and volume characteristics.</p>
    `,
  },
  "agent-tokens": {
    slug: "agent-tokens",
    title: "Agent Tokens",
    content: `
<h1>Agent Tokens</h1>
<p>Every AI agent on FlaunchTQ is backed by an ERC-20 token on COTI Testnet.</p>

<h2>Token Standard</h2>
<p>All agent tokens are standard ERC-20 contracts deployed via the FlaunchTQ factory contract on COTI Testnet (Chain ID: 7082400).</p>

<h2>Token Details</h2>
<ul>
  <li><strong>Decimals:</strong> 18</li>
  <li><strong>Network:</strong> COTI Testnet</li>
  <li><strong>Explorer:</strong> <a href="https://testnet.cotiscan.io" target="_blank">testnet.cotiscan.io</a></li>
  <li><strong>Factory:</strong> Deployed by FlaunchTQ team</li>
</ul>

<h2>Viewing On-Chain Balances</h2>
<p>Go to <strong>Portfolio → On-chain</strong> tab. If you're logged in with Privy, your embedded wallet address is used automatically to check your token balances on COTI Testnet.</p>
    `,
  },
  "create-agent": {
    slug: "create-agent",
    title: "Creating an Agent",
    content: `
<h1>Creating an Agent</h1>
<p>Launch your own AI agent token on COTI Testnet in minutes.</p>

<h2>Step 1 — Agent Details</h2>
<p>Fill in the <strong>Create</strong> form:</p>
<ul>
  <li><strong>Agent Name</strong> — Display name for your agent</li>
  <li><strong>Ticker Symbol</strong> — 2–6 characters (e.g. NOVA)</li>
  <li><strong>Description</strong> — What your agent does</li>
  <li><strong>Category</strong> — DeFi, Data, Security, Infrastructure, or Social</li>
  <li><strong>Total Supply</strong> — Number of tokens to mint</li>
  <li><strong>Image</strong> — Upload an avatar (optional)</li>
</ul>

<h2>Step 2 — Deploy Token</h2>
<p>Click <strong>Launch Agent</strong>. Your wallet will be prompted to sign a transaction. The contract deploys on COTI Testnet and your token is live.</p>

<h2>Step 3 — Add Liquidity</h2>
<p>After deployment, add initial liquidity to enable trading. Enter the token amount and COTI amount for the pool.</p>

<h2>Requirements</h2>
<ul>
  <li>Must be logged in (Privy or MetaMask)</li>
  <li>Wallet must be connected to COTI Testnet (Chain ID: 7082400)</li>
  <li>Must have COTI testnet tokens for gas</li>
</ul>
    `,
  },
  "buying-selling": {
    slug: "buying-selling",
    title: "Buying & Selling",
    content: `
<h1>Buying & Selling</h1>

<h2>Mock Trading</h2>
<p>All users start with a <strong>$10,000 USDT</strong> mock balance. This lets you trade without real money.</p>
<ul>
  <li>Buy any agent token with USDT</li>
  <li>Sell tokens back to USDT at current price</li>
  <li>Holdings tracked in Portfolio</li>
  <li>Trade history saved locally</li>
</ul>

<h2>How to Buy</h2>
<ol>
  <li>Navigate to any agent's token page</li>
  <li>Tap the <strong>Buy</strong> tab in the bottom panel</li>
  <li>Enter USD amount (e.g. $100)</li>
  <li>Tap <strong>Buy $TICKER</strong></li>
  <li>Tokens added to your portfolio instantly</li>
</ol>

<h2>How to Sell</h2>
<ol>
  <li>Navigate to the agent's token page</li>
  <li>Tap the <strong>Sell</strong> tab</li>
  <li>Enter token amount to sell</li>
  <li>Tap <strong>Sell $TICKER</strong></li>
  <li>USDT balance increases</li>
</ol>

<h2>Slippage</h2>
<p>Mock trades execute at the displayed price with no slippage. On-chain trades use COTI AMM pricing which may include slippage depending on pool depth.</p>
    `,
  },
  portfolio: {
    slug: "portfolio",
    title: "Portfolio",
    content: `
<h1>Portfolio</h1>
<p>The Portfolio page tracks all your agent token holdings and trade history.</p>

<h2>Stats Row</h2>
<ul>
  <li><strong>Total Value</strong> — USDT balance + current value of all holdings</li>
  <li><strong>P&L</strong> — Profit/loss vs your starting $10,000</li>
  <li><strong>USDT Balance</strong> — Available mock USDT</li>
  <li><strong>Positions</strong> — Number of different tokens held</li>
</ul>

<h2>Holdings Tab</h2>
<p>Lists every agent token you hold, with quantity and current value. Click any row to go to that agent's token page.</p>

<h2>On-Chain Tab</h2>
<p>Shows your real token balances on COTI Testnet. Automatically uses your Privy embedded wallet address — no manual connection needed if you're already logged in.</p>

<h2>Trade History</h2>
<p>Full log of every buy and sell, showing type, token, amount, USD value, and time.</p>
    `,
  },
  "mock-trading": {
    slug: "mock-trading",
    title: "Mock Trading (USDT)",
    content: `
<h1>Mock Trading (USDT)</h1>
<p>FlaunchTQ lets you trade with simulated USDT so you can explore the platform without spending real money.</p>

<h2>Starting Balance</h2>
<p>Every account starts with <strong>$10,000 USDT</strong> mock balance. This resets if your browser data is cleared.</p>

<h2>How It Works</h2>
<p>The mock wallet (<code>NovusWallet</code>) runs entirely in the browser:</p>
<ul>
  <li>Balances stored in <code>localStorage</code></li>
  <li>Trades execute instantly at market price</li>
  <li>No gas fees, no blockchain transactions</li>
  <li>Holdings and history persist between sessions</li>
</ul>

<h2>Limitations</h2>
<ul>
  <li>Balances are browser-local — clearing localStorage resets everything</li>
  <li>Not synced across devices</li>
  <li>Cannot withdraw or transfer mock USDT</li>
</ul>
    `,
  },
  "coti-testnet": {
    slug: "coti-testnet",
    title: "COTI Testnet",
    content: `
<h1>COTI Testnet</h1>
<p>FlaunchTQ is built on the COTI blockchain. All on-chain features use COTI Testnet.</p>

<h2>Network Details</h2>
<ul>
  <li><strong>Network Name:</strong> COTI Testnet</li>
  <li><strong>Chain ID:</strong> 7082400 (0x6C0360)</li>
  <li><strong>RPC URL:</strong> https://testnet.coti.io/rpc</li>
  <li><strong>Currency:</strong> COTI</li>
  <li><strong>Explorer:</strong> <a href="https://testnet.cotiscan.io" target="_blank">testnet.cotiscan.io</a></li>
</ul>

<h2>Adding to MetaMask</h2>
<p>When you click "Connect Wallet" on the Create page, FlaunchTQ automatically prompts MetaMask to add the COTI Testnet network. You can also add it manually using the details above.</p>

<h2>Getting Testnet COTI</h2>
<p>Visit the COTI Testnet faucet to get free test tokens for gas and trading. Search "COTI Testnet faucet" to find the official faucet.</p>
    `,
  },
  "token-launch": {
    slug: "token-launch",
    title: "Token Launch",
    content: `
<h1>Token Launch</h1>
<p>Deploy an ERC-20 agent token on COTI Testnet using the FlaunchTQ factory contract.</p>

<h2>What Gets Deployed</h2>
<p>A standard ERC-20 contract with:</p>
<ul>
  <li>Name and symbol you specify</li>
  <li>Total supply minted to your wallet</li>
  <li>18 decimals</li>
  <li>Stored metadata (description, image URL, category)</li>
</ul>

<h2>Factory Contract</h2>
<p>All tokens are deployed through the FlaunchTQ factory, which maintains a registry of all agents. This registry powers the on-chain tab in Portfolio and the Create page.</p>

<h2>After Deployment</h2>
<p>Once deployed:</p>
<ul>
  <li>Your token appears in the global factory registry</li>
  <li>Anyone can view it on the COTI block explorer</li>
  <li>You can add liquidity to enable AMM trading</li>
  <li>Token address is shown in the success message</li>
</ul>
    `,
  },
  liquidity: {
    slug: "liquidity",
    title: "Adding Liquidity",
    content: `
<h1>Adding Liquidity</h1>
<p>After launching a token, add liquidity to enable trading through the COTI AMM.</p>

<h2>What is Liquidity?</h2>
<p>Liquidity is the pool of tokens and COTI that others trade against. Without liquidity, no one can buy your token. As liquidity provider (LP), you earn fees from every trade.</p>

<h2>Adding Liquidity</h2>
<ol>
  <li>Deploy your agent token (Step 1 of Create flow)</li>
  <li>The Add Liquidity form appears automatically</li>
  <li>Enter the amount of your token to add</li>
  <li>Enter the amount of COTI to pair with it</li>
  <li>Click <strong>Add Liquidity</strong></li>
  <li>Approve both transactions in your wallet</li>
</ol>

<h2>Initial Price</h2>
<p>The ratio of token:COTI you provide sets the initial price. For example, if you add 1,000,000 tokens and 10 COTI, the initial price is 0.00001 COTI per token.</p>
    `,
  },
  faq: {
    slug: "faq",
    title: "FAQ",
    content: `
<h1>FAQ</h1>

<h2>Is this real money?</h2>
<p>No. The mock trading uses simulated USDT ($10,000 starting balance) stored in your browser. On-chain features use COTI Testnet which uses test tokens with no real monetary value.</p>

<h2>Why do I need to login?</h2>
<p>Login is required to trade, create agents, and view your portfolio. FlaunchTQ uses Privy for authentication — it supports Google, X, Wallet, and Email login.</p>

<h2>What is Privy?</h2>
<p>Privy is an authentication system that automatically creates an embedded crypto wallet for you when you sign in. You don't need MetaMask to get started — Privy handles wallet creation invisibly.</p>

<h2>Why does my on-chain portfolio show no tokens?</h2>
<p>The on-chain tab reads your real COTI Testnet balance. If you haven't done any on-chain transactions (deployed a token, added liquidity), it will be empty. Mock trades from the Buy/Sell panel appear in the Holdings tab, not the On-chain tab.</p>

<h2>How do I reset my mock balance?</h2>
<p>Clear your browser's localStorage for this site, or open the site in a private/incognito window. Your mock balance will reset to $10,000.</p>

<h2>Can I trade on mainnet?</h2>
<p>Not yet. FlaunchTQ currently operates on COTI Testnet only. Mainnet support is planned for a future release.</p>

<h2>How are agent token prices determined?</h2>
<p>Mock prices are generated by a deterministic engine seeded from the agent's slug. Each agent has unique volatility parameters, making price movements feel realistic while being entirely simulated.</p>

<h2>Who built FlaunchTQ?</h2>
<p>FlaunchTQ is an experimental AI agent marketplace built on COTI blockchain infrastructure. It demonstrates how AI agents can have their own token economies.</p>
    `,
  },
};

export function getDocPage(slug: string): DocPage | null {
  return DOC_PAGES[slug] ?? null;
}

export function getAllSlugs(): string[] {
  return Object.keys(DOC_PAGES);
}
