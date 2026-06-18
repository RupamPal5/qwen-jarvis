import { Router } from "express";
import { authorizeConsensusSession } from "../services/consensus/orchestrator";
import { listProcesses, launchProcess, killProcess } from "../services/execution/process-manager";
import {
  createRoadmap,
  executeConsensusPayload,
  getHostStatus,
  getRoadmap,
  getTask,
  listRoadmaps,
  listTasks,
  organizeFiles,
  runRoadmapStep,
  runRoadmapToCompletion,
} from "../services/execution/task-executor";
import type { OrganizeRule, RoadmapStep } from "../services/execution/types";

const router = Router();

/** GET /api/omnipresence/status — host environment telemetry */
router.get("/omnipresence/status", (_req, res) => {
  res.json({
    host: getHostStatus(),
    processes: listProcesses(),
    taskCount: listTasks().length,
    roadmapCount: listRoadmaps().length,
  });
});

/** GET /api/omnipresence/tasks */
router.get("/omnipresence/tasks", (_req, res) => {
  res.json({ tasks: listTasks() });
});

router.get("/omnipresence/tasks/:id", (req, res) => {
  const task = getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

/** GET /api/omnipresence/roadmaps */
router.get("/omnipresence/roadmaps", (_req, res) => {
  res.json({ roadmaps: listRoadmaps() });
});

router.get("/omnipresence/roadmaps/:id", (req, res) => {
  const roadmap = getRoadmap(req.params.id);
  if (!roadmap) {
    res.status(404).json({ error: "Roadmap not found" });
    return;
  }
  res.json(roadmap);
});

/**
 * POST /api/omnipresence/execute
 * Execute an authorized consensus session payload (WSL2 / shell).
 */
router.post("/omnipresence/execute", async (req, res) => {
  const { consensusSessionId, wsl } = req.body as {
    consensusSessionId?: string;
    wsl?: boolean;
  };
  if (!consensusSessionId) {
    res.status(400).json({ error: "consensusSessionId required" });
    return;
  }
  try {
    const task = await executeConsensusPayload(consensusSessionId, { wsl });
    res.json(task);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Execute failed";
    const status = message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

/**
 * POST /api/omnipresence/authorize-and-execute
 * Override Gate + host execution in one call (desktop domination hook).
 */
router.post("/omnipresence/authorize-and-execute", async (req, res) => {
  const { sessionId, approved, authorizedBy, wsl, executeEvolution } = req.body as {
    sessionId?: string;
    approved?: boolean;
    authorizedBy?: string;
    wsl?: boolean;
    executeEvolution?: { draftId: string };
  };

  if (!sessionId || typeof approved !== "boolean") {
    res.status(400).json({ error: "sessionId and approved (boolean) required" });
    return;
  }

  try {
    const auth = await authorizeConsensusSession(sessionId, approved, authorizedBy);
    if (!approved) {
      res.json({ authorization: auth, executed: null });
      return;
    }

    let evolutionResult = null;
    if (executeEvolution?.draftId) {
      const { applyEvolution } = await import("../services/evolution/evolution-service");
      evolutionResult = await applyEvolution(executeEvolution.draftId, sessionId);
    }

    const task = await executeConsensusPayload(sessionId, { wsl });
    res.json({ authorization: auth, task, evolution: evolutionResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authorize-and-execute failed";
    res.status(400).json({ error: message });
  }
});

/** POST /api/omnipresence/organize — file organization with optional consensus gate */
router.post("/omnipresence/organize", async (req, res) => {
  const { sourceDir, rules, consensusSessionId, wsl } = req.body as {
    sourceDir?: string;
    rules?: OrganizeRule[];
    consensusSessionId?: string;
    wsl?: boolean;
  };

  if (!sourceDir || !rules?.length) {
    res.status(400).json({ error: "sourceDir and rules required" });
    return;
  }

  try {
    const task = await organizeFiles(sourceDir, rules, {
      consensusSessionId,
      wsl,
    });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Organize failed" });
  }
});

/** POST /api/omnipresence/process/launch — launch background web/dev process */
router.post("/omnipresence/process/launch", async (req, res) => {
  const { command, cwd, env, wsl, label, consensusSessionId } = req.body as {
    command?: string;
    cwd?: string;
    env?: Record<string, string>;
    wsl?: boolean;
    label?: string;
    consensusSessionId?: string;
  };

  if (!command) {
    res.status(400).json({ error: "command required" });
    return;
  }

  try {
    if (consensusSessionId) {
      const { assertConsensusAuthorized } = await import("../services/execution/task-executor");
      assertConsensusAuthorized(consensusSessionId);
    }
    const { pid, label: procLabel } = launchProcess({
      command,
      cwd,
      env,
      wsl,
      label,
    });
    res.json({ pid, label: procLabel, status: "launched" });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Launch failed" });
  }
});

router.post("/omnipresence/process/kill", (req, res) => {
  const pid = Number(req.body?.pid);
  if (!pid) {
    res.status(400).json({ error: "pid required" });
    return;
  }
  const ok = killProcess(pid);
  res.json({ ok });
});

/**
 * POST /api/omnipresence/roadmap
 * Create structured long-term roadmap for sequential host execution.
 */
router.post("/omnipresence/roadmap", async (req, res) => {
  const { name, steps, runAll, consensusSessionId, wsl } = req.body as {
    name?: string;
    steps?: RoadmapStep[];
    runAll?: boolean;
    consensusSessionId?: string;
    wsl?: boolean;
  };

  if (!name || !steps?.length) {
    res.status(400).json({ error: "name and steps required" });
    return;
  }

  try {
    const roadmap = createRoadmap(name, steps);
    if (consensusSessionId) {
      const { assertConsensusAuthorized } = await import("../services/execution/task-executor");
      assertConsensusAuthorized(consensusSessionId);
      roadmap.consensusSessionId = consensusSessionId;
    }

    if (runAll) {
      const completed = await runRoadmapToCompletion(roadmap.id, {
        wsl,
        consensusSessionId,
      });
      res.json(completed);
      return;
    }

    res.json(roadmap);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Roadmap failed" });
  }
});

/** POST /api/omnipresence/roadmap/:id/step — advance roadmap by one step */
router.post("/omnipresence/roadmap/:id/step", async (req, res) => {
  try {
    const roadmap = await runRoadmapStep(req.params.id, {
      wsl: req.body?.wsl,
      consensusSessionId: req.body?.consensusSessionId,
    });
    res.json(roadmap);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Step failed" });
  }
});

export default router;
