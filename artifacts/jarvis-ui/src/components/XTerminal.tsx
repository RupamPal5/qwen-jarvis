"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Maximize2, Minimize2, X, RefreshCw, ChevronDown } from "lucide-react";

type ShellType = "bash" | "wsl" | "powershell";

interface XTerminalProps {
  shell?: ShellType;
  wsBaseUrl?: string;
  title?: string;
  onClose?: () => void;
  className?: string;
  height?: number;
}

function buildWsUrl(wsBaseUrl: string | undefined, shell: ShellType, cols: number, rows: number): string {
  const base = wsBaseUrl
    ? wsBaseUrl.replace(/^http/, "ws").replace(/\/$/, "")
    : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
  return `${base}/ws/terminal?shell=${shell}&cols=${cols}&rows=${rows}`;
}

export default function XTerminal({
  shell = "bash",
  wsBaseUrl,
  title,
  onClose,
  className = "",
  height = 400,
}: XTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<import("@xterm/xterm").Terminal | null>(null);
  const fitRef = useRef<import("@xterm/addon-fit").FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [activeShell, setActiveShell] = useState<ShellType>(shell);
  const initRef = useRef(false);

  const connectTerminal = useCallback(async (shellType: ShellType) => {
    if (!containerRef.current) return;

    const { Terminal: XTerm } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");
    const { WebLinksAddon } = await import("@xterm/addon-web-links");

    // Cleanup existing
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (termRef.current) {
      termRef.current.dispose();
      termRef.current = null;
    }

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 13,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      theme: {
        background: "#050010",
        foreground: "#e2d9ff",
        cursor: "#c026d3",
        cursorAccent: "#050010",
        black: "#1a1025",
        red: "#f87171",
        green: "#4ade80",
        yellow: "#facc15",
        blue: "#60a5fa",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#e2d9ff",
        brightBlack: "#6b7280",
        brightRed: "#fca5a5",
        brightGreen: "#86efac",
        brightYellow: "#fde68a",
        brightBlue: "#93c5fd",
        brightMagenta: "#d8b4fe",
        brightCyan: "#67e8f9",
        brightWhite: "#f5f3ff",
        selectionBackground: "rgba(192,38,211,0.3)",
      },
      allowProposedApi: true,
      scrollback: 5000,
      convertEol: true,
    });

    const fit = new FitAddon();
    const webLinks = new WebLinksAddon();
    term.loadAddon(fit);
    term.loadAddon(webLinks);

    termRef.current = term;
    fitRef.current = fit;

    containerRef.current.innerHTML = "";
    term.open(containerRef.current);

    setTimeout(() => {
      try { fit.fit(); } catch { /* ignore */ }
    }, 50);

    const cols = term.cols;
    const rows = term.rows;
    const wsUrl = buildWsUrl(wsBaseUrl, shellType, cols, rows);

    term.writeln(`\r\x1b[35m╔══════════════════════════════════════╗\x1b[0m`);
    term.writeln(`\r\x1b[35m║  \x1b[36mJARVIS TERMINAL BRIDGE\x1b[35m              ║\x1b[0m`);
    term.writeln(`\r\x1b[35m║  \x1b[33mShell: ${shellType.padEnd(30)}\x1b[35m║\x1b[0m`);
    term.writeln(`\r\x1b[35m╚══════════════════════════════════════╝\x1b[0m`);
    term.writeln(`\r\x1b[90mConnecting to ${wsUrl}...\x1b[0m`);

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      term.writeln(`\r\x1b[31m[ERROR] Could not connect — running in demo mode\x1b[0m`);
      term.writeln(`\r\x1b[33m$ \x1b[0m`);
      setError("Demo mode — backend not available");
      setConnected(false);

      term.onData((data) => {
        term.write(data);
      });
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      term.writeln(`\r\x1b[32m[CONNECTED] Terminal bridge established\x1b[0m\r`);
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data as string) as { type: string; data?: string; message?: string };
        if (msg.type === "output" && msg.data) {
          term.write(msg.data);
        } else if (msg.type === "error") {
          term.writeln(`\r\x1b[31m[ERROR] ${msg.message ?? "Unknown error"}\x1b[0m`);
          setError(msg.message ?? "Terminal error");
        } else if (msg.type === "exit") {
          term.writeln(`\r\x1b[33m[PROCESS EXITED]\x1b[0m`);
          setConnected(false);
        }
      } catch {
        // raw string output
        term.write(evt.data as string);
      }
    };

    ws.onerror = () => {
      term.writeln(`\r\x1b[31m[CONNECTION ERROR] Backend unreachable — demo mode\x1b[0m`);
      term.writeln(`\r\x1b[33m$ \x1b[0m`);
      setConnected(false);
      setError("Backend unreachable");
      term.onData((data) => { term.write(data); });
    };

    ws.onclose = () => {
      setConnected(false);
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input", data }));
      }
    });

    term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", cols, rows }));
      }
    });
  }, [wsBaseUrl]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    connectTerminal(activeShell);

    const resizeObs = new ResizeObserver(() => {
      try { fitRef.current?.fit(); } catch { /* ignore */ }
    });
    if (containerRef.current) resizeObs.observe(containerRef.current);

    return () => {
      resizeObs.disconnect();
      wsRef.current?.close();
      termRef.current?.dispose();
    };
  }, []);

  const switchShell = (s: ShellType) => {
    setActiveShell(s);
    initRef.current = true;
    connectTerminal(s);
  };

  return (
    <motion.div
      layout
      className={`flex flex-col rounded-xl border border-purple-500/25 bg-black/80 backdrop-blur overflow-hidden ${maximized ? "fixed inset-4 z-50" : ""} ${className}`}
      style={{ height: maximized ? undefined : height }}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-purple-950/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-mono text-purple-300 tracking-wider">
            {title ?? `TERMINAL — ${activeShell.toUpperCase()}`}
          </span>
          <div className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-red-500/60"}`} />
        </div>

        <div className="flex items-center gap-1">
          {/* Shell switcher */}
          {(["bash", "wsl", "powershell"] as ShellType[]).map(s => (
            <button
              key={s}
              onClick={() => switchShell(s)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                activeShell === s ? "bg-purple-600/60 text-purple-200" : "text-white/40 hover:text-white/70"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}

          <button
            onClick={() => connectTerminal(activeShell)}
            className="p-1 text-white/40 hover:text-white/80 transition-colors ml-1"
            title="Reconnect"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMaximized(m => !m)}
            className="p-1 text-white/40 hover:text-white/80 transition-colors"
          >
            {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 text-white/40 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-yellow-900/20 border-b border-yellow-500/20 px-4 py-1.5 text-[10px] font-mono text-yellow-400 flex items-center gap-2 overflow-hidden flex-shrink-0"
          >
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 p-1"
        style={{
          background: "#050010",
        }}
      />
    </motion.div>
  );
}
