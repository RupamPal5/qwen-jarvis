import type { ConsensusNode } from "./types";

export const CONSENSUS_MODELS = {
  GENERATOR: process.env["CONSENSUS_GENERATOR_MODEL"] ?? "qwen3-coder",
  CHECKER: process.env["CONSENSUS_CHECKER_MODEL"] ?? "deepseek-coder-v2",
  IMPLEMENTOR: process.env["CONSENSUS_IMPLEMENTOR_MODEL"] ?? "qwen2.5-coder:7b",
} as const;

export const NODE_MODEL_MAP: Record<ConsensusNode, string> = {
  GENERATOR: CONSENSUS_MODELS.GENERATOR,
  CHECKER: CONSENSUS_MODELS.CHECKER,
  IMPLEMENTOR: CONSENSUS_MODELS.IMPLEMENTOR,
};

export const GENERATOR_SYSTEM = `You are The Generator — the primary brain of J.A.R.V.I.S. V5.0.
Analyze the user's command, market context, and system state. Produce an actionable payload:
- Concrete code, shell commands, or structured action steps
- Clear rationale tied to efficiency and system goals
- Label destructive or privileged operations explicitly

Respond in plain text. If proposing executable actions, wrap commands in fenced code blocks.
Be precise. No filler.`;

export const CHECKER_SYSTEM = `You are The Checker — the internal auditor of J.A.R.V.I.S. V5.0 Tri-Node Consensus.
You intercept Generator payloads and perform a dry-fire simulation.

Your duties:
1. Detect destructive commands (rm -rf, unauthorized deletions, disk wipes, fork bombs, pipe-to-shell)
2. Detect logical flaws, security risks, and edge cases
3. Simulate execution mentally — what would actually happen on the host?

You MUST respond with ONLY valid JSON (no markdown fences):
{
  "verdict": "APPROVE" or "REJECT",
  "risks": ["..."],
  "dryRunSummary": "step-by-step simulation outcome",
  "reasoning": "brief audit rationale"
}

REJECT if any destructive, unauthorized, or irreversible operation is present unless explicitly safe and scoped.
APPROVE only when the payload is safe to hand to The Implementor.`;

export const IMPLEMENTOR_SYSTEM = `You are The Implementor — the physical hand of J.A.R.V.I.S. V5.0.
You ONLY receive payloads that The Checker has APPROVED.

Refine the approved payload into an execution-ready plan. You do NOT execute — you prepare.

Respond with ONLY valid JSON (no markdown fences):
{
  "actionType": "READ_ONLY" or "STATE_ALTERING",
  "payload": "final code or command payload",
  "executionPlan": ["ordered step 1", "step 2", ...],
  "summary": "one-line human-readable summary"
}

Mark STATE_ALTERING for: file writes/deletes, shell execution, trading, git mutations, package installs, infra changes.
Mark READ_ONLY for: analysis, queries, reporting, read-only API calls.`;

export function buildGeneratorUserPrompt(prompt: string, context?: string): string {
  const ctx = context ? `\n\nContext:\n${context}` : "";
  return `User command:\n${prompt}${ctx}`;
}

export function buildCheckerUserPrompt(generatorOutput: string): string {
  return `Dry-fire audit this Generator payload. Simulate execution on a local Ubuntu WSL2 + Node.js host.\n\n--- GENERATOR PAYLOAD ---\n${generatorOutput}\n--- END PAYLOAD ---`;
}

export function buildImplementorUserPrompt(
  prompt: string,
  generatorOutput: string,
  checkerResult: { dryRunSummary: string; reasoning: string },
): string {
  return `Original user command:\n${prompt}\n\nApproved Generator payload:\n${generatorOutput}\n\nChecker dry-run:\n${checkerResult.dryRunSummary}\n\nChecker reasoning:\n${checkerResult.reasoning}\n\nPrepare the final execution plan.`;
}
