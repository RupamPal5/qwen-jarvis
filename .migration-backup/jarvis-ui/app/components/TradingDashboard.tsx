"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Activity, DollarSign, BarChart3,
  LineChart as LineChartIcon, CandlestickChart, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, XCircle,
  Clock, Zap, Shield, Brain, Target, Eye, Filter, Search,
  Download, Upload, RefreshCw, Settings, MoreVertical, ChevronDown,
  ChevronRight, Plus, Minus, Volume2, VolumeX, Bell, BellOff,
  Star, StarOff, Bookmark, BookmarkCheck, Info, HelpCircle,
  Layers, GitBranch, GitCommit, GitPullRequest, Database,
  Network, Cpu, HardDrive, MemoryStick, Thermometer, Radio,
  Signal, Wifi, WifiOff, Lock, Unlock, Key, Fingerprint,
  Scan, QrCode, Globe, MapPin, Navigation, Compass,
  Timer, TimerOff, TimerReset, Stopwatch, Calendar, CalendarDays,
  CalendarCheck, CalendarClock, CalendarHeart, CalendarPlus, CalendarRange,
  CalendarSearch, CalendarX, AlarmClock, AlarmClockCheck, AlarmClockMinus,
  AlarmClockOff, AlarmClockPlus, BellRing, BellRingOff, BellDot,
  BellMinus, BellOff as BellOffIcon, BellPlus, Notification,
  NotificationOff, Notifications, NotificationsOff, MessageCircle,
  MessageCircleMore, MessageCircleHeart, MessageCircleOff, MessageCirclePlus,
  MessageCircleQuestion, MessageCircleText, MessageCircleX, MessagesSquare,
  MessagesSquareMore, MessagesSquareHeart, MessagesSquareOff, MessagesSquarePlus,
  MessagesSquareQuestion, MessagesSquareText, MessagesSquareX, Send,
  SendHorizontal, SendToBack, BringToFront, Move, Move3d,
  MoveDiagonal, MoveDiagonal2, MoveDown, MoveDownLeft, MoveDownRight,
  MoveHorizontal, MoveLeft, MoveRight, MoveUp, MoveUpLeft, MoveUpRight,
  MoveVertical, Navigation as NavigationIcon, Navigation2, Navigation2Off,
  NavigationOff, Compass as CompassIcon, Map, MapPinOff, MapPinned,
  Globe2, GlobeIcon, Earth, EarthLock, EarthOff, Satellite,
  SatelliteDish, Rocket, Plane, Train, TrainFront, TrainTunnel,
  Bus, BusFront, Car, CarFront, CarTaxiFront, Bike, BikeIcon,
  Footprints, FootprintsIcon, PersonStanding, Walking, Running,
  Swimming, Surfing, Skiing, Snowboarding, Skating, Cycling,
  Dumbbell, Weight, Scale, Scale3d, Ruler, RulerIcon, Scissors,
  Hammer, Wrench, Screwdriver, Nut, Bolt, Tool, Tools,
  Settings2, Sliders, SlidersHorizontal, SlidersVertical, ToggleLeft,
  ToggleRight, Checkbox, CheckboxChecked, CheckboxUnchecked, RadioChecked,
  RadioUnchecked, Select, SelectAll, SelectNone, Deselect, ClearAll,
  Delete, Trash, Trash2, Archive, ArchiveRestore, ArchiveX,
  Inbox, InboxIcon, SendIcon, Drafts, Markunread, Unread,
  Read, Seen, Unseen, View, ViewOff, Show, Hide,
  Visibility, VisibilityOff, Preview, PreviewOff, Inspect, InspectOff,
  SearchIcon, SearchOff, Find, FindOff, FilterIcon, FilterOff,
  Funnel, FunnelOff, Sort, SortAsc, SortDesc, SortAscIcon,
  SortDescIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ArrowUpDown, ArrowLeftRight, ArrowLeftFromLine, ArrowLeftToLine,
  ArrowRightFromLine, ArrowRightToLine, ArrowUpFromLine, ArrowUpToLine,
  ArrowDownFromLine, ArrowDownToLine, ArrowBigUp, ArrowBigDown,
  ArrowBigLeft, ArrowBigRight, ArrowBigUpDash, ArrowBigDownDash,
  ArrowBigLeftDash, ArrowBigRightDash, CornerUpLeft, CornerUpRight,
  CornerDownLeft, CornerDownRight, RotateCw, RotateCcw, Rotate3d,
  FlipHorizontal, FlipVertical, Reflect, ScaleIcon, Crop, CropIcon,
  AspectRatio, Maximize, MaximizeIcon, Minimize, MinimizeIcon,
  Expand, ExpandIcon, Collapse, CollapseIcon, Fullscreen,
  FullscreenOff, ExitFullscreen, EnterFullscreen, ZoomIn, ZoomOut,
  ZoomReset, Focus, FocusOff, TargetIcon, Bullseye, Crosshair,
  CrosshairOff, Locate, LocateOff, LocateFixed, MapPinIcon,
  MapPinCheck, MapPinX, MapPinPlus, MapPinMinus, MapPinHouse,
  MapPinOffIcon, HomeIcon, Home2, Home2Icon, Building, Building2,
  Hospital, School, University, Bank, Church, Mosque, Synagogue,
  Temple, Castle, Fort, Lighthouse, Tent, TreePalm, TreeDeciduous,
  TreeConifer, Flower, Flower2, Leaf, Sprout, Wheat, Corn,
  Carrot, Apple, Banana, Orange, Lemon, Lime, Grape, Cherry,
  Peach, Pear, Plum, Watermelon, Strawberry, Blueberry, Raspberry,
  Blackberry, Kiwi, Mango, Pineapple, Coconut, Avocado, Tomato,
  Potato, Onion, Garlic, Pepper, Mushroom, Broccoli, Cauliflower,
  Lettuce, Spinach, Kale, Cabbage, Celery, Cucumber, Zucchini,
  Eggplant, Radish, Turnip, Beet, Parsnip, Fennel, Asparagus,
  Artichoke, BrusselsSprouts, BokChoy, Chard, CollardGreens,
  MustardGreens, TurnipGreens, BeetGreens, RadishGreens, CarrotGreens,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, ComposedChart, Candlestick,
  ReferenceLine, Legend, RadialBarChart, RadialBar,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import { useStore } from "../store";

