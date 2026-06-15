"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion, AnimatePresence
} from "framer-motion";
import {
  Shield, Lock, Unlock, Key, Fingerprint, Wallet, ArrowUpRight, ArrowDownRight, Copy, CheckCircle, AlertTriangle, Check, X, RefreshCw, ExternalLink, QrCode, Scan, Eye, EyeOff, Zap, Database, Network, Server, HardDrive, Cpu, Activity, TrendingUp, TrendingDown, Clock, Calendar, Bell, BellOff, Settings, MoreVertical, ChevronDown, ChevronRight, Plus, Minus, Search, Filter, Download, Upload, Share2, Link as LinkIcon, Hash, Tag, Bookmark, Star, AlertCircle, Info, HelpCircle, Loader2, Terminal, Code, Braces, SquareCode, GitBranch, GitCommit, GitPullRequest, BarChart3, Users, User, UserCheck, UserX, UserPlus, Globe, MapPin, Navigation, Compass, Moon, Sun, CloudRain, CloudSnow, Flame, Snowflake, Umbrella, Timer, TimerOff, TimerReset, MessageCircle, Send, SendHorizontal, Navigation2, Map, MapPinned, Globe2, Earth, Satellite, SatelliteDish, Rocket, Plane, Train, Bus, Car, Bike, Footprints, PersonStanding, Dumbbell, Weight, Scale, Ruler, Hammer, Wrench, Nut, Bolt, Settings2, Sliders, SlidersHorizontal, ToggleLeft, ToggleRight, Delete, Trash, Trash2, Archive, ArchiveRestore, Inbox, View, SortAsc, SortDesc, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, RotateCcw, Rotate3d, FlipHorizontal, FlipVertical, Maximize, Minimize, Expand, Fullscreen, ZoomIn, ZoomOut, Focus, Target, Crosshair, Locate, LocateOff, LocateFixed, MapPinCheck, MapPinX, MapPinPlus, MapPinMinus, MapPinHouse, Building, Hospital, School, University, Church, TreePalm, Leaf, Sprout, Wheat, Carrot, Apple, Banana, Grape, Cherry
} from "lucide-react";
import {
  LineChart as RechartsLineChart, Line as RechartsLine, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer as RechartsResponsiveContainer, AreaChart as RechartsAreaChart, Area as RechartsArea, BarChart as RechartsBarChart, Bar as RechartsBar, PieChart as RechartsPieChart, Pie as RechartsPie, Cell as RechartsCell, ComposedChart as RechartsComposedChart, ReferenceLine as RechartsReferenceLine, Legend as RechartsLegend, RadialBarChart, RadialBar, ScatterChart as RechartsScatterChart, Scatter as RechartsScatter, ZAxis as RechartsZAxis
} from "recharts";

// ============================================================================
// TYPE DEFINITIONS — BLOCKCHAIN DATA STRUCTURES
// ============================================================================

interface WalletInfo {
  address: string;
  balance: number;
  network: "ETHEREUM" | "POLYGON" | "BSC" | "ARBITRUM" | "OPTIMISM" | "SOLANA";
  connected: boolean;
  provider: "METAMASK" | "WALLETCONNECT" | "COINBASE" | "PHANTOM";
  chainId: number;
  nonce: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  timestamp: Date;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  type: "SEND" | "RECEIVE" | "SWAP" | "STAKE" | "UNSTAKE" | "NFT_PURCHASE";
  gasUsed: number;
  gasPrice: number;
  confirmations: number;
  blockNumber?: number;
  tokenSymbol?: string;
  tokenName?: string;
  nftId?: string;
  nftCollection?: string;
}

interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  logo?: string;
  contractAddress: string;
  decimals: number;
}

interface NFT {
  id: string;
  tokenId: string;
  collection: string;
  name: string;
  image: string;
  floorPrice: number;
  lastSalePrice?: number;
  rarity?: number;
  attributes?: { trait_type: string; value: string }[];
}

