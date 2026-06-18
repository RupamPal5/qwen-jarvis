import { ollamaChat, checkOllamaHealth } from "../../lib/ollama";
import {
  GENERATOR_SYSTEM,
  CHECKER_SYSTEM,
  IMPLEMENTOR_SYSTEM,
  NODE_MODEL_MAP,
  buildGeneratorUserPrompt,
  buildCheckerUserPrompt,
  buildImplementorUserPrompt,
} from "./personas";
import { scanPayload, mergeScanResults } from "./security-scanner";
import { createSessionId, getSession, saveSession, pruneExpiredSessions } from "./session-store";
import type {
  CheckerResult,
  CheckerVerdict,
  ConsensusNode,
  ConsensusPhase,
  ConsensusSession,
  ConsensusStreamEvent,
  ImplementorResult,
  NodeOutput,
  ProposeRequest,
  ProposeResponse,
  ActionClassification,
} from "./types";

type StreamEmitter = (event: ConsensusStreamEvent) => void;

function now(): string {
  return new Date().toISOString();
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

function parseCheckerResult(content: string, securityFlags: string[]): CheckerResult {
  const parsed = extractJson<{
    verdict?: string;
    risks?: string[];
    dryRunSummary?: string;
    reasoning?: string;
  }>(content);

  if (!parsed) {
    const upper = content.toUpperCase();
    const verdict: CheckerVerdict = upper.includes("REJECT") ? "REJECT" : "APPROVE";
    return {
      verdict,
      risks: securityFlags,
      dryRunSummary: content.slice(0, 500),
      reasoning: "Checker response was not structured JSON; heuristic parse applied.",
      securityFlags,
    };
  }

  const verdict: CheckerVerdict =
    parsed.verdict?.toUpperCase() === "REJECT" ? "REJECT" : "APPROVE";

  return {
    verdict: securityFlags.length > 0 ? "REJECT" : verdict,
    risks: [...(parsed.risks ?? []), ...securityFlags],
    dryRunSummary: parsed.dryRunSummary ?? "",
    reasoning: parsed.reasoning ?? "",
    securityFlags,
  };
}

function parseImplementorResult(content: string, scanStateAltering: boolean): ImplementorResult {
  const parsed = extractJson<{
    actionType?: string;
    payload?: string;
    executionPlan?: string[];
    summary?: string;
  }>(content);

  if (!parsed) {
    const scan = scanPayload(content);
    return {
      actionType: scan.isStateAltering || scanStateAltering ? "STATE_ALTERING" : "READ_ONLY",
      payload: content,
      executionPlan: [content.slice(0, 200)],
      summary: "Implementor response was not structured JSON; raw payload retained.",
    };
  }

  let actionType: ActionClassification =
    parsed.actionType?.toUpperCase() === "READ_ONLY" ? "READ_ONLY" : "STATE_ALTERING";

  if (scanStateAltering) actionType = "STATE_ALTERING";

  const payloadScan = scanPayload(parsed.payload ?? content);
  if (payloadScan.isStateAltering) actionType = "STATE_ALTERING";

  return {
    actionType,
    payload: parsed.payload ?? content,
    executionPlan: parsed.executionPlan ?? [],
    summary: parsed.summary ?? "Execution plan prepared.",
  };
}

async function runNode(
  node: ConsensusNode,
  system: string,
  user: string,
): Promise<NodeOutput> {
  const model = NODE_MODEL_MAP[node];
  const startedAt = now();
  const startMs = Date.now();

  const { content } = await ollamaChat(model, [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  return {
    node,
    model,
    content,
    startedAt,
    completedAt: now(),
    latencyMs: Date.now() - startMs,
  };
}

function touchSession(session: ConsensusSession, phase: ConsensusPhase): ConsensusSession {
  session.phase = phase;
  session.updatedAt = now();
  saveSession(session);
  return session;
}

function emit(emitter: StreamEmitter | undefined, event: Omit<ConsensusStreamEvent, "timestamp">): void {
  if (!emitter) return;
  emitter({ ...event, timestamp: now() });
}

/**
 * Tri-Node routing pipeline:
 * Generator (qwen3-coder) → Checker (deepseek-coder-v2) → Implementor (qwen2.5-coder-7b)
 * State-altering payloads halt at AWAITING_AUTHORIZATION before execution.
 */
export async function runConsensusPipeline(
  request: ProposeRequest,
  emitter?: StreamEmitter,
): Promise<ProposeResponse> {
  pruneExpiredSessions();

  const health = await checkOllamaHealth();
  if (!health.online) {
    throw new Error("Ollama sub-node offline — cannot run Tri-Node Consensus");
  }

  const session: ConsensusSession = {
    id: createSessionId(),
    prompt: request.prompt,
    context: request.context,
    phase: "GENERATING",
    authorizationRequired: false,
    createdAt: now(),
    updatedAt: now(),
  };
  saveSession(session);

  emit(emitter, {
    type: "phase",
    sessionId: session.id,
    phase: "GENERATING",
    message: "Generator analyzing command",
  });

  // ── NODE 1: GENERATOR ──────────────────────────────────────────────
  emit(emitter, { type: "node_start", sessionId: session.id, node: "GENERATOR" });

  const generator = await runNode(
    "GENERATOR",
    GENERATOR_SYSTEM,
    buildGeneratorUserPrompt(request.prompt, request.context),
  );
  session.generator = generator;
  touchSession(session, "CHECKING");

  emit(emitter, {
    type: "node_complete",
    sessionId: session.id,
    node: "GENERATOR",
    data: generator,
  });
  emit(emitter, {
    type: "phase",
    sessionId: session.id,
    phase: "CHECKING",
    message: "Checker performing dry-fire audit",
  });

  // ── NODE 2: CHECKER ────────────────────────────────────────────────
  emit(emitter, { type: "node_start", sessionId: session.id, node: "CHECKER" });

  const generatorScan = scanPayload(generator.content);
  const checker = await runNode(
    "CHECKER",
    CHECKER_SYSTEM,
    buildCheckerUserPrompt(generator.content),
  );
  session.checker = checker;

  const checkerContentScan = scanPayload(checker.content);
  const mergedScan = mergeScanResults(generatorScan, checkerContentScan);
  const checkerResult = parseCheckerResult(checker.content, mergedScan.flags);
  session.checkerResult = checkerResult;

  emit(emitter, {
    type: "node_complete",
    sessionId: session.id,
    node: "CHECKER",
    data: { checker, checkerResult },
  });

  if (checkerResult.verdict === "REJECT" || !mergedScan.passed) {
    session.phase = "REJECTED";
    session.rejectionReason =
      mergedScan.flags.length > 0
        ? `Security scanner blocked: ${mergedScan.flags.join(", ")}`
        : checkerResult.reasoning || "Checker rejected payload";
    session.authorizationRequired = false;
    session.updatedAt = now();
    saveSession(session);

    emit(emitter, {
      type: "complete",
      sessionId: session.id,
      phase: "REJECTED",
      message: session.rejectionReason,
      data: buildResponse(session),
    });

    return buildResponse(session);
  }

  // ── NODE 3: IMPLEMENTOR (only if Checker APPROVED) ─────────────────
  touchSession(session, "IMPLEMENTING");
  emit(emitter, {
    type: "phase",
    sessionId: session.id,
    phase: "IMPLEMENTING",
    message: "Implementor preparing execution plan",
  });
  emit(emitter, { type: "node_start", sessionId: session.id, node: "IMPLEMENTOR" });

  const implementor = await runNode(
    "IMPLEMENTOR",
    IMPLEMENTOR_SYSTEM,
    buildImplementorUserPrompt(request.prompt, generator.content, checkerResult),
  );
  session.implementor = implementor;

  const implementorResult = parseImplementorResult(
    implementor.content,
    mergedScan.isStateAltering,
  );
  session.implementorResult = implementorResult;

  emit(emitter, {
    type: "node_complete",
    sessionId: session.id,
    node: "IMPLEMENTOR",
    data: { implementor, implementorResult },
  });

  const requiresAuth =
    implementorResult.actionType === "STATE_ALTERING" || mergedScan.isStateAltering;

  session.authorizationRequired = requiresAuth;

  if (requiresAuth) {
    touchSession(session, "AWAITING_AUTHORIZATION");
    emit(emitter, {
      type: "authorization_required",
      sessionId: session.id,
      phase: "AWAITING_AUTHORIZATION",
      message: "[AWAITING AUTHORIZATION] Human-in-the-loop gate — execution blocked",
      data: {
        implementorResult,
        categories: mergedScan.categories,
      },
    });
    emit(emitter, {
      type: "complete",
      sessionId: session.id,
      phase: "AWAITING_AUTHORIZATION",
      message: "Payload routed to Permission Gate",
      data: buildResponse(session),
    });
    return buildResponse(session);
  }

  // Read-only path — mark executed without host mutation (audit log only)
  if (request.autoExecuteReadOnly) {
    touchSession(session, "EXECUTED");
    emit(emitter, {
      type: "complete",
      sessionId: session.id,
      phase: "EXECUTED",
      message: "Read-only payload released (no state mutation)",
      data: buildResponse(session),
    });
  } else {
    touchSession(session, "AUTHORIZED");
    emit(emitter, {
      type: "complete",
      sessionId: session.id,
      phase: "AUTHORIZED",
      message: "Read-only plan ready — no authorization required",
      data: buildResponse(session),
    });
  }

  return buildResponse(session);
}

/**
 * Override Gate handler — frontend must call this after user approves/denies the modal.
 * Execution of state-altering payloads ONLY proceeds when approved === true.
 */
export async function authorizeConsensusSession(
  sessionId: string,
  approved: boolean,
  authorizedBy?: string,
): Promise<ProposeResponse> {
  const session = getSession(sessionId);
  if (!session) {
    throw new Error(`Consensus session not found: ${sessionId}`);
  }

  if (session.phase !== "AWAITING_AUTHORIZATION") {
    throw new Error(
      `Session ${sessionId} is not awaiting authorization (current phase: ${session.phase})`,
    );
  }

  if (!approved) {
    session.phase = "CANCELLED";
    session.rejectionReason = "User denied authorization at Override Gate";
    session.updatedAt = now();
    saveSession(session);
    return buildResponse(session);
  }

  session.phase = "AUTHORIZED";
  session.authorizedAt = now();
  session.authorizedBy = authorizedBy ?? "human_operator";
  session.updatedAt = now();
  saveSession(session);

  return buildResponse(session);
}

function buildResponse(session: ConsensusSession): ProposeResponse {
  const messages: Record<ConsensusPhase, string> = {
    IDLE: "Idle",
    GENERATING: "Generator processing",
    CHECKING: "Checker auditing",
    IMPLEMENTING: "Implementor preparing",
    AWAITING_AUTHORIZATION: "[AWAITING AUTHORIZATION] Override Gate — human approval required",
    AUTHORIZED: "Authorized — ready for execution",
    REJECTED: session.rejectionReason ?? "Checker rejected payload",
    EXECUTED: "Consensus complete — payload released",
    CANCELLED: session.rejectionReason ?? "Authorization denied",
    FAILED: session.error ?? "Pipeline failed",
  };

  return {
    sessionId: session.id,
    phase: session.phase,
    authorizationRequired: session.authorizationRequired,
    generator: session.generator,
    checker: session.checker,
    checkerResult: session.checkerResult,
    implementor: session.implementor,
    implementorResult: session.implementorResult,
    message: messages[session.phase],
  };
}

export function getConsensusSession(sessionId: string): ConsensusSession | undefined {
  return getSession(sessionId);
}
