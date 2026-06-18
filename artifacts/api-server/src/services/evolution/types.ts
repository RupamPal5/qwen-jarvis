export type MarketAlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MarketAlertKind =
  | "MACRO_SHIFT"
  | "CRYPTO_STRUCTURE_BREAK"
  | "VOLATILITY_SPIKE"
  | "CORRELATION_BREAK";

export interface MarketTelemetry {
  symbol?: string;
  price?: number;
  change24hPct?: number;
  volatilityIndex?: number;
  volume24h?: number;
  macroIndicators?: {
    vix?: number;
    dxy?: number;
    fedRate?: number;
    unemployment?: number;
  };
}

export interface MarketAlert {
  id: string;
  kind: MarketAlertKind;
  severity: MarketAlertSeverity;
  title: string;
  description: string;
  metrics: Record<string, number>;
  detectedAt: string;
  evolutionRecommended: boolean;
}

export type FilePatchOperation = "create" | "update" | "append";

export interface FilePatch {
  /** Repo-relative path e.g. artifacts/jarvis-ui/src/components/MyWidget.tsx */
  path: string;
  operation: FilePatchOperation;
  content: string;
  /** For update: optional search string to replace instead of full overwrite */
  search?: string;
  replace?: string;
}

export interface EvolutionDraft {
  id: string;
  alertId?: string;
  rationale: string;
  patches: FilePatch[];
  navEntry?: {
    id: string;
    label: string;
    group: string;
    componentExport: string;
  };
  consensusSessionId?: string;
  status: "draft" | "proposed" | "awaiting_authorization" | "applied" | "rejected" | "failed";
  createdAt: string;
  updatedAt: string;
  appliedAt?: string;
  error?: string;
}

export interface ApplyResult {
  draftId: string;
  applied: string[];
  backups: string[];
  hotReloadHint: string;
}