interface SmartContract {
  address: string;
  name: string;
  verified: boolean;
  interactions: number;
  lastInteraction: Date;
  functions: string[];
  events: string[];
}

interface StakingPosition {
  protocol: string;
  stakedAmount: number;
  rewards: number;
  apr: number;
  unlockDate?: Date;
  status: "ACTIVE" | "LOCKED" | "UNSTAKING";
}

interface BlockchainMetrics {
  gasPrice: number;
  gasPriceGwei: number;
  networkHashrate: number;
  blockTime: number;
  pendingTransactions: number;
  networkDifficulty: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  volume24h: number;
}

interface SecurityAlert {
  id: string;
  type: "SUSPICIOUS_CONTRACT" | "PHISHING_ATTEMPT" | "HIGH_GAS" | "UNUSUAL_ACTIVITY" | "SMART_CONTRACT_RISK";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  timestamp: Date;
  dismissed: boolean;
  details?: string;
}

interface IdentityProfile {
  ensName?: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  verified: boolean;
  reputationScore: number;
  transactionCount: number;
  firstTransaction: Date;
  lastActivity: Date;
  labels: string[];
  riskScore: number;
  trustScore: number;
}

// ============================================================================
// UTILITY FUNCTIONS — BLOCKCHAIN HELPERS
// ============================================================================

const formatAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

const formatHash = (hash: string, chars = 8): string => {
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
};

const formatBalance = (balance: number, decimals = 4): string => {
  if (balance >= 1e9) return `${(balance / 1e9).toFixed(2)}B`;
  if (balance >= 1e6) return `${(balance / 1e6).toFixed(2)}M`;
  if (balance >= 1e3) return `${(balance / 1e3).toFixed(2)}K`;
  return balance.toFixed(decimals);
};

const formatCurrency = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const calculateGasFee = (gasUsed: number, gasPrice: number): number => {
  return (gasUsed * gasPrice) / 1e9; // Convert to ETH
};

const getNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    137: "Polygon",
    56: "BSC",
    42161: "Arbitrum",
    10: "Optimism",
    1399811149: "Solana",
  };
  return networks[chainId] || `Unknown (${chainId})`;
};

const getExplorerUrl = (network: string, hash: string, type: "tx" | "address" | "token"): string => {
  const explorers: Record<string, Record<string, string>> = {
    ETHEREUM: {
      tx: `https://etherscan.io/tx/${hash}`,
      address: `https://etherscan.io/address/${hash}`,
      token: `https://etherscan.io/token/${hash}`,
    },
    POLYGON: {
      tx: `https://polygonscan.com/tx/${hash}`,
      address: `https://polygonscan.com/address/${hash}`,
      token: `https://polygonscan.com/token/${hash}`,
    },
    BSC: {
      tx: `https://bscscan.com/tx/${hash}`,
      address: `https://bscscan.com/address/${hash}`,
      token: `https://bscscan.com/token/${hash}`,
    },
    ARBITRUM: {
      tx: `https://arbiscan.io/tx/${hash}`,
      address: `https://arbiscan.io/address/${hash}`,
      token: `https://arbiscan.io/token/${hash}`,
    },
    OPTIMISM: {
      tx: `https://optimistic.etherscan.io/tx/${hash}`,
      address: `https://optimistic.etherscan.io/address/${hash}`,
      token: `https://optimistic.etherscan.io/token/${hash}`,
    },
    SOLANA: {
      tx: `https://solscan.io/tx/${hash}`,
      address: `https://solscan.io/account/${hash}`,
      token: `https://solscan.io/token/${hash}`,
    },
  };
  return explorers[network]?.[type] || "#";
};

// ============================================================================
// DATA SIMULATION — BLOCKCHAIN DATA GENERATOR
// ============================================================================