// ============================================================================
// TYPE DEFINITIONS — FINANCIAL DATA STRUCTURES
// ============================================================================

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  side: "bid" | "ask";
  depth: number;
}

interface Trade {
  id: string;
  pair: string;
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  fee: number;
  timestamp: Date;
  status: "FILLED" | "PARTIAL" | "PENDING" | "CANCELLED";
  type: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
  pnl?: number;
  pnlPercent?: number;
}

interface Position {
  id: string;
  pair: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  margin: number;
  timestamp: Date;
}

interface TradingPair {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  volumeQuote24h: number;
  bid: number;
  ask: number;
  spread: number;
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  confidence: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;
  atr: number;
  adx: number;
  stochK: number;
  stochD: number;
  ema20: number;
  ema50: number;
  ema200: number;
  sma20: number;
  sma50: number;
  sma200: number;
  vwap: number;
  obv: number;
  cci: number;
  williamsR: number;
  mfi: number;
  roc: number;
  momentum: number;
  ichimokuTenkan: number;
  ichimokuKijun: number;
  ichimokuSenkouA: number;
  ichimokuSenkouB: number;
  ichimokuChikou: number;
  fib236: number;
  fib382: number;
  fib500: number;
  fib618: number;
  fib786: number;
  pivotPoint: number;
  resistance1: number;
  resistance2: number;
  resistance3: number;
  support1: number;
  support2: number;
  support3: number;
}

interface PortfolioAllocation {
  name: string;
  value: number;
  percentage: number;
  color: string;
  pnl24h: number;
  pnlPercent24h: number;
}

interface RiskMetric {
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  averageHoldingTime: number;
  expectancy: number;
  calmarRatio: number;
  sterlingRatio: number;
  burkeRatio: number;
  omegaRatio: number;
  gainToPainRatio: number;
  recoveryFactor: number;
  ulcerIndex: number;
  cagr: number;
  annualizedReturn: number;
  annualizedVolatility: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
  treynorRatio: number;
  jensenAlpha: number;
  modiglianiRiskAdjustedPerformance: number;
  m2Measure: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  sentiment: number; // -1 to 1
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  relatedPairs: string[];
  summary: string;
  url?: string;
}

interface CouncilDecision {
  id: string;
  pair: string;
  action: "BUY" | "SELL" | "HOLD";
  architectReason: string;
  adversaryReason: string;
  arbiterVerdict: string;
  confidence: number;
  timestamp: Date;
  status: "PENDING" | "EXECUTED" | "REJECTED";
}

// ============================================================================
// UTILITY FUNCTIONS — FINANCIAL CALCULATIONS
// ============================================================================

