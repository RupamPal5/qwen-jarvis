import { Router, Multer } from "express";
import { createClient } from 'indexeddb-client';
import multer from 'multer';

const router = Router();

const OLLAMA_BASE = process.env["OLLAMA_URL"]?? "http://localhost:11434";
const db = await createClient('ollama-db');
const upload = multer({ dest: './uploads/' });

async function ollamaFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${OLLAMA_BASE}${path}`, options);
  return res;
}

router.post("/api/v1/sensory/ingestion", upload.array('files', 12), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    for (const file of files) {
      await db.put('files', file.buffer);
    }
    res.json({ message: 'Files uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload files' });
  }
}
  try {
    const r = await ollamaFetch("/api/tags");
    if (!r.ok) { res.status(502).json({ error: "Ollama unreachable" }); return; }
    const data = await r.json() as { models: unknown[] };
    await db.put('models', data);
    res.json(data);
  } catch {
    res.status(502).json({ error: "Ollama offline" });
  }
});

router.get("/ollama/status", async (_req, res) => {
  try {
    const r = await ollamaFetch("/api/tags");
    if (!r.ok) { res.json({ online: false }); return; }
    const data = await r.json() as { models: { name: string; size: number; modified_at: string }[] };
    res.json({ online: true, modelCount: data.models?.length?? 0, models: data.models?? [] });
  } catch {
    res.json({ online: false, modelCount: 0, models: [] });
  }
});

router.post("/ollama/chat", async (req, res) => {
  const { model, messages, stream } = req.body as {
    model: string;
    messages: { role: string; content: string }[];
    stream?: boolean;
  };

  if (!model ||!messages) {
    res.status(400).json({ error: "model and messages required" });
    return;
  }

  try {
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const r = await ollamaFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true }),
      });

      if (!r.ok ||!r.body) {
        res.write(`data: ${JSON.stringify({ error: "Ollama error" })}\n\n`);
        res.end();
        return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
            if (parsed.message?.content) {
              res.write(`data: ${JSON.stringify({ token: parsed.message.content })}\n\n`);
              await db.put('chat', parsed.message.content);
            }
            if (parsed.done) {
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            }
          } catch { /* skip */ }
        }
      }
      res.end();
    } else {
      const r = await ollamaFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: false }),
      });
      if (!r.ok) { res.status(502).json({ error: "Ollama error" }); return; }
      const data = await r.json();
      res.json(data);
    }
  } catch (err) {
    res.status(502).json({ error: "Ollama offline" });
  }
});

router.post("/api/v1/sensory/ingestion/video", upload.single('video'), async (req, res) => {
  try {
    const video = req.file as Express.Multer.File;
    const frames = await extractFramesFromVideo(video.buffer);
    for (const frame of frames) {
      await db.put('frames', frame);
    }
    res.json({ message: 'Video frames extracted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract video frames' });
  }
}
  const { model, prompt, stream } = req.body as { model: string; prompt: string; stream?: boolean };
  if (!model ||!prompt) { res.status(400).json({ error: "model and prompt required" }); return; }

  try {
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const r = await ollamaFetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: true }),
      });

      if (!r.ok ||!r.body) { res.write(`data: ${JSON.stringify({ error: "Ollama error" })}\n\n`); res.end(); return; }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const p = JSON.parse(line) as { response?: string; done?: boolean };
            if (p.response) res.write(`data: ${JSON.stringify({ token: p.response })}\n\n`);
            if (p.done) res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          } catch { /* skip */ }
        }
      }
      res.end();
    } else {
      const r = await ollamaFetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: false }),
      });
      if (!r.ok) { res.status(502).json({ error: "Ollama error" }); return; }
      res.json(await r.json());
    }
  } catch { res.status(502).json({ error: "Ollama offline" }); }
});

import { ErrorRequestHandler } from "express";

// Add error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};

router.use(errorHandler);

export default router;