const generateMockWallet = (): WalletInfo => ({
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  balance: 12.456,
  network: "ETHEREUM",
  connected: true,
  provider: "METAMASK",
  chainId: 1,
  nonce: 247,
});

const generateMockTransactions = (count = 20): Transaction[] => {
  const types: Transaction["type"][] = ["SEND", "RECEIVE", "SWAP", "STAKE", "UNSTAKE", "NFT_PURCHASE"];
  const statuses: Transaction["status"][] = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "FAILED"];
  
  return Array.from({ length: count }, (_, i) => ({
    hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    from: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    to: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
    value: Math.random() * 10,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 30),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    type: types[Math.floor(Math.random() * types.length)],
    gasUsed: Math.floor(Math.random() * 200000) + 21000,
    gasPrice: Math.floor(Math.random() * 100) + 20,
    confirmations: Math.floor(Math.random() * 100),
    blockNumber: 18000000 + Math.floor(Math.random() * 100000),
    tokenSymbol: ["ETH", "USDC", "USDT", "WBTC", "DAI"][Math.floor(Math.random() * 5)],
    tokenName: ["Ethereum", "USD Coin", "Tether", "Wrapped Bitcoin", "Dai"][Math.floor(Math.random() * 5)],
  }));
};

const generateMockTokens = (): Token[] => [
  { symbol: "ETH", name: "Ethereum", balance: 12.456, price: 3456.78, value: 43045.67, change24h: 2.34, contractAddress: "0x0000000000000000000000000000000000000000", decimals: 18 },
  { symbol: "USDC", name: "USD Coin", balance: 5000, price: 1, value: 5000, change24h: 0.01, contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { symbol: "USDT", name: "Tether", balance: 3000, price: 1, value: 3000, change24h: -0.02, contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", balance: 0.5, price: 67234.50, value: 33617.25, change24h: 1.89, contractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
  { symbol: "DAI", name: "Dai", balance: 2000, price: 1, value: 2000, change24h: 0.00, contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
];

const generateMockNFTs = (): NFT[] => [
  {
    id: "1",
    tokenId: "1234",
    collection: "Bored Ape Yacht Club",
    name: "Bored Ape #1234",
    image: "https://example.com/nft1.png",
    floorPrice: 45.6,
    lastSalePrice: 52.3,
    rarity: 95,
    attributes: [
      { trait_type: "Background", value: "Blue" },
      { trait_type: "Fur", value: "Golden" },
      { trait_type: "Eyes", value: "Laser" },
    ],
  },
  {
    id: "2",
    tokenId: "5678",
    collection: "Azuki",
    name: "Azuki #5678",
    image: "https://example.com/nft2.png",
    floorPrice: 12.3,
    lastSalePrice: 15.7,
    rarity: 87,
    attributes: [
      { trait_type: "Type", value: "Human" },
      { trait_type: "Hair", value: "Pink" },
      { trait_type: "Clothing", value: "Kimono" },
    ],
  },
];

const generateMockStakingPositions = (): StakingPosition[] => [
  {
    protocol: "Lido",
    stakedAmount: 5.5,
    rewards: 0.234,
    apr: 4.2,
    status: "ACTIVE",
  },
  {
    protocol: "Rocket Pool",
    stakedAmount: 2.0,
    rewards: 0.089,
    apr: 3.8,
    unlockDate: new Date(Date.now() + 86400000 * 7),
    status: "LOCKED",
  },
];

const generateMockSecurityAlerts = (): SecurityAlert[] => [
  {
    id: "1",
    type: "HIGH_GAS",
    severity: "MEDIUM",
    message: "Gas prices are currently high (150 Gwei). Consider waiting for lower fees.",
    timestamp: new Date(Date.now() - 3600000),
    dismissed: false,
  },
  {
    id: "2",
    type: "SUSPICIOUS_CONTRACT",
    severity: "HIGH",
    message: "Contract 0x1234...5678 has not been verified. Proceed with caution.",
    timestamp: new Date(Date.now() - 7200000),
    dismissed: false,
    details: "This contract has no source code verification on Etherscan.",
  },
];

const generateMockIdentityProfile = (): IdentityProfile => ({
  ensName: "architect.eth",
  avatar: "https://example.com/avatar.png",
  bio: "Building the future of decentralized AI",
  twitter: "@architect_ai",
  github: "architect-ai",
  discord: "architect#1234",
  verified: true,
  reputationScore: 98.7,
  transactionCount: 1247,
  firstTransaction: new Date(Date.now() - 86400000 * 365),
  lastActivity: new Date(),
  labels: ["DeFi Power User", "NFT Collector", "Early Adopter"],
  riskScore: 12.3,
  trustScore: 94.5,
});

const generateMockBlockchainMetrics = (): BlockchainMetrics => ({
  gasPrice: 150,
  gasPriceGwei: 150,
  networkHashrate: 850000000,
  blockTime: 12.5,
  pendingTransactions: 125000,
  networkDifficulty: 15000000000000,
  totalSupply: 120000000,
  circulatingSupply: 120000000,
  marketCap: 414000000000,
  volume24h: 15000000000,
});

// ============================================================================
// SUB-COMPONENTS — MODULAR BLOCKCHAIN INTERFACE
// ============================================================================

// --- Wallet Connection Component ---
const WalletConnection: React.FC<{
  wallet: WalletInfo;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: (network: string) => void;
}> = ({ wallet, onConnect, onDisconnect, onSwitchNetwork }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">WALLET CONNECTION</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          wallet.connected ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"
        }`}>
          {wallet.connected ? "CONNECTED" : "DISCONNECTED"}
        </div>
      </div>

      {wallet.connected ? (
        <div className="space-y-4">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">Address</span>
              <div className="flex gap-2">
                <button onClick={copyAddress} className="p-1 hover:bg-white/5 rounded">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                </button>
                <button onClick={() => setShowQR(!showQR)} className="p-1 hover:bg-white/5 rounded">
                  <QrCode className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
            <div className="text-sm font-mono text-cyan-400">{formatAddress(wallet.address, 8)}</div>
          </div>

          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-black/40 rounded-lg p-4 border border-white/10 flex justify-center"
              >
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-black" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">BALANCE</div>
              <div className="text-lg font-bold text-white">{wallet.balance.toFixed(4)} ETH</div>
              <div className="text-xs text-cyan-400">${(wallet.balance * 3456.78).toFixed(2)}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-white/40 mb-1">NETWORK</div>
              <div className="text-sm font-bold text-white">{getNetworkName(wallet.chainId)}</div>
              <div className="text-xs text-purple-400">{wallet.provider}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDisconnect}
              className="flex-1 px-4 py-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded-lg text-xs font-bold hover:bg-red-600/30 transition-all"
            >
              DISCONNECT
            </button>
            <select
              value={wallet.network}
              onChange={(e) => onSwitchNetwork(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/40 border border-white/10 text-white rounded-lg text-xs font-bold"
            >
              <option value="ETHEREUM">Ethereum</option>
              <option value="POLYGON">Polygon</option>
              <option value="BSC">BSC</option>
              <option value="ARBITRUM">Arbitrum</option>
              <option value="OPTIMISM">Optimism</option>
            </select>
          </div>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          CONNECT WALLET
        </button>
      )}
    </motion.div>
  );
};

// --- Token Portfolio Component ---
const TokenPortfolio: React.FC<{ tokens: Token[] }> = ({ tokens }) => {
  const totalValue = tokens.reduce((sum, t) => sum + t.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RechartsPieChart className="w-6 h-6 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">TOKEN PORTFOLIO</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">TOTAL VALUE</div>
          <div className="text-lg font-bold text-purple-400">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      <div className="space-y-3">
        {tokens.map((token, i) => (
          <motion.div
            key={token.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {token.symbol[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{token.symbol}</div>
                  <div className="text-[10px] text-white/60">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{formatBalance(token.balance)}</div>
                <div className="text-xs text-purple-400">{formatCurrency(token.value)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">${token.price.toFixed(2)}</span>
              <span className={token.change24h >= 0 ? "text-green-400" : "text-red-400"}>
                {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Transaction History Component ---
const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const [filter, setFilter] = useState<"ALL" | "SEND" | "RECEIVE" | "SWAP">("ALL");

  const filteredTx = filter === "ALL" ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">TRANSACTION HISTORY</h3>
        </div>
        <div className="flex gap-2">
          {(["ALL", "SEND", "RECEIVE", "SWAP"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                filter === f ? "bg-cyan-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTx.slice(0, 15).map((tx, i) => (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black/30 rounded-lg p-3 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  tx.status === "CONFIRMED" ? "bg-green-400" : tx.status === "PENDING" ? "bg-yellow-400" : "bg-red-400"
                }`} />
                <span className="text-xs font-bold text-white">{tx.type}</span>
                <span className="text-[10px] text-white/40">{tx.tokenSymbol}</span>
              </div>
              <div className={`text-xs font-bold ${
                tx.type === "RECEIVE" ? "text-green-400" : "text-red-400"
              }`}>
                {tx.type === "RECEIVE" ? "+" : "-"}{tx.value.toFixed(4)}
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span>{formatTimestamp(tx.timestamp)}</span>
              <span>{tx.confirmations} confirmations</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- NFT Gallery Component ---
const NFTGallery: React.FC<{ nfts: NFT[] }> = ({ nfts }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">NFT GALLERY</h3>
        </div>
        <div className="text-xs text-white/60">{nfts.length} items</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {nfts.map((nft, i) => (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/30 rounded-lg overflow-hidden border border-white/5 hover:border-green-500/30 transition-all"
          >
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <div className="text-xs text-white/60">{nft.collection}</div>
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs font-bold text-white mb-1">{nft.name}</div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/40">Floor: {nft.floorPrice} ETH</span>
                {nft.rarity && (
                  <span className="text-green-400">Rarity: {nft.rarity}%</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Staking Positions Component ---
const StakingPositions: React.FC<{ positions: StakingPosition[] }> = ({ positions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-red-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">STAKING POSITIONS</h3>
        </div>
      </div>

      <div className="space-y-3">
        {positions.map((pos, i) => (
          <motion.div
            key={pos.protocol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/30 rounded-lg p-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">{pos.protocol}</div>
                <div className={`text-[10px] ${
                  pos.status === "ACTIVE" ? "text-green-400" : pos.status === "LOCKED" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {pos.status}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{pos.stakedAmount.toFixed(4)} ETH</div>
                <div className="text-xs text-red-400">APR: {pos.apr}%</div>
              </div>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${(pos.rewards / pos.stakedAmount) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/40">
              <span>Rewards: {pos.rewards.toFixed(4)} ETH</span>
              {pos.unlockDate && (
                <span>Unlocks: {formatTimestamp(pos.unlockDate)}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Security Alerts Component ---
const SecurityAlerts: React.FC<{ alerts: SecurityAlert[] }> = ({ alerts }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <h3 className="text-sm font-bold text-white tracking-wider">SECURITY ALERTS</h3>
        </div>
        <div className="text-xs text-white/60">{alerts.filter((a) => !a.dismissed).length} active</div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-black/30 rounded-lg p-3 border ${
              alert.severity === "CRITICAL" ? "border-red-500/50" :
              alert.severity === "HIGH" ? "border-orange-500/50" :
              alert.severity === "MEDIUM" ? "border-yellow-500/50" :
              "border-blue-500/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === "CRITICAL" ? "bg-red-400" :
                  alert.severity === "HIGH" ? "bg-orange-400" :
                  alert.severity === "MEDIUM" ? "bg-yellow-400" :
                  "bg-blue-400"
                }`} />
                <span className="text-xs font-bold text-white">{alert.type.replace(/_/g, " ")}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                alert.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                alert.severity === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                alert.severity === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-blue-500/20 text-blue-400"
              }`}>
                {alert.severity}
              </span>
            </div>
            <div className="text-xs text-white/80 mb-2">{alert.message}</div>
            <div className="text-[10px] text-white/40">{formatTimestamp(alert.timestamp)}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN BLOCKCHAIN IDENTITY COMPONENT
// ============================================================================

export default function BlockchainIdentity() {
  const [wallet, setWallet] = useState<WalletInfo>(generateMockWallet());
  const [tokens, setTokens] = useState<Token[]>(generateMockTokens());
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions());
  const [nfts, setNfts] = useState<NFT[]>(generateMockNFTs());
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(generateMockStakingPositions());
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(generateMockSecurityAlerts());
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile>(generateMockIdentityProfile());
  const [blockchainMetrics, setBlockchainMetrics] = useState<BlockchainMetrics>(generateMockBlockchainMetrics());
  const [activeTab, setActiveTab] = useState<"overview" | "tokens" | "nfts" | "staking" | "security">("overview");

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchainMetrics((prev) => ({
        ...prev,
        gasPrice: Math.max(20, prev.gasPrice + (Math.random() - 0.5) * 20),
        gasPriceGwei: Math.max(20, prev.gasPriceGwei + (Math.random() - 0.5) * 20),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    setWallet((prev) => ({ ...prev, connected: true }));
  };

  const handleDisconnect = () => {
    setWallet((prev) => ({ ...prev, connected: false }));
  };

  const handleSwitchNetwork = (network: string) => {
    const chainIds: Record<string, number> = {
      ETHEREUM: 1,
      POLYGON: 137,
      BSC: 56,
      ARBITRUM: 42161,
      OPTIMISM: 10,
    };
    setWallet((prev) => ({
      ...prev,
      network: network as any,
      chainId: chainIds[network],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-black text-white tracking-wider">BLOCKCHAIN IDENTITY</h2>
              <p className="text-xs text-white/60">Phase 14 • Sovereign Wallet • Web3 Integration</p>
            </div>
          </div>
          {identityProfile.verified && (
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/50">
              VERIFIED IDENTITY
            </div>
          )}
        </div>

        {/* Network Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">GAS PRICE</div>
            <div className="text-lg font-bold text-cyan-400">{blockchainMetrics.gasPriceGwei.toFixed(0)} Gwei</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">BLOCK TIME</div>
            <div className="text-lg font-bold text-purple-400">{blockchainMetrics.blockTime.toFixed(1)}s</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">PENDING TX</div>
            <div className="text-lg font-bold text-yellow-400">{(blockchainMetrics.pendingTransactions / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">REPUTATION</div>
            <div className="text-lg font-bold text-green-400">{identityProfile.reputationScore.toFixed(1)}%</div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(["overview", "tokens", "nfts", "staking", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
              activeTab === tab ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/50" : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-12 gap-6"
          >
            <div className="col-span-12 lg:col-span-4">
              <WalletConnection
                wallet={wallet}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSwitchNetwork={handleSwitchNetwork}
              />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <TokenPortfolio tokens={tokens} />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <TransactionHistory transactions={transactions} />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <StakingPositions positions={stakingPositions} />
            </div>
          </motion.div>
        )}

        {activeTab === "tokens" && (
          <motion.div
            key="tokens"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TokenPortfolio tokens={tokens} />
          </motion.div>
        )}

        {activeTab === "nfts" && (
          <motion.div
            key="nfts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NFTGallery nfts={nfts} />
          </motion.div>
        )}

        {activeTab === "staking" && (
          <motion.div
            key="staking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StakingPositions positions={stakingPositions} />
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SecurityAlerts alerts={securityAlerts} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}