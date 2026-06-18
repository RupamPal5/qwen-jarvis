import fs from "node:fs/promises";
import path from "node:path";
import { resolveHostPath, WORKSPACE_ROOT } from "../../lib/paths";
import { getConsensusSession } from "../consensus/orchestrator";
import { getSession, saveSession } from "../consensus/session-store";
import { scanPayload } from "../consensus/security-scanner";
import { launchProcess } from "./process-manager";
import { runShell } from "./shell-runner";
import type {
  OmnipresenceTask,
  OrganizeRule,
  Roadmap,
  RoadmapStep,
  ShellResult,
  TaskStatus,
} from "./types";

const tasks = new Map<string, OmnipresenceTask>();
const roadmaps = new Map<string, Roadmap>();

function now(): string {
  return new Date().toISOString();
}

function createTaskId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function saveTask(task: OmnipresenceTask): void {
  task.updatedAt = now();
  tasks.set(task.id, task);
}

export function getTask(id: string): OmnipresenceTask | undefined {
  return tasks.get(id);
}

export function listTasks(): OmnipresenceTask[] {
  return [...tasks.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getRoadmap(id: string): Roadmap | undefined {
  return roadmaps.get(id);
}

export function listRoadmaps(): Roadmap[] {
  return [...roadmaps.values()];
}

/**
 * Verify consensus session was authorized before host execution.
 */
export function assertConsensusAuthorized(sessionId: string): void {
  const session = getConsensusSession(sessionId);
  if (!session) {
    throw new Error(`Consensus session not found: ${sessionId}`);
  }
  const allowed: string[] = ["AUTHORIZED", "EXECUTED"];
  if (!allowed.includes(session.phase)) {
    throw new Error(
      `Consensus session ${sessionId} not authorized (phase: ${session.phase})`,
    );
  }
  if (session.authorizationRequired && !session.authorizedAt) {
    throw new Error(`Consensus session ${sessionId} requires human authorization`);
  }
}

function extractShellCommands(payload: string): string[] {
  const commands: string[] = [];
  const fenceRe = /```(?:bash|sh|shell|powershell)?\s*([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(payload)) !== null) {
    const block = m[1].trim();
    if (block) commands.push(block);
  }
  if (commands.length === 0 && payload.trim()) {
    const lines = payload
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && !l.startsWith("{"));
    if (lines.length > 0) commands.push(lines.join("\n"));
  }
  return commands;
}

export async function executeConsensusPayload(
  sessionId: string,
  options: { wsl?: boolean } = {},
): Promise<OmnipresenceTask> {
  assertConsensusAuthorized(sessionId);
  const session = getConsensusSession(sessionId);
  const payload = session?.implementorResult?.payload ?? session?.generator?.content ?? "";

  const scan = scanPayload(payload);
  if (!scan.passed) {
    throw new Error(`Payload blocked by security scanner: ${scan.flags.join(", ")}`);
  }

  const task: OmnipresenceTask = {
    id: createTaskId("exec"),
    kind: "consensus_execute",
    status: "running",
    label: `Consensus execute: ${sessionId}`,
    consensusSessionId: sessionId,
    createdAt: now(),
    updatedAt: now(),
  };
  saveTask(task);

  const commands = extractShellCommands(payload);
  if (commands.length === 0) {
    task.status = "completed";
    task.result = { message: "No shell commands in payload — plan logged only" };
    saveTask(task);
    return task;
  }

  const outputs: string[] = [];
  try {
    for (const cmd of commands) {
      const result = await runShell(cmd, { wsl: options.wsl ?? true });
      outputs.push(
        `[exit ${result.exitCode}]\n${result.stdout}\n${result.stderr}`.trim(),
      );
      if (result.exitCode !== 0) {
        throw new Error(`Command failed (exit ${result.exitCode}): ${result.stderr || result.stdout}`);
      }
    }
    task.status = "completed";
    task.result = {
      stdout: outputs.join("\n---\n"),
      stderr: "",
      exitCode: 0,
      durationMs: 0,
    } satisfies ShellResult;

    const session = getSession(sessionId);
    if (session) {
      session.phase = "EXECUTED";
      session.updatedAt = new Date().toISOString();
      saveSession(session);
    }
  } catch (err) {
    task.status = "failed";
    task.error = err instanceof Error ? err.message : "Execution failed";
  }

  saveTask(task);
  return task;
}

export async function organizeFiles(
  sourceDir: string,
  rules: OrganizeRule[],
  options: { wsl?: boolean; consensusSessionId?: string } = {},
): Promise<OmnipresenceTask> {
  if (options.consensusSessionId) {
    assertConsensusAuthorized(options.consensusSessionId);
  }

  const resolvedSource = resolveHostPath(sourceDir);
  const task: OmnipresenceTask = {
    id: createTaskId("organize"),
    kind: "organize",
    status: "running",
    label: `Organize: ${sourceDir}`,
    consensusSessionId: options.consensusSessionId,
    createdAt: now(),
    updatedAt: now(),
  };
  saveTask(task);

  try {
    const entries = await fs.readdir(resolvedSource, { withFileTypes: true });
    let moved = 0;

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase().replace(".", "");
      const rule = rules.find(
        (r) =>
          r.category === ext ||
          (r.extensions?.some((e) => e.toLowerCase() === ext) ?? false),
      );
      if (!rule) continue;

      const destDir = path.join(resolvedSource, rule.category);
      await fs.mkdir(destDir, { recursive: true });
      await fs.rename(
        path.join(resolvedSource, entry.name),
        path.join(destDir, entry.name),
      );
      moved++;
    }

    task.status = "completed";
    task.result = { message: `Organized ${moved} files in ${resolvedSource}` };
  } catch (err) {
    task.status = "failed";
    task.error = err instanceof Error ? err.message : "Organize failed";
  }

  saveTask(task);
  return task;
}

export async function runRoadmapStep(
  roadmapId: string,
  options: { wsl?: boolean; consensusSessionId?: string } = {},
): Promise<Roadmap> {
  const roadmap = roadmaps.get(roadmapId);
  if (!roadmap) throw new Error(`Roadmap not found: ${roadmapId}`);

  if (options.consensusSessionId) {
    assertConsensusAuthorized(options.consensusSessionId);
    roadmap.consensusSessionId = options.consensusSessionId;
  }

  if (roadmap.currentStep >= roadmap.steps.length) {
    roadmap.status = "completed";
    roadmap.updatedAt = now();
    return roadmap;
  }

  roadmap.status = "running";
  roadmap.updatedAt = now();

  const step = roadmap.steps[roadmap.currentStep];

  try {
    if (step.type === "shell" && step.shellCommand) {
      const result = await runShell(step.shellCommand, {
        wsl: step.wsl ?? options.wsl ?? true,
      });
      roadmap.results.push({
        stepId: step.id,
        ok: result.exitCode === 0,
        output: result.stdout,
        error: result.exitCode !== 0 ? result.stderr : undefined,
      });
      if (result.exitCode !== 0) {
        roadmap.status = "failed";
        roadmap.updatedAt = now();
        return roadmap;
      }
    } else if (step.type === "organize" && step.organize) {
      const task = await organizeFiles(
        step.organize.sourceDir,
        step.organize.rules,
        { wsl: step.wsl, consensusSessionId: roadmap.consensusSessionId },
      );
      roadmap.results.push({
        stepId: step.id,
        ok: task.status === "completed",
        output: (task.result as { message?: string })?.message,
        error: task.error,
      });
      if (task.status !== "completed") {
        roadmap.status = "failed";
        roadmap.updatedAt = now();
        return roadmap;
      }
    } else if (step.type === "process_launch" && step.process) {
      const { pid, label } = launchProcess({
        ...step.process,
        wsl: step.process.wsl ?? step.wsl ?? options.wsl,
      });
      roadmap.results.push({
        stepId: step.id,
        ok: pid > 0,
        output: `Launched ${label} (pid ${pid})`,
      });
    }

    roadmap.currentStep++;
    if (roadmap.currentStep >= roadmap.steps.length) {
      roadmap.status = "completed";
    } else {
      roadmap.status = "pending";
    }
  } catch (err) {
    roadmap.results.push({
      stepId: step.id,
      ok: false,
      error: err instanceof Error ? err.message : "Step failed",
    });
    roadmap.status = "failed";
  }

  roadmap.updatedAt = now();
  roadmaps.set(roadmapId, roadmap);
  return roadmap;
}

export function createRoadmap(name: string, steps: RoadmapStep[]): Roadmap {
  const roadmap: Roadmap = {
    id: createTaskId("roadmap"),
    name,
    steps,
    currentStep: 0,
    status: "pending",
    results: [],
    createdAt: now(),
    updatedAt: now(),
  };
  roadmaps.set(roadmap.id, roadmap);
  return roadmap;
}

export async function runRoadmapToCompletion(
  roadmapId: string,
  options: { wsl?: boolean; consensusSessionId?: string } = {},
): Promise<Roadmap> {
  let roadmap = roadmaps.get(roadmapId);
  if (!roadmap) throw new Error(`Roadmap not found: ${roadmapId}`);

  while (
    roadmap.status !== "completed" &&
    roadmap.status !== "failed" &&
    roadmap.currentStep < roadmap.steps.length
  ) {
    roadmap = await runRoadmapStep(roadmapId, options);
  }
  return roadmap;
}

export function getHostStatus(): {
  platform: string;
  workspaceRoot: string;
  wslAvailable: boolean;
  nodeVersion: string;
  pid: number;
} {
  return {
    platform: process.platform,
    workspaceRoot: WORKSPACE_ROOT,
    wslAvailable: process.platform === "win32",
    nodeVersion: process.version,
    pid: process.pid,
  };
}
