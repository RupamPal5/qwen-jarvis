export type TaskStatus =
  | "pending"
  | "running"
  | "awaiting_authorization"
  | "completed"
  | "failed"
  | "cancelled";

export type TaskKind =
  | "shell"
  | "wsl"
  | "organize"
  | "process_launch"
  | "roadmap"
  | "evolution_apply"
  | "consensus_execute";

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface OrganizeRule {
  sourceDir: string;
  /** Extension or folder name (e.g. "pdf", "images") */
  category: string;
  extensions?: string[];
}

export interface ProcessLaunchSpec {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  wsl?: boolean;
  label?: string;
}

export interface RoadmapStep {
  id: string;
  type: "shell" | "organize" | "process_launch";
  description: string;
  shellCommand?: string;
  organize?: { sourceDir: string; rules: OrganizeRule[] };
  process?: ProcessLaunchSpec;
  wsl?: boolean;
}

export interface Roadmap {
  id: string;
  name: string;
  steps: RoadmapStep[];
  currentStep: number;
  status: TaskStatus;
  consensusSessionId?: string;
  results: Array<{ stepId: string; ok: boolean; output?: string; error?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface OmnipresenceTask {
  id: string;
  kind: TaskKind;
  status: TaskStatus;
  label: string;
  consensusSessionId?: string;
  pid?: number;
  result?: ShellResult | { message: string };
  error?: string;
  createdAt: string;
  updatedAt: string;
}
