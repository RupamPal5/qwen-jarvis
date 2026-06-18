import type { MarketAlert, MarketAlertKind, MarketAlertSeverity, MarketTelemetry } from "./types";

const VOLATILITY_SPIKE_THRESHOLD = Number(process.env["JARVIS_VOL_THRESHOLD"] ?? 8);
const MACRO_VIX_THRESHOLD = Number(process.env["JARVIS_VIX_THRESHOLD"] ?? 25);
const CRYPTO_BREAK_THRESHOLD = Number(process.env["JARVIS_CRYPTO_BREAK_PCT"] ?? 12);

function alertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function severityFromMagnitude(magnitude: number): MarketAlertSeverity {
  if (magnitude >= 20) return "CRITICAL";
  if (magnitude >= 12) return "HIGH";
  if (magnitude >= 6) return "MEDIUM";
  return "LOW";
}

/**
 * Heuristic market / macro scanner. Accepts live telemetry from TradingDashboard
 * or fetches public BTC data when no payload is supplied.
 */
export async function scanMarketConditions(
  telemetry?: MarketTelemetry,
): Promise<MarketAlert[]> {
  const data = telemetry ?? await fetchDefaultCryptoTelemetry();
  const alerts: MarketAlert[] = [];
  const now = new Date().toISOString();

  const change = data.change24hPct ?? 0;
  const vol = data.volatilityIndex ?? Math.abs(change);
  const vix = data.macroIndicators?.vix;

  if (Math.abs(change) >= CRYPTO_BREAK_THRESHOLD) {
    alerts.push({
      id: alertId(),
      kind: "CRYPTO_STRUCTURE_BREAK",
      severity: severityFromMagnitude(Math.abs(change)),
      title: `${data.symbol ?? "BTC"} structure break detected`,
      description: `24h move ${change.toFixed(2)}% exceeds break threshold (${CRYPTO_BREAK_THRESHOLD}%). Market microstructure may require dashboard upgrades.`,
      metrics: { change24hPct: change, volatility: vol },
      detectedAt: now,
      evolutionRecommended: true,
    });
  }

  if (vol >= VOLATILITY_SPIKE_THRESHOLD) {
    alerts.push({
      id: alertId(),
      kind: "VOLATILITY_SPIKE",
      severity: severityFromMagnitude(vol),
      title: "Volatility spike",
      description: `Volatility index ${vol.toFixed(1)} exceeds threshold ${VOLATILITY_SPIKE_THRESHOLD}.`,
      metrics: { volatility: vol },
      detectedAt: now,
      evolutionRecommended: true,
    });
  }

  if (vix !== undefined && vix >= MACRO_VIX_THRESHOLD) {
    alerts.push({
      id: alertId(),
      kind: "MACRO_SHIFT",
      severity: severityFromMagnitude(vix - MACRO_VIX_THRESHOLD + 5),
      title: "Macro risk regime shift",
      description: `VIX at ${vix.toFixed(1)} — macro stress elevated. Consider risk overlays and macro panels.`,
      metrics: { vix },
      detectedAt: now,
      evolutionRecommended: true,
    });
  }

  if (data.macroIndicators?.dxy !== undefined && Math.abs(data.macroIndicators.dxy) > 3) {
    alerts.push({
      id: alertId(),
      kind: "CORRELATION_BREAK",
      severity: "MEDIUM",
      title: "Dollar strength correlation shift",
      description: "DXY movement may break crypto-equity correlation assumptions.",
      metrics: { dxy: data.macroIndicators.dxy },
      detectedAt: now,
      evolutionRecommended: true,
    });
  }

  return alerts;
}

async function fetchDefaultCryptoTelemetry(): Promise<MarketTelemetry> {
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
      { signal: AbortSignal.timeout(8000) },
    );
    if (!r.ok) throw new Error("coingecko unavailable");
    const json = (await r.json()) as { bitcoin?: { usd?: number; usd_24h_change?: number } };
    const change = json.bitcoin?.usd_24h_change ?? 0;
    return {
      symbol: "BTC",
      price: json.bitcoin?.usd,
      change24hPct: change,
      volatilityIndex: Math.abs(change) * 1.2,
    };
  } catch {
    return {
      symbol: "BTC",
      change24hPct: 0,
      volatilityIndex: 0,
      macroIndicators: { vix: 18 },
    };
  }
}

export function pickEvolutionTrigger(alerts: MarketAlert[]): MarketAlert | undefined {
  const ranked = [...alerts].sort((a, b) => {
    const sev = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    return sev[b.severity] - sev[a.severity];
  });
  return ranked.find((a) => a.evolutionRecommended);
}
