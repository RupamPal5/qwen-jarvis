import { Router } from "express";
import {
  authorizeConsensusSession,
  getConsensusSession,
  runConsensusPipeline,
} from "../services/consensus/orchestrator";
import type { AuthorizeRequest, ProposeRequest } from "../services/consensus/types";

const router = Router();

/**
 * POST /api/consensus/propose
 * Runs the full Tri-Node pipeline synchronously.
 * State-altering payloads return phase AWAITING_AUTHORIZATION for the UI modal.
 */
router.post("/consensus/propose", async (req, res) => {
  const body = req.body as ProposeRequest;

  if (!body.prompt?.trim()) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const result = await runConsensusPipeline({
      prompt: body.prompt.trim(),
      context: body.context,
      autoExecuteReadOnly: body.autoExecuteReadOnly ?? false,
    });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Consensus pipeline failed";
    res.status(502).json({ error: message });
  }
});

/**
 * POST /api/consensus/stream
 * SSE stream of Tri-Node phase events for live UI telemetry.
 */
router.post("/consensus/stream", async (req, res) => {
  const body = req.body as ProposeRequest;

  if (!body.prompt?.trim()) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event: unknown) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    const result = await runConsensusPipeline(
      {
        prompt: body.prompt.trim(),
        context: body.context,
        autoExecuteReadOnly: body.autoExecuteReadOnly ?? false,
      },
      (event) => send(event),
    );
    send({ type: "result", data: result });
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Consensus stream failed";
    send({ type: "error", message });
    res.end();
  }
});

/**
 * POST /api/consensus/authorize
 * Override Gate — human-in-the-loop approval/denial.
 * Implementor cannot bypass this for state-altering operations.
 */
router.post("/consensus/authorize", async (req, res) => {
  const body = req.body as AuthorizeRequest;

  if (!body.sessionId) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  if (typeof body.approved !== "boolean") {
    res.status(400).json({ error: "approved (boolean) is required" });
    return;
  }

  try {
    const result = await authorizeConsensusSession(
      body.sessionId,
      body.approved,
      body.authorizedBy,
    );
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authorization failed";
    const status = message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

/**
 * GET /api/consensus/sessions/:id
 * Poll session state for Permission Gate modal and Council UI.
 */
router.get("/consensus/sessions/:id", (req, res) => {
  const session = getConsensusSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(session);
});

export default router;
