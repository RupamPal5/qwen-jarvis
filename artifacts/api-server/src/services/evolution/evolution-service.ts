import { ollamaChat } from "../../lib/ollama";
import { CONSENSUS_MODELS } from "../consensus/personas";
import { runConsensusPipeline } from "../consensus/orchestrator";
import { scanMarketConditions, pickEvolutionTrigger } from "./market-monitor";
import {
  applyPatches,
  buildRegistryPatches,
  readRegistrySnippet,
} from "./self-modifier";
import type {
  EvolutionDraft,
  FilePatch,
  MarketAlert,
  MarketTelemetry,
  ApplyResult,
} from "./types";

const drafts = new Map<string, EvolutionDraft>();

function now(): string {
  return new Date().toISOString();
}

function draftId(): string {
  return `evolution_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function extractJson<T>(text: string): T | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1]?.trim() ?? text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

const EVOLUTION_DRAFTER_SYSTEM = `You are J.A.R.V.I.S. Self-Evolution Architect.
Draft scoped React/TypeScript upgrades for the JARVIS V5 dashboard (Vite + React, NOT Next.js).

When macro or crypto market structure breaks, propose:
1. A new dashboard component (TSX) under artifacts/jarvis-ui/src/components/evolved/
2. Optional registry nav entry metadata

Respond ONLY with valid JSON:
{
  "rationale": "why this upgrade is needed",
  "patches": [
    {
      "path": "artifacts/jarvis-ui/src/components/evolved/AlgoTradingTracker.tsx",
      "operation": "create",
      "content": "full file source"
    }
  ],
  "navEntry": {
    "id": "algo-tracker",
    "label": "Algo Tracker",
    "group": "data",
    "componentExport": "AlgoTradingTracker"
  }
}

Rules:
- Use "use client" only if needed; match existing Tailwind + framer-motion style
- Paths MUST be under artifacts/jarvis-ui/src/ or artifacts/api-server/src/
- Never modify package.json, .env, or node_modules
- Components should be self-contained and production-ready`;

export async function scanAndDetect(
  telemetry?: MarketTelemetry,
): Promise<{ alerts: MarketAlert[]; trigger?: MarketAlert }> {
  const alerts = await scanMarketConditions(telemetry);
  return { alerts, trigger: pickEvolutionTrigger(alerts) };
}

export async function draftEvolution(
  alert: MarketAlert,
): Promise<EvolutionDraft> {
  const registrySnippet = await readRegistrySnippet();

  const userPrompt = `Market alert triggered self-evolution:
Kind: ${alert.kind}
Severity: ${alert.severity}
Title: ${alert.title}
Description: ${alert.description}
Metrics: ${JSON.stringify(alert.metrics)}

Current evolution registry snippet:
${registrySnippet.slice(0, 2000)}

Draft a UI upgrade (e.g. algorithmic trading tracker, macro risk panel, volatility overlay).
Component files go in artifacts/jarvis-ui/src/components/evolved/.`;

  const { content } = await ollamaChat(CONSENSUS_MODELS.GENERATOR, [
    { role: "system", content: EVOLUTION_DRAFTER_SYSTEM },
    { role: "user", content: userPrompt },
  ]);

  const parsed = extractJson<{
    rationale?: string;
    patches?: FilePatch[];
    navEntry?: EvolutionDraft["navEntry"];
  }>(content);

  const draft: EvolutionDraft = {
    id: draftId(),
    alertId: alert.id,
    rationale: parsed?.rationale ?? content.slice(0, 500),
    patches: parsed?.patches ?? [],
    navEntry: parsed?.navEntry,
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
  };

  if (draft.navEntry && draft.patches.length > 0) {
    draft.patches.push(...buildRegistryPatches(draft.navEntry));
  }

  drafts.set(draft.id, draft);
  return draft;
}

/**
 * Route evolution draft through Tri-Node Consensus before any fs writes.
 */
export async function proposeEvolution(draftId: string): Promise<EvolutionDraft> {
  const draft = drafts.get(draftId);
  if (!draft) throw new Error(`Evolution draft not found: ${draftId}`);

  const patchSummary = draft.patches
    .map((p) => `${p.operation} ${p.path}`)
    .join("\n");

  const consensus = await runConsensusPipeline({
    prompt: `SELF-EVOLUTION: Apply codebase modifications\n\nRationale: ${draft.rationale}\n\nPatches:\n${patchSummary}\n\nPayload preview:\n${draft.patches[0]?.content?.slice(0, 1500) ?? "registry update"}`,
    context: "Scoped self-modify: jarvis-ui/src and api-server/src only. Requires hot-reload after apply.",
  });

  draft.consensusSessionId = consensus.sessionId;
  draft.status =
    consensus.phase === "AWAITING_AUTHORIZATION"
      ? "awaiting_authorization"
      : consensus.phase === "REJECTED"
        ? "rejected"
        : "proposed";
  draft.updatedAt = now();
  drafts.set(draft.id, draft);
  return draft;
}

export async function applyEvolution(
  draftId: string,
  consensusSessionId: string,
): Promise<ApplyResult> {
  const draft = drafts.get(draftId);
  if (!draft) throw new Error(`Evolution draft not found: ${draftId}`);

  if (draft.consensusSessionId && draft.consensusSessionId !== consensusSessionId) {
    throw new Error("consensusSessionId does not match draft");
  }

  const { assertConsensusAuthorized } = await import("../execution/task-executor");
  assertConsensusAuthorized(consensusSessionId);

  if (draft.patches.length === 0) {
    throw new Error("No patches to apply");
  }

  const result = await applyPatches(draft.patches);
  result.draftId = draftId;

  draft.status = "applied";
  draft.appliedAt = now();
  draft.updatedAt = now();
  drafts.set(draft.id, draft);

  return result;
}

export function getEvolutionDraft(id: string): EvolutionDraft | undefined {
  return drafts.get(id);
}

export function listEvolutionDrafts(): EvolutionDraft[] {
  return [...drafts.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Full autonomous evolution cycle: scan → draft → consensus propose.
 */
export async function triggerEvolutionCycle(
  telemetry?: MarketTelemetry,
): Promise<{
  alerts: MarketAlert[];
  draft?: EvolutionDraft;
  skipped?: string;
}> {
  const { alerts, trigger } = await scanAndDetect(telemetry);
  if (!trigger) {
    return { alerts, skipped: "No evolution trigger — market conditions nominal" };
  }

  const draft = await draftEvolution(trigger);
  const proposed = await proposeEvolution(draft.id);
  return { alerts, draft: proposed };
}