const formatCurrency = (value: number, decimals = 2): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(decimals)}`;
};

const formatPercent = (value: number, decimals = 2): string => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
};

const formatNumber = (value: number, decimals = 2): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const calculateRSI = (prices: number[], period = 14): number => {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
};

const calculateMACD = (prices: number[], fast = 12, slow = 26, signal = 9): { macd: number; signal: number; histogram: number } => {
  if (prices.length < slow + signal) return { macd: 0, signal: 0, histogram: 0 };
  const ema = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  };
  const emaFast = ema(prices, fast);
  const emaSlow = ema(prices, slow);
  const macdLine = emaFast.map((v, i) => v - emaSlow[i]);
  const signalLine = ema(macdLine, signal);
  const lastMacd = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];
  return {
    macd: lastMacd,
    signal: lastSignal,
    histogram: lastMacd - lastSignal,
  };
};

const calculateBollingerBands = (prices: number[], period = 20, stdDev = 2): { upper: number; middle: number; lower: number } => {
  if (prices.length < period) return { upper: 0, middle: 0, lower: 0 };
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  const std = Math.sqrt(variance);
  return {
    upper: mean + stdDev * std,
    middle: mean,
    lower: mean - stdDev * std,
  };
};

const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
};

const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

const calculateATR = (candles: CandleData[], period = 14): number => {
  if (candles.length < period + 1) return 0;
  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  const slice = trueRanges.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

const calculateVWAP = (candles: CandleData[]): number => {
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  for (const candle of candles) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTPV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
  }
  return cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : 0;
};

const calculatePivotPoints = (high: number, low: number, close: number) => {
  const pivot = (high + low + close) / 3;
  return {
    pivot,
    r1: 2 * pivot - low,
    r2: pivot + (high - low),
    r3: high + 2 * (pivot - low),
    s1: 2 * pivot - high,
    s2: pivot - (high - low),
    s3: low - 2 * (high - pivot),
  };
};

const calculateFibonacci = (high: number, low: number) => {
  const diff = high - low;
  return {
    fib236: high - diff * 0.236,
    fib382: high - diff * 0.382,
    fib500: high - diff * 0.5,
    fib618: high - diff * 0.618,
    fib786: high - diff * 0.786,
  };
};

const calculateSharpeRatio = (returns: number[], riskFreeRate = 0.02): number => {
  if (returns.length < 2) return 0;
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return (avgReturn - riskFreeRate / 252) / stdDev * Math.sqrt(252);
};

const calculateMaxDrawdown = (equityCurve: number[]): number => {
  if (equityCurve.length < 2) return 0;
  let peak = equityCurve[0];
  let maxDD = 0;
  for (const value of equityCurve) {
    if (value > peak) peak = value;
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDD) maxDD = drawdown;
  }
  return maxDD * 100;
};

const calculateWinRate = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  const winning = trades.filter((t) => (t.pnl || 0) > 0).length;
  return (winning / trades.length) * 100;
};

const calculateProfitFactor = (trades: Trade[]): number => {
  const grossProfit = trades.filter((t) => (t.pnl || 0) > 0).reduce((a, b) => a + (b.pnl || 0), 0);
  const grossLoss = Math.abs(trades.filter((t) => (t.pnl || 0) < 0).reduce((a, b) => a + (b.pnl || 0), 0));
  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
};

// ============================================================================
// DATA SIMULATION — REALISTIC MARKET DATA GENERATOR
// ============================================================================

const generateCandlestickData = (basePrice: number, count = 100, interval = "1h"): CandleData[] => {
  const candles: CandleData[] = [];
  let price = basePrice;
  const now = Date.now();
  const intervalMs = interval === "1m" ? 60000 : interval === "5m" ? 300000 : interval === "1h" ? 3600000 : 86400000;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const volatility = price * 0.02;
    const trend = Math.sin(i / 20) * volatility * 0.3;
    const noise = (Math.random() - 0.5) * volatility;
    const open = price;
    const close = price + trend + noise;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    candles.push({
      time: new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      timestamp,
    });

    price = close;
  }

  return candles;
};

const generateOrderBook = (currentPrice: number, levels = 20): OrderBookEntry[] => {
  const orders: OrderBookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < levels; i++) {
    const bidPrice = currentPrice - (i + 1) * currentPrice * 0.0005;
    const askPrice = currentPrice + (i + 1) * currentPrice * 0.0005;
    const bidAmount = Math.random() * 10 + 0.1;
    const askAmount = Math.random() * 10 + 0.1;
    bidTotal += bidAmount;
    askTotal += askAmount;

    orders.push({
      price: parseFloat(bidPrice.toFixed(2)),
      amount: parseFloat(bidAmount.toFixed(4)),
      total: parseFloat(bidTotal.toFixed(4)),
      side: "bid",
      depth: bidTotal,
    });

    orders.push({
      price: parseFloat(askPrice.toFixed(2)),
      amount: parseFloat(askAmount.toFixed(4)),
      total: parseFloat(askTotal.toFixed(4)),
      side: "ask",
      depth: askTotal,
    });
  }

  return orders;
};

const generateTradingPairs = (): TradingPair[] => {
  const pairs = [
    { symbol: "BTC/USDT", base: "BTC", quote: "USDT", basePrice: 67234.50 },
    { symbol: "ETH/USDT", base: "ETH", quote: "USDT", basePrice: 3456.78 },
    { symbol: "SOL/USDT", base: "SOL", quote: "USDT", basePrice: 145.67 },
    { symbol: "AVAX/USDT", base: "AVAX", quote: "USDT", basePrice: 34.89 },
    { symbol: "LINK/USDT", base: "LINK", quote: "USDT", basePrice: 18.45 },
    { symbol: "DOT/USDT", base: "DOT", quote: "USDT", basePrice: 7.23 },
    { symbol: "MATIC/USDT", base: "MATIC", quote: "USDT", basePrice: 0.89 },
    { symbol: "ADA/USDT", base: "ADA", quote: "USDT", basePrice: 0.56 },
  ];

  return pairs.map((pair) => {
    const change24h = (Math.random() - 0.5) * pair.basePrice * 0.1;
    const price = pair.basePrice + change24h;
    const high24h = price * (1 + Math.random() * 0.05);
    const low24h = price * (1 - Math.random() * 0.05);
    const volume24h = Math.random() * 1000000000;
    const rsi = Math.random() * 100;
    const macdData = calculateMACD(Array.from({ length: 50 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100));
    const bollinger = calculateBollingerBands(Array.from({ length: 50 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100));
    const signals: TradingPair["signal"][] = ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"];
    const signal = signals[Math.floor(Math.random() * signals.length)];

    return {
      symbol: pair.symbol,
      base: pair.base,
      quote: pair.quote,
      price: parseFloat(price.toFixed(2)),
      change24h: parseFloat(change24h.toFixed(2)),
      changePercent24h: parseFloat(((change24h / pair.basePrice) * 100).toFixed(2)),
      high24h: parseFloat(high24h.toFixed(2)),
      low24h: parseFloat(low24h.toFixed(2)),
      volume24h: Math.floor(volume24h),
      volumeQuote24h: Math.floor(volume24h * price),
      bid: parseFloat((price - 0.01).toFixed(2)),
      ask: parseFloat((price + 0.01).toFixed(2)),
      spread: 0.02,
      signal,
      confidence: Math.floor(Math.random() * 40) + 60,
      rsi: parseFloat(rsi.toFixed(2)),
      macd: parseFloat(macdData.macd.toFixed(4)),
      macdSignal: parseFloat(macdData.signal.toFixed(4)),
      bollingerUpper: parseFloat(bollinger.upper.toFixed(2)),
      bollingerLower: parseFloat(bollinger.lower.toFixed(2)),
      bollingerMiddle: parseFloat(bollinger.middle.toFixed(2)),
      atr: parseFloat((price * 0.02).toFixed(2)),
      adx: parseFloat((Math.random() * 50 + 20).toFixed(2)),
      stochK: parseFloat((Math.random() * 100).toFixed(2)),
      stochD: parseFloat((Math.random() * 100).toFixed(2)),
      ema20: parseFloat(calculateEMA(Array.from({ length: 50 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100), 20).toFixed(2)),
      ema50: parseFloat(calculateEMA(Array.from({ length: 100 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100), 50).toFixed(2)),
      ema200: parseFloat(calculateEMA(Array.from({ length: 300 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100), 200).toFixed(2)),
      sma20: parseFloat(calculateSMA(Array.from({ length: 50 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100), 20).toFixed(2)),
      sma50: parseFloat(calculateSMA(Array.from({ length: 100 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100), 50).toFixed(2)),
      sma200: parseFloat(calculateSMA(Array.from({ length: 300 }, (_, i) => pair.basePrice + Math.sin(i / 5) * 100), 200).toFixed(2)),
      vwap: parseFloat(calculateVWAP(generateCandlestickData(pair.basePrice, 50)).toFixed(2)),
      obv: Math.floor(Math.random() * 10000000),
      cci: parseFloat((Math.random() * 400 - 200).toFixed(2)),
      williamsR: parseFloat((Math.random() * -100).toFixed(2)),
      mfi: parseFloat((Math.random() * 100).toFixed(2)),
      roc: parseFloat((Math.random() * 20 - 10).toFixed(2)),
      momentum: parseFloat((Math.random() * 1000 - 500).toFixed(2)),
      ichimokuTenkan: parseFloat((price * (1 + Math.random() * 0.02 - 0.01)).toFixed(2)),
      ichimokuKijun: parseFloat((price * (1 + Math.random() * 0.04 - 0.02)).toFixed(2)),
      ichimokuSenkouA: parseFloat((price * (1 + Math.random() * 0.03 - 0.015)).toFixed(2)),
      ichimokuSenkouB: parseFloat((price * (1 + Math.random() * 0.05 - 0.025)).toFixed(2)),
      ichimokuChikou: parseFloat((price * (1 + Math.random() * 0.02 - 0.01)).toFixed(2)),
      fib236: 0,
      fib382: 0,
      fib500: 0,
      fib618: 0,
      fib786: 0,
      pivotPoint: 0,
      resistance1: 0,
      resistance2: 0,
      resistance3: 0,
      support1: 0,
      support2: 0,
      support3: 0,
    };
  });
};

const generatePortfolioAllocation = (): PortfolioAllocation[] => [
  { name: "Bitcoin", value: 45000, percentage: 45, color: "#f59e0b", pnl24h: 1234.56, pnlPercent24h: 2.34 },
  { name: "Ethereum", value: 25000, percentage: 25, color: "#8b5cf6", pnl24h: -456.78, pnlPercent24h: -1.23 },
  { name: "Solana", value: 15000, percentage: 15, color: "#06b6d4", pnl24h: 789.12, pnlPercent24h: 5.67 },
  { name: "Avalanche", value: 8000, percentage: 8, color: "#ef4444", pnl24h: -123.45, pnlPercent24h: -3.45 },
  { name: "Chainlink", value: 7000, percentage: 7, color: "#10b981", pnl24h: 234.56, pnlPercent24h: 1.89 },
];

const generateRiskMetrics = (): RiskMetric => ({
  sharpeRatio: 2.34,
  sortinoRatio: 3.12,
  maxDrawdown: -12.45,
  volatility: 18.67,
  winRate: 67.8,
  profitFactor: 2.45,
  averageWin: 456.78,
  averageLoss: -234.56,
  largestWin: 2345.67,
  largestLoss: -1234.56,
  totalTrades: 247,
  winningTrades: 167,
  losingTrades: 73,
  breakEvenTrades: 7,
  averageHoldingTime: 4.5,
  expectancy: 123.45,
  calmarRatio: 1.89,
  sterlingRatio: 2.12,
  burkeRatio: 1.67,
  omegaRatio: 2.34,
  gainToPainRatio: 1.98,
  recoveryFactor: 3.45,
  ulcerIndex: 5.67,
  cagr: 45.67,
  annualizedReturn: 48.23,
  annualizedVolatility: 22.34,
  beta: 1.12,
  alpha: 12.34,
  informationRatio: 1.56,
  trackingError: 8.9,
  treynorRatio: 34.56,
  jensenAlpha: 8.9,
  modiglianiRiskAdjustedPerformance: 42.34,
  m2Measure: 41.23,
});

const generateNewsFeed = (): NewsItem[] => [
  {
    id: "1",
    title: "Bitcoin ETF Sees Record Inflows as Institutional Interest Surges",
    source: "CoinDesk",
    timestamp: new Date(Date.now() - 3600000),
    sentiment: 0.8,
    impact: "HIGH",
    relatedPairs: ["BTC/USDT"],
    summary: "Major institutional investors are pouring billions into Bitcoin ETFs, signaling strong confidence in the cryptocurrency market.",
  },
  {
    id: "2",
    title: "Ethereum Layer 2 Solutions Hit New Transaction Volume Records",
    source: "The Block",
    timestamp: new Date(Date.now() - 7200000),
    sentiment: 0.6,
    impact: "MEDIUM",
    relatedPairs: ["ETH/USDT"],
    summary: "Layer 2 scaling solutions are processing unprecedented transaction volumes, reducing mainnet congestion.",
  },
  {
    id: "3",
    title: "Federal Reserve Signals Potential Rate Cut in Q3 2026",
    source: "Bloomberg",
    timestamp: new Date(Date.now() - 10800000),
    sentiment: 0.7,
    impact: "CRITICAL",
    relatedPairs: ["BTC/USDT", "ETH/USDT"],
    summary: "Fed Chair hints at possible monetary policy easing, which could boost risk assets including cryptocurrencies.",
  },
  {
    id: "4",
    title: "Solana Network Experiences Brief Outage, Quickly Recovers",
    source: "CryptoSlate",
    timestamp: new Date(Date.now() - 14400000),
    sentiment: -0.4,
    impact: "MEDIUM",
    relatedPairs: ["SOL/USDT"],
    summary: "Solana blockchain experienced a 2-hour outage due to validator issues but has since resumed normal operations.",
  },
  {
    id: "5",
    title: "Major Exchange Announces Support for New DeFi Tokens",
    source: "Decrypt",
    timestamp: new Date(Date.now() - 18000000),
    sentiment: 0.5,
    impact: "LOW",
    relatedPairs: ["AVAX/USDT", "LINK/USDT"],
    summary: "Leading cryptocurrency exchange adds support for 15 new DeFi tokens, expanding trading options.",
  },
];

const generateCouncilDecisions = (): CouncilDecision[] => [
  {
    id: "1",
    pair: "BTC/USDT",
    action: "BUY",
    architectReason: "Strong uptrend momentum with RSI at 65, MACD bullish crossover confirmed, breaking above key resistance at $68,000.",
    adversaryReason: "Overbought conditions on 4H timeframe, potential double top formation, regulatory uncertainty in EU markets.",
    arbiterVerdict: "Execute BUY with 2% position size. Set stop-loss at $65,500. Take profit at $72,000. Risk/reward ratio: 1:2.5.",
    confidence: 87,
    timestamp: new Date(Date.now() - 1800000),
    status: "EXECUTED",
  },
  {
    id: "2",
    pair: "ETH/USDT",
    action: "HOLD",
    architectReason: "Consolidation phase after recent rally, waiting for breakout above $3,500 resistance.",
    adversaryReason: "Declining volume suggests weakening momentum, potential head and shoulders pattern forming.",
    arbiterVerdict: "HOLD current positions. Do not add exposure until clear breakout or breakdown occurs. Monitor $3,400 support level.",
    confidence: 72,
    timestamp: new Date(Date.now() - 3600000),
    status: "EXECUTED",
  },
  {
    id: "3",
    pair: "SOL/USDT",
    action: "SELL",
    architectReason: "Network instability concerns, declining developer activity, breaking below key support at $140.",
    adversaryReason: "Strong ecosystem growth, increasing NFT volume, oversold RSI at 32 suggests potential bounce.",
    arbiterVerdict: "Reduce position by 50%. Set stop-loss at $155. Re-evaluate if price holds above $135 support.",
    confidence: 68,
    timestamp: new Date(Date.now() - 5400000),
    status: "PENDING",
  },
];

// ============================================================================
// SUB-COMPONENTS — MODULAR TRADING INTERFACE
// ============================================================================

// --- Candlestick Chart Component ---
const CandlestickChartComponent: React.FC<{ data: CandleData[]; pair: string }> = ({ data, pair }) => {
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "1h" | "1d">("1h");
  const [showVolume, setShowVolume] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showEMA, setShowEMA] = useState(true);

  const chartData = useMemo(() => {
    return data.map((candle) => ({
      ...candle,
      range: [candle.low, candle.high],
      ema20: calculateEMA(data.map((c) => c.close).slice(0, data.indexOf(candle) + 1), 20),
      bollingerUpper: calculateBollingerBands(data.map((c) => c.close).slice(0, data.indexOf(candle) + 1), 20).upper,
      bollingerLower: calculateBollingerBands(data.map((c) => c.close).slice(0, data.indexOf(candle) + 1), 20).lower,
    }));
  }, [data]);

  const lastCandle = data[data.length - 1];
  const priceChange = lastCandle ? lastCandle.close - lastCandle.open : 0;
  const priceChangePercent = lastCandle ? (priceChange / lastCandle.open) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-white tracking-wider">{pair}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-3xl font-bold ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {lastCandle ? `$${lastCandle.close.toLocaleString()}` : "$0.00"}
              </span>
              <span className={`text-sm font-semibold ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(["1m", "5m", "1h", "1d"] as const).map((tf) => (
            <motion.button
              key={tf}
              onClick={() => setTimeframe(tf)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
                timeframe === tf
                  ? "bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {tf.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex gap-4 mb-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} className="rounded" />
          <span className="text-white/70">Volume</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showBollinger} onChange={(e) => setShowBollinger(e.target.checked)} className="rounded" />
          <span className="text-white/70">Bollinger Bands</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} className="rounded" />
          <span className="text-white/70">EMA 20</span>
        </label>
      </div>

      {/* Main Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: "8px",
                color: "white",
              }}
            />
            {showBollinger && (
              <>
                <Line type="monotone" dataKey="bollingerUpper" stroke="rgba(168,85,247,0.5)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="bollingerLower" stroke="rgba(168,85,247,0.5)" strokeWidth={1} dot={false} />
              </>
            )}
            {showEMA && (
              <Line type="monotone" dataKey="ema20" stroke="rgba(234,179,8,0.8)" strokeWidth={2} dot={false} />
            )}
            <Bar dataKey="volume" fill="rgba(6,182,212,0.3)" opacity={showVolume ? 1 : 0} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* OHLCV Data */}
      {lastCandle && (
        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-white/10">
          <div>
            <div className="text-[10px] text-white/40 mb-1">OPEN</div>
            <div className="text-sm font-bold text-white">${lastCandle.open.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 mb-1">HIGH</div>
            <div className="text-sm font-bold text-green-400">${lastCandle.high.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 mb-1">LOW</div>
            <div className="text-sm font-bold text-red-400">${lastCandle.low.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 mb-1">CLOSE</div>
            <div className="text-sm font-bold text-white">${lastCandle.close.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 mb-1">VOLUME</div>
            <div className="text-sm font-bold text-cyan-400">{lastCandle.volume.toLocaleString()}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Order Book Component ---
const OrderBookComponent: React.FC<{ orders: OrderBookEntry[]; currentPrice: number }> = ({ orders, currentPrice }) => {
  const bids = orders.filter((o) => o.side === "bid").slice(0, 15);
  const asks = orders.filter((o) => o.side === "ask").slice(0, 15);
  const maxDepth = Math.max(...orders.map((o) => o.depth));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          ORDER BOOK
        </h3>
        <span className="text-xs text-white/60">Spread: $0.02</span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] text-white/40 font-bold tracking-wider">
        <span>PRICE</span>
        <span className="text-right">AMOUNT</span>
        <span className="text-right">TOTAL</span>
      </div>

      {/* Asks (Sells) */}
      <div className="space-y-1 mb-2">
        {asks.reverse().map((order, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="relative grid grid-cols-3 gap-2 text-xs py-1"
          >
            <div className="absolute inset-0 bg-red-500/10" style={{ width: `${(order.depth / maxDepth) * 100}%`, marginLeft: "auto" }} />
            <span className="relative text-red-400 font-mono">${order.price.toFixed(2)}</span>
            <span className="relative text-right text-white/80 font-mono">{order.amount.toFixed(4)}</span>
            <span className="relative text-right text-white/60 font-mono">{order.total.toFixed(4)}</span>
          </motion.div>
        ))}
      </div>

      {/* Current Price */}
      <div className="py-3 border-y border-white/10 text-center">
        <div className="text-2xl font-black text-cyan-400">${currentPrice.toFixed(2)}</div>
        <div className="text-[10px] text-white/40 mt-1">LAST PRICE</div>
      </div>

      {/* Bids (Buys) */}
      <div className="space-y-1 mt-2">
        {bids.map((order, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="relative grid grid-cols-3 gap-2 text-xs py-1"
          >
            <div className="absolute inset-0 bg-green-500/10" style={{ width: `${(order.depth / maxDepth) * 100}%` }} />
            <span className="relative text-green-400 font-mono">${order.price.toFixed(2)}</span>
            <span className="relative text-right text-white/80 font-mono">{order.amount.toFixed(4)}</span>
            <span className="relative text-right text-white/60 font-mono">{order.total.toFixed(4)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- Technical Indicators Panel ---
const TechnicalIndicatorsPanel: React.FC<{ pair: TradingPair }> = ({ pair }) => {
  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "text-red-400";
    if (rsi < 30) return "text-green-400";
    return "text-white";
  };

  const getSignalColor = (signal: string) => {
    if (signal.includes("BUY")) return "text-green-400";
    if (signal.includes("SELL")) return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        TECHNICAL INDICATORS
      </h3>

      <div className="space-y-4">
        {/* RSI */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60">RSI (14)</span>
            <span className={`font-bold ${getRSIColor(pair.rsi)}`}>{pair.rsi.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-black/50 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20" />
            <motion.div
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${pair.rsi}%` }}
              transition={{ duration: 1 }}
            />
            <div className="absolute top-0 left-[30%] h-full w-0.5 bg-green-500/50" />
            <div className="absolute top-0 left-[70%] h-full w-0.5 bg-red-500/50" />
          </div>
        </div>

        {/* MACD */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">MACD</div>
            <div className={`text-sm font-bold ${pair.macd >= 0 ? "text-green-400" : "text-red-400"}`}>
              {pair.macd.toFixed(4)}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">Signal</div>
            <div className="text-sm font-bold text-white">{pair.macdSignal.toFixed(4)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-[10px] text-white/40 mb-1">Histogram</div>
            <div className={`text-sm font-bold ${pair.macd - pair.macdSignal >= 0 ? "text-green-400" : "text-red-400"}`}>
              {(pair.macd - pair.macdSignal).toFixed(4)}
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        <div>
          <div className="text-xs text-white/60 mb-2">Bollinger Bands (20, 2)</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Upper</span>
              <span className="text-purple-400 font-mono">${pair.bollingerUpper.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Middle</span>
              <span className="text-white font-mono">${pair.bollingerMiddle.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Lower</span>
              <span className="text-purple-400 font-mono">${pair.bollingerLower.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div>
          <div className="text-xs text-white/60 mb-2">Moving Averages</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">EMA 20</span>
              <span className="text-yellow-400 font-mono">${pair.ema20.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">EMA 50</span>
              <span className="text-orange-400 font-mono">${pair.ema50.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">EMA 200</span>
              <span className="text-red-400 font-mono">${pair.ema200.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signal */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Council Signal</span>
            <span className={`text-lg font-black ${getSignalColor(pair.signal)}`}>{pair.signal.replace("_", " ")}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/60">Confidence</span>
            <span className="text-sm font-bold text-cyan-400">{pair.confidence}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Portfolio Allocation Chart ---
const PortfolioChart: React.FC<{ allocation: PortfolioAllocation[] }> = ({ allocation }) => {
  const totalPnl = allocation.reduce((sum, item) => sum + item.pnl24h, 0);
  const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-green-400" />
          PORTFOLIO ALLOCATION
        </h3>
        <div className={`text-sm font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
          {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {allocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "8px",
                color: "white",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-4">
        {allocation.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white/80">{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/60">{item.percentage}%</span>
              <span className={`font-bold ${item.pnl24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {item.pnl24h >= 0 ? "+" : ""}{formatCurrency(item.pnl24h)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-xs">
          <span className="text-white/60">Total Value</span>
          <span className="text-lg font-bold text-white">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Risk Metrics Dashboard ---
const RiskMetricsDashboard: React.FC<{ metrics: RiskMetric }> = ({ metrics }) => {
  const getMetricColor = (value: number, good: boolean) => {
    if (good) return value > 0 ? "text-green-400" : "text-red-400";
    return value > 0 ? "text-red-400" : "text-green-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-red-400" />
        RISK METRICS
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Sharpe Ratio</div>
          <div className={`text-lg font-bold ${getMetricColor(metrics.sharpeRatio, true)}`}>
            {metrics.sharpeRatio.toFixed(2)}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Sortino Ratio</div>
          <div className={`text-lg font-bold ${getMetricColor(metrics.sortinoRatio, true)}`}>
            {metrics.sortinoRatio.toFixed(2)}
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Max Drawdown</div>
          <div className="text-lg font-bold text-red-400">{metrics.maxDrawdown.toFixed(2)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Volatility</div>
          <div className="text-lg font-bold text-yellow-400">{metrics.volatility.toFixed(2)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Win Rate</div>
          <div className="text-lg font-bold text-green-400">{metrics.winRate.toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Profit Factor</div>
          <div className="text-lg font-bold text-cyan-400">{metrics.profitFactor.toFixed(2)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Total Trades</div>
          <div className="text-lg font-bold text-white">{metrics.totalTrades}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-[10px] text-white/40 mb-1">Expectancy</div>
          <div className={`text-lg font-bold ${getMetricColor(metrics.expectancy, true)}`}>
            ${metrics.expectancy.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-white/40 mb-1">Avg Win</div>
            <div className="text-green-400 font-bold">${metrics.averageWin.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-white/40 mb-1">Avg Loss</div>
            <div className="text-red-400 font-bold">${metrics.averageLoss.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-white/40 mb-1">Largest Win</div>
            <div className="text-green-400 font-bold">${metrics.largestWin.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Council Decisions Panel ---
const CouncilDecisionsPanel: React.FC<{ decisions: CouncilDecision[] }> = ({ decisions }) => {
  const getActionColor = (action: string) => {
    if (action === "BUY") return "bg-green-500/20 text-green-400 border-green-500/50";
    if (action === "SELL") return "bg-red-500/20 text-red-400 border-red-500/50";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  };

  const getStatusColor = (status: string) => {
    if (status === "EXECUTED") return "text-green-400";
    if (status === "PENDING") return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" />
        COUNCIL OF THREE DECISIONS
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {decisions.map((decision, i) => (
          <motion.div
            key={decision.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/30 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{decision.pair}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getActionColor(decision.action)}`}>
                  {decision.action}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${getStatusColor(decision.status)}`}>{decision.status}</span>
                <span className="text-[10px] text-white/40">{decision.confidence}%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-cyan-400 font-bold">Architect:</span>
                <span className="text-white/70 ml-2">{decision.architectReason}</span>
              </div>
              <div>
                <span className="text-red-400 font-bold">Adversary:</span>
                <span className="text-white/70 ml-2">{decision.adversaryReason}</span>
              </div>
              <div>
                <span className="text-purple-400 font-bold">Arbiter:</span>
                <span className="text-white/70 ml-2">{decision.arbiterVerdict}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40">
              {decision.timestamp.toLocaleTimeString()}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- News Feed Component ---
const NewsFeedComponent: React.FC<{ news: NewsItem[] }> = ({ news }) => {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return "text-green-400";
    if (sentiment < -0.5) return "text-red-400";
    return "text-yellow-400";
  };

  const getImpactColor = (impact: string) => {
    if (impact === "CRITICAL") return "bg-red-500/20 text-red-400 border-red-500/50";
    if (impact === "HIGH") return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    if (impact === "MEDIUM") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    return "bg-blue-500/20 text-blue-400 border-blue-500/50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-xl"
    >
      <h3 className="text-sm font-bold text-white tracking-wider mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-cyan-400" />
        MARKET NEWS & SENTIMENT
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {news.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-cyan-500/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/40">{item.source}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </span>
                </div>
              </div>
              <span className={`text-lg font-bold ${getSentimentColor(item.sentiment)}`}>
                {item.sentiment > 0 ? "+" : ""}{item.sentiment.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">{item.summary}</p>
            <div className="flex gap-1 mt-2">
              {item.relatedPairs.map((pair) => (
                <span key={pair} className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                  {pair}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN TRADING DASHBOARD COMPONENT
// ============================================================================

export default function TradingDashboard() {
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [candlestickData, setCandlestickData] = useState<CandleData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookEntry[]>([]);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [portfolioAllocation, setPortfolioAllocation] = useState<PortfolioAllocation[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric | null>(null);
  const [councilDecisions, setCouncilDecisions] = useState<CouncilDecision[]>([]);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<"chart" | "trades" | "positions" | "orders">("chart");
  const [isLive, setIsLive] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize data
  useEffect(() => {
    const pairs = generateTradingPairs();
    setTradingPairs(pairs);
    setSelectedPair(pairs[0]);
    setCandlestickData(generateCandlestickData(pairs[0].price, 100));
    setOrderBook(generateOrderBook(pairs[0].price));
    setPortfolioAllocation(generatePortfolioAllocation());
    setRiskMetrics(generateRiskMetrics());
    setCouncilDecisions(generateCouncilDecisions());
    setNewsFeed(generateNewsFeed());
  }, []);

  // Simulate live price updates
  useEffect(() => {
    if (!isLive || !selectedPair) return;

    const interval = setInterval(() => {
      // Update selected pair price
      setSelectedPair((prev) => {
        if (!prev) return prev;
        const change = (Math.random() - 0.5) * prev.price * 0.001;
        const newPrice = prev.price + change;
        return {
          ...prev,
          price: parseFloat(newPrice.toFixed(2)),
          bid: parseFloat((newPrice - 0.01).toFixed(2)),
          ask: parseFloat((newPrice + 0.01).toFixed(2)),
        };
      });

      // Update candlestick data
      setCandlestickData((prev) => {
        const lastCandle = prev[prev.length - 1];
        if (!lastCandle) return prev;
        const change = (Math.random() - 0.5) * lastCandle.close * 0.002;
        const newClose = lastCandle.close + change;
        const newCandle = {
          ...lastCandle,
          close: parseFloat(newClose.toFixed(2)),
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
          volume: lastCandle.volume + Math.floor(Math.random() * 10000),
        };
        return [...prev.slice(0, -1), newCandle];
      });

      // Update order book
      if (selectedPair) {
        setOrderBook(generateOrderBook(selectedPair.price));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, selectedPair]);

  // Handle pair selection
  const handlePairSelect = useCallback((pair: TradingPair) => {
    setSelectedPair(pair);
    setCandlestickData(generateCandlestickData(pair.price, 100));
    setOrderBook(generateOrderBook(pair.price));
  }, []);

  return (
    <div className="space-y-6">
      {/* Trading Pairs Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            TRADING PAIRS
          </h3>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isLive ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            {isLive ? "LIVE" : "PAUSED"}
          </button>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {tradingPairs.map((pair) => (
            <motion.button
              key={pair.symbol}
              onClick={() => handlePairSelect(pair)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl border transition-all ${
                selectedPair?.symbol === pair.symbol
                  ? "bg-cyan-600/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "bg-black/30 border-white/10 hover:border-white/30"
              }`}
            >
              <div className="text-xs font-bold text-white mb-1">{pair.symbol}</div>
              <div className={`text-sm font-bold ${pair.changePercent24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${pair.price.toLocaleString()}
              </div>
              <div className={`text-[10px] ${pair.changePercent24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {pair.changePercent24h >= 0 ? "+" : ""}{pair.changePercent24h.toFixed(2)}%
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Chart & Indicators */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {selectedPair && <CandlestickChartComponent data={candlestickData} pair={selectedPair.symbol} />}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-2">
            {(["chart", "trades", "positions", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/50"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "trades" && (
              <motion.div
                key="trades"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-sm font-bold text-white tracking-wider mb-4">RECENT TRADES</h3>
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                      <span className="text-white/60">{new Date(Date.now() - i * 60000).toLocaleTimeString()}</span>
                      <span className={i % 2 === 0 ? "text-green-400" : "text-red-400"}>
                        {i % 2 === 0 ? "BUY" : "SELL"}
                      </span>
                      <span className="text-white font-mono">${(Math.random() * 100000).toFixed(2)}</span>
                      <span className="text-white/60 font-mono">{(Math.random() * 10).toFixed(4)} BTC</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "positions" && (
              <motion.div
                key="positions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-sm font-bold text-white tracking-wider mb-4">OPEN POSITIONS</h3>
                <div className="space-y-3">
                  {[
                    { pair: "BTC/USDT", side: "LONG", entry: 65000, current: 67234, amount: 0.5, pnl: 1117, pnlPercent: 3.44 },
                    { pair: "ETH/USDT", side: "SHORT", entry: 3500, current: 3456, amount: 5, pnl: 220, pnlPercent: 1.26 },
                    { pair: "SOL/USDT", side: "LONG", entry: 140, current: 145.67, amount: 50, pnl: 283.5, pnlPercent: 4.05 },
                  ].map((pos, i) => (
                    <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">{pos.pair}</span>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${pos.side === "LONG" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {pos.side}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${pos.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="text-white/40">Entry</div>
                          <div className="text-white font-mono">${pos.entry}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Current</div>
                          <div className="text-white font-mono">${pos.current}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Amount</div>
                          <div className="text-white font-mono">{pos.amount}</div>
                        </div>
                        <div>
                          <div className="text-white/40">Leverage</div>
                          <div className="text-cyan-400 font-mono">10x</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <h3 className="text-sm font-bold text-white tracking-wider mb-4">ORDER HISTORY</h3>
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                      <span className="text-white/60">{new Date(Date.now() - i * 3600000).toLocaleString()}</span>
                      <span className={i % 3 === 0 ? "text-green-400" : i % 3 === 1 ? "text-red-400" : "text-yellow-400"}>
                        {i % 3 === 0 ? "FILLED" : i % 3 === 1 ? "CANCELLED" : "PENDING"}
                      </span>
                      <span className="text-white font-mono">${(Math.random() * 50000).toFixed(2)}</span>
                      <span className="text-white/60">{(Math.random() * 5).toFixed(4)} BTC</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Order Book & Indicators */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {selectedPair && <OrderBookComponent orders={orderBook} currentPrice={selectedPair.price} />}
          {selectedPair && <TechnicalIndicatorsPanel pair={selectedPair} />}
          <PortfolioChart allocation={portfolioAllocation} />
          {riskMetrics && <RiskMetricsDashboard metrics={riskMetrics} />}
          <CouncilDecisionsPanel decisions={councilDecisions} />
          <NewsFeedComponent news={newsFeed} />
        </div>
      </div>
    </div>
  );
}