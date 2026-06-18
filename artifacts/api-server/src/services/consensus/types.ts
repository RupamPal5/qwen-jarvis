export type ConsensusNode = "GENERATOR" | "CHECKER" | "IMPLEMENTOR";

export type ConsensusPhase =
  | "IDLE"
  | "GENERATING"
  | "CHECKING"
  | "IMPLEMENTING"
  | "AWAITING_AUTHORIZATION"
  | "AUTHORIZED"
  | "REJECTED"
  | "EXECUTED"
  | "CANCELLED"
  | "FAILED";

export type CheckerVerdict = "APPROVE" | "REJECT";

export type ActionClassification = "READ_ONLY" | "STATE_ALTERING";

export interface NodeOutput {
  node: ConsensusNode;
  model: string;
  content: string;
  startedAt: string;
  completedAt: string;
  latencyMs: number;
}

export interface CheckerResult {
  verdict: CheckerVerdict;
  risks: string[];
  dryRunSummary: string;
  reasoning: string;
  securityFlags: string[];
}

export interface ImplementorResult {
  actionType: ActionClassification;
  payload: string;
  executionPlan: string[];
  summary: string;
}

export interface ConsensusSession {
  id: string;
  prompt: string;
  context?: string;
  phase: ConsensusPhase;
  generator?: NodeOutput;
  checker?: NodeOutput;
  checkerResult?: CheckerResult;
  implementor?: NodeOutput;
  implementorResult?: ImplementorResult;
  authorizationRequired: boolean;
  authorizedAt?: string;
  authorizedBy?: string;
  rejectionReason?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposeRequest {
  prompt: string;
  context?: string;
  /** Skip human gate for read-only payloads (still logged). */
  autoExecuteReadOnly?: boolean;
}

export interface ProposeResponse {
  sessionId: string;
  phase: ConsensusPhase;
  authorizationRequired: boolean;
  generator?: NodeOutput;
  checker?: NodeOutput;
  checkerResult?: CheckerResult;
  implementor?: NodeOutput;
  implementorResult?: ImplementorResult;
  message: string;
}

export interface AuthorizeRequest {
  sessionId: string;
  approved: boolean;
  authorizedBy?: string;
}

export interface ConsensusStreamEvent {
  type:
    | "phase"
    | "node_start"
    | "node_complete"
    | "authorization_required"
    | "complete"
    | "error";
  sessionId: string;
  phase?: ConsensusPhase;
  node?: ConsensusNode;
  data?: unknown;
  message?: string;
  timestamp: string;
}
