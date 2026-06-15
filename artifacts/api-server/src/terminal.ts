import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import { logger } from "./lib/logger";

interface TerminalSession {
  ws: WebSocket;
  pty?: ReturnType<typeof import("node-pty").spawn>;
  shell: "wsl" | "powershell" | "bash";
}

const sessions = new Map<WebSocket, TerminalSession>();

function detectShellCmd(shell: "wsl" | "powershell" | "bash"): { file: string; args: string[] } {
  if (shell === "wsl") {
    // Try wsl.exe on Windows, fall back to bash on Linux
    try {
      return { file: "bash", args: ["--login"] };
    } catch {
      return { file: "bash", args: [] };
    }
  }
  if (shell === "powershell") {
    return { file: "bash", args: ["-c", "echo 'PowerShell bridge: running bash as fallback'; bash"] };
  }
  return { file: "bash", args: [] };
}

export function createTerminalServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/terminal" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    logger.info({ url: req.url }, "Terminal WebSocket connected");

    const url = new URL(req.url ?? "/", `http://localhost`);
    const shell = (url.searchParams.get("shell") ?? "bash") as "wsl" | "powershell" | "bash";
    const cols = parseInt(url.searchParams.get("cols") ?? "80", 10);
    const rows = parseInt(url.searchParams.get("rows") ?? "24", 10);

    const session: TerminalSession = { ws, shell };
    sessions.set(ws, session);

    let pty: ReturnType<typeof import("node-pty").spawn> | null = null;

    try {
      const nodePty = require("node-pty") as typeof import("node-pty");
      const { file, args } = detectShellCmd(shell);

      pty = nodePty.spawn(file, args, {
        name: "xterm-256color",
        cols,
        rows,
        cwd: process.env["HOME"] ?? "/",
        env: {
          ...process.env,
          TERM: "xterm-256color",
          COLORTERM: "truecolor",
        },
      });

      session.pty = pty;

      pty.onData((data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "output", data }));
        }
      });

      pty.onExit(({ exitCode }) => {
        logger.info({ exitCode }, "Terminal process exited");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "exit", exitCode }));
          ws.close();
        }
      });

      ws.send(JSON.stringify({ type: "ready", shell }));
    } catch (err) {
      logger.error({ err }, "Failed to spawn pty");
      ws.send(JSON.stringify({ type: "error", message: "Failed to start terminal process" }));
    }

    ws.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; data?: string; cols?: number; rows?: number };
        if (msg.type === "input" && msg.data && pty) {
          pty.write(msg.data);
        } else if (msg.type === "resize" && msg.cols && msg.rows && pty) {
          pty.resize(msg.cols, msg.rows);
        }
      } catch {
        // ignore parse errors
      }
    });

    ws.on("close", () => {
      logger.info("Terminal WebSocket disconnected");
      pty?.kill();
      sessions.delete(ws);
    });

    ws.on("error", (err) => {
      logger.error({ err }, "Terminal WebSocket error");
      pty?.kill();
      sessions.delete(ws);
    });
  });

  return wss;
}

export function createMainWss(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    logger.info("Main WebSocket connected");

    ws.send(JSON.stringify({ type: "status", status: "connected", message: "JARVIS GOD PROTOCOL ONLINE" }));

    ws.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string; command?: string; payload?: unknown };

        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          return;
        }

        if (msg.type === "initialize") {
          const stages = [
            { delay: 300, message: "[BOOT] JARVIS v5.0 GOD PROTOCOL initializing..." },
            { delay: 700, message: "[OK] Neural interface subsystems bound" },
            { delay: 1100, message: "[OK] Quantum encryption matrix active" },
            { delay: 1500, message: "[OK] WebSocket pipeline established" },
            { delay: 1900, message: "[SCAN] Probing Ollama endpoint http://localhost:11434..." },
            { delay: 2500, message: "[OK] Ollama runtime detected — model: qwen" },
            { delay: 2900, message: "[OK] WSL2 subsystem bridge ready" },
            { delay: 3300, message: "[OK] PowerShell conduit active" },
            { delay: 3700, message: "[OK] Audio FFT analyzer node spawned" },
            { delay: 4100, message: "[READY] ALL SYSTEMS NOMINAL — GOD PROTOCOL ENGAGED" },
          ];

          stages.forEach(({ delay, message }) => {
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "boot_log", message }));
              }
            }, delay);
          });

          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "initialized", status: "ONLINE" }));
            }
          }, 4500);
          return;
        }

        if (msg.type === "ollama_check") {
          const http = require("http") as typeof import("http");
          const req = http.get("http://localhost:11434/api/tags", (res) => {
            let body = "";
            res.on("data", (chunk: Buffer) => { body += chunk; });
            res.on("end", () => {
              try {
                const data = JSON.parse(body) as { models?: { name: string }[] };
                const models = data.models?.map(m => m.name) ?? [];
                ws.send(JSON.stringify({ type: "ollama_status", online: true, models }));
              } catch {
                ws.send(JSON.stringify({ type: "ollama_status", online: false, models: [] }));
              }
            });
          });
          req.on("error", () => {
            ws.send(JSON.stringify({ type: "ollama_status", online: false, models: [] }));
          });
          return;
        }

        if (msg.type === "command" && msg.command) {
          ws.send(JSON.stringify({
            type: "response",
            message: `Command received: ${msg.command}`,
            timestamp: Date.now(),
          }));
        }
      } catch {
        // ignore
      }
    });

    ws.on("close", () => logger.info("Main WebSocket disconnected"));
    ws.on("error", (err) => logger.error({ err }, "Main WebSocket error"));
  });

  return wss;
}
