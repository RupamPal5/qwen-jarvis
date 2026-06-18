import { Router } from "express";
import {
  applyEvolution,
  draftEvolution,
  getEvolutionDraft,
  listEvolutionDrafts,
  proposeEvolution,
  scanAndDetect,
  triggerEvolutionCycle,
} from "../services/evolution/evolution-service";
import type { MarketTelemetry } from "../services/evolution/types";

const router = Router();

/** GET /api/evolution/scan — detect macro/crypto shifts */
router.get("/evolution/scan", async (req, res) => {
  try {
    const telemetry = parseTelemetryQuery(req.query);
    const result = await scanAndDetect(telemetry);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Scan failed" });
  }
});

/** POST /api/evolution/scan — scan with live telemetry from TradingDashboard */
router.post("/evolution/scan", async (req, res) => {
  try {
    const telemetry = req.body as MarketTelemetry | undefined;
    const result = await scanAndDetect(telemetry);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Scan failed" });
  }
});

/** POST /api/evolution/trigger — full scan → draft → consensus propose */
router.post("/evolution/trigger", async (req, res) => {
  try {
    const telemetry = req.body?.telemetry as MarketTelemetry | undefined;
    const result = await triggerEvolutionCycle(telemetry);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Evolution trigger failed" });
  }
});

/** POST /api/evolution/draft — draft from a specific alert */
router.post("/evolution/draft", async (req, res) => {
  const alert = req.body?.alert;
  if (!alert?.id || !alert?.kind) {
    res.status(400).json({ error: "alert object with id and kind required" });
    return;
  }
  try {
    const draft = await draftEvolution(alert);
    res.json(draft);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Draft failed" });
  }
});

/** POST /api/evolution/propose — route draft through Tri-Node Consensus */
router.post("/evolution/propose", async (req, res) => {
  const draftId = req.body?.draftId as string | undefined;
  if (!draftId) {
    res.status(400).json({ error: "draftId required" });
    return;
  }
  try {
    const draft = await proposeEvolution(draftId);
    res.json(draft);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Propose failed" });
  }
});

/**
 * POST /api/evolution/apply
 * Apply fs patches after consensus authorization — triggers Vite HMR.
 */
router.post("/evolution/apply", async (req, res) => {
  const { draftId, consensusSessionId } = req.body as {
    draftId?: string;
    consensusSessionId?: string;
  };
  if (!draftId || !consensusSessionId) {
    res.status(400).json({ error: "draftId and consensusSessionId required" });
    return;
  }
  try {
    const result = await applyEvolution(draftId, consensusSessionId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apply failed";
    const status = message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

router.get("/evolution/drafts", (_req, res) => {
  res.json({ drafts: listEvolutionDrafts() });
});

router.get("/evolution/drafts/:id", (req, res) => {
  const draft = getEvolutionDraft(req.params.id);
  if (!draft) {
    res.status(404).json({ error: "Draft not found" });
    return;
  }
  res.json(draft);
});

function parseTelemetryQuery(query: Record<string, unknown>): MarketTelemetry | undefined {
  if (!query["symbol"] && !query["change24hPct"]) return undefined;
  return {
    symbol: String(query["symbol"] ?? "BTC"),
    change24hPct: Number(query["change24hPct"]),
    volatilityIndex: query["volatilityIndex"] ? Number(query["volatilityIndex"]) : undefined,
    macroIndicators: {
      vix: query["vix"] ? Number(query["vix"]) : undefined,
    },
  };
}

export default router;
