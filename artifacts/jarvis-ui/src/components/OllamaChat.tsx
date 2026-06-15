import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, RefreshCw, ChevronDown, Zap, CheckCircle,
  AlertCircle, HardDrive, Clock, Sparkles, Code2,
  Copy, Trash2, Bot, User, ChevronUp, Settings2,
  ExternalLink, Terminal, Wifi,
} from "lucide-react";
import { useStore } from "../store";

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
  streaming?: boolean;
}

const LS_URL_KEY = "jarvis_ollama_url";
const LS_MODEL_KEY = "jarvis_ollama_model";
const DEFAULT_URL = "http://localhost:11434";

function formatBytes(b: number) {
  if (b > 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b > 1e6) return `${(b / 1e6).toFixed(0)} MB`;
  return `${b} B`;
}

function formatModel(name: string) {
  return name.replace(/:latest$/, "");
}

const SUGGESTED = [
  "Explain quantum computing simply",
  "Write a Python async web scraper",
  "Debug: why is my React hook not updating?",
  "What's your architecture?",
];

export default function OllamaChat() {
  const { setOllamaStatus } = useStore();

  const [ollamaUrl, setOllamaUrl] = useState<string>(
    () => localStorage.getItem(LS_URL_KEY) ?? DEFAULT_URL
  );
  const [urlInput, setUrlInput] = useState(ollamaUrl);
  const [showUrlConfig, setShowUrlConfig] = useState(false);

  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem(LS_MODEL_KEY) ?? ""
  );
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, 30);
  }, []);

  const fetchModels = useCallback(async (url?: string) => {
    const target = url ?? ollamaUrl;
    try {
      const r = await fetch(`${target}/api/tags`, { signal: AbortSignal.timeout(4000) });
      if (!r.ok) throw new Error("bad response");
      const data = await r.json() as { models: OllamaModel[] };
      setOllamaOnline(true);
      setOllamaStatus(true, data.models?.length ?? 0);
      setModels(data.models ?? []);
      setSelectedModel(prev => {
        if (prev) return prev;
        const saved = localStorage.getItem(LS_MODEL_KEY);
        if (saved) return saved;
        if (data.models.length > 0) {
          localStorage.setItem(LS_MODEL_KEY, data.models[0].name);
          return data.models[0].name;
        }
        return prev;
      });
    } catch {
      setOllamaOnline(false);
      setOllamaStatus(false, 0);
      setModels([]);
    }
  }, [ollamaUrl, setOllamaStatus]);

  useEffect(() => {
    fetchModels();
    const t = setInterval(() => fetchModels(), 30000);
    return () => clearInterval(t);
  }, [fetchModels]);

  useEffect(() => { scrollBottom(); }, [messages, scrollBottom]);

  const saveUrl = () => {
    const cleaned = urlInput.replace(/\/+$/, "");
    setOllamaUrl(cleaned);
    localStorage.setItem(LS_URL_KEY, cleaned);
    setShowUrlConfig(false);
    fetchModels(cleaned);
  };

  const selectModel = (name: string) => {
    setSelectedModel(name);
    localStorage.setItem(LS_MODEL_KEY, name);
    setModelDropOpen(false);
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedModel || sending || !ollamaOnline) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      model: selectedModel,
      timestamp: new Date(),
      streaming: true,
    }]);
    scrollBottom();

    const history = messages
      .filter(m => !m.streaming)
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();

    try {
      const r = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: "You are JARVIS v5.0, an advanced AI assistant. Be precise, technical, and helpful." },
            ...history,
            { role: "user", content: text },
          ],
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!r.ok || !r.body) throw new Error("Ollama error");

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value);
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const p = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
            if (p.message?.content) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + (p.message?.content ?? "") } : m
              ));
              scrollBottom();
            }
            if (p.done) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, streaming: false } : m
              ));
            }
          } catch { /* skip */ }
        }
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ));
    } catch (err: unknown) {
      const cancelled = err instanceof Error && err.name === "AbortError";
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: cancelled ? (m.content || "[Stopped]") : "⚠️ Could not reach Ollama. Is `ollama serve` running on your laptop?", streaming: false }
          : m
      ));
    } finally {
      setSending(false);
    }
  }, [input, selectedModel, sending, ollamaOnline, ollamaUrl, messages, scrollBottom]);

  const stopGeneration = () => {
    abortRef.current?.abort();
    setSending(false);
  };

  const formatContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lang = part.match(/^```(\w*)/)?.[1] ?? "";
        const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
        return (
          <div key={i} className="my-2 rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/10">
              <span className="text-[10px] font-mono text-cyan-400">{lang || "code"}</span>
              <button onClick={() => navigator.clipboard.writeText(code).catch(() => {})} className="text-white/40 hover:text-white transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-green-300 overflow-x-auto bg-black/60 whitespace-pre-wrap">{code}</pre>
          </div>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">

        {/* Ollama status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono ${
          ollamaOnline === true ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"
          : ollamaOnline === false ? "border-red-500/30 bg-red-950/20 text-red-400"
          : "border-yellow-500/30 bg-yellow-950/20 text-yellow-400"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            ollamaOnline === true ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
            : ollamaOnline === false ? "bg-red-400"
            : "bg-yellow-400 animate-pulse"
          }`} />
          {ollamaOnline === true ? "OLLAMA ONLINE" : ollamaOnline === false ? "OFFLINE" : "CONNECTING..."}
        </div>

        {/* Model dropdown */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <button
            onClick={() => setModelDropOpen(p => !p)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 hover:border-purple-400/50 text-sm text-white/80 transition-all"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{selectedModel ? formatModel(selectedModel) : "Select model..."}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/40 flex-shrink-0 transition-transform ${modelDropOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {modelDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="absolute left-0 top-full mt-1 w-full min-w-[260px] bg-black/95 border border-purple-500/30 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
              >
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-white/40 tracking-widest">YOUR OLLAMA MODELS</span>
                  <button onClick={() => { fetchModels(); }} className="text-white/30 hover:text-white/60 transition-colors">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                {models.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-white/40 text-center font-mono">
                    {ollamaOnline === false ? "Ollama unreachable — check URL" : "Loading..."}
                  </div>
                ) : (
                  models.map(m => (
                    <button
                      key={m.name}
                      onClick={() => selectModel(m.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all hover:bg-white/5 ${selectedModel === m.name ? "bg-purple-950/40 text-purple-300" : "text-white/70"}`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedModel === m.name
                          ? <CheckCircle className="w-3 h-3 text-purple-400" />
                          : <div className="w-3 h-3 rounded-full border border-white/20" />}
                        <span className="font-mono">{formatModel(m.name)}</span>
                      </div>
                      <span className="text-white/30 font-mono">{formatBytes(m.size)}</span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats toggle */}
        <button
          onClick={() => setStatsOpen(p => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/30 border border-white/10 hover:border-cyan-500/30 text-xs text-white/50 hover:text-cyan-400 transition-all"
        >
          {statsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span className="font-mono hidden sm:inline">Models</span>
        </button>

        {/* URL config button */}
        <button
          onClick={() => setShowUrlConfig(p => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/30 border border-white/10 hover:border-purple-500/30 text-xs text-white/50 hover:text-purple-400 transition-all"
          title="Configure Ollama URL"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        {/* Clear chat */}
        <button onClick={() => setMessages([])} className="p-2 rounded-lg bg-black/30 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-400 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── URL Config Panel ── */}
      <AnimatePresence>
        {showUrlConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300">
                <ExternalLink className="w-3.5 h-3.5" />
                Ollama URL — enter your laptop&apos;s address (e.g. <code className="bg-black/40 px-1 rounded">http://192.168.1.x:11434</code>)
              </div>
              <div className="flex gap-2">
                <input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveUrl()}
                  placeholder="http://localhost:11434"
                  className="flex-1 bg-black/50 border border-white/10 focus:border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none placeholder-white/30 transition-colors"
                />
                <button
                  onClick={saveUrl}
                  className="px-4 py-2 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition-all text-sm font-mono"
                >
                  Connect
                </button>
              </div>
              <p className="text-[10px] text-white/30 font-mono">
                Current: {ollamaUrl} — Tip: run <code className="bg-black/40 px-1 rounded">ollama serve</code> on your laptop, then enter its LAN IP above.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Model Stats Grid ── */}
      <AnimatePresence>
        {statsOpen && models.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {models.map(m => (
                <div
                  key={m.name}
                  onClick={() => selectModel(m.name)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedModel === m.name ? "border-purple-500/50 bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10 bg-black/20 hover:border-purple-500/20"}`}
                >
                  <div className="flex items-center gap-1 mb-2">
                    <Zap className={`w-3 h-3 flex-shrink-0 ${selectedModel === m.name ? "text-purple-400" : "text-white/30"}`} />
                    <span className="text-[10px] font-mono text-white/80 truncate">{formatModel(m.name)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <HardDrive className="w-3 h-3 flex-shrink-0" />{formatBytes(m.size)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/25 mt-0.5">
                    <Clock className="w-3 h-3 flex-shrink-0" />{new Date(m.modified_at).toLocaleDateString()}
                  </div>
                  {selectedModel === m.name && (
                    <div className="mt-1.5 text-[9px] font-mono text-purple-400 tracking-wider">▶ ACTIVE</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Area ── */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(168,85,247,0.3) transparent" }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 overflow-y-auto">
            {ollamaOnline === false ? (
              /* ── Offline Setup Guide ── */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl space-y-3"
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 rounded-2xl border"
                  style={{ background: "color-mix(in srgb, var(--accent-primary) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-primary) 30%, transparent)" }}>
                  <Wifi className="w-5 h-5 flex-shrink-0" style={{ color: "var(--accent-primary)" }} />
                  <div>
                    <p className="text-sm font-mono font-bold" style={{ color: "var(--accent-primary)" }}>OLLAMA NOT DETECTED</p>
                    <p className="text-[11px] text-white/50 mt-0.5">Follow the steps below to connect your local AI models</p>
                  </div>
                  <button
                    onClick={() => fetchModels()}
                    className="ml-auto p-2 rounded-lg border border-white/10 hover:border-white/30 text-white/40 hover:text-white/80 transition-all"
                    title="Retry connection"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-black" style={{ background: "var(--accent-primary)" }}>1</span>
                    <p className="text-xs font-mono font-bold text-white/80">INSTALL OLLAMA (if not already)</p>
                  </div>
                  <p className="text-[11px] text-white/50 mb-2">Download from <span className="font-mono text-white/70">ollama.com</span> → Install on Windows → confirm with:</p>
                  <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 border border-white/10">
                    <Terminal className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <code className="text-[11px] font-mono text-emerald-400 flex-1">ollama --version</code>
                    <button onClick={() => navigator.clipboard.writeText("ollama --version")} className="text-white/20 hover:text-white/60 transition-colors"><Copy className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-black" style={{ background: "var(--accent-primary)" }}>2</span>
                    <p className="text-xs font-mono font-bold text-white/80">START OLLAMA WITH CORS ENABLED</p>
                  </div>
                  <p className="text-[11px] text-white/50 mb-2">Open <strong className="text-white/70">PowerShell</strong> on your laptop and run:</p>
                  <div className="bg-black/60 rounded-lg px-3 py-2.5 border border-white/10 space-y-1">
                    <div className="flex items-start gap-2">
                      <Terminal className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />
                      <code className="text-[11px] font-mono text-yellow-300 flex-1 leading-relaxed">
                        $env:OLLAMA_ORIGINS="*"<br />
                        $env:OLLAMA_HOST="0.0.0.0"<br />
                        ollama serve
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText('$env:OLLAMA_ORIGINS="*"\n$env:OLLAMA_HOST="0.0.0.0"\nollama serve')}
                        className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
                        title="Copy commands"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">⚠ If Ollama is already running, kill it first: <code className="bg-black/40 px-1 rounded">taskkill /F /IM ollama.exe</code></p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-black" style={{ background: "var(--accent-primary)" }}>3</span>
                    <p className="text-xs font-mono font-bold text-white/80">PULL A MODEL (if you haven't yet)</p>
                  </div>
                  <p className="text-[11px] text-white/50 mb-2">In a <strong className="text-white/70">new</strong> PowerShell window:</p>
                  <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 border border-white/10">
                    <Terminal className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <code className="text-[11px] font-mono text-emerald-400 flex-1">ollama pull gemma3:12b</code>
                    <button onClick={() => navigator.clipboard.writeText("ollama pull gemma3:12b")} className="text-white/20 hover:text-white/60 transition-colors"><Copy className="w-3 h-3" /></button>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-black" style={{ background: "var(--accent-primary)" }}>4</span>
                    <p className="text-xs font-mono font-bold text-white/80">SET THE URL IN JARVIS (default is correct)</p>
                  </div>
                  <p className="text-[11px] text-white/50 mb-2">Click the ⚙ gear icon above → set URL to:</p>
                  <div className="flex items-center gap-2 bg-black/50 rounded-lg px-3 py-2 border border-white/10">
                    <code className="text-[11px] font-mono text-cyan-300 flex-1">http://localhost:11434</code>
                    <button onClick={() => navigator.clipboard.writeText("http://localhost:11434")} className="text-white/20 hover:text-white/60 transition-colors"><Copy className="w-3 h-3" /></button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">Then click the <RefreshCw className="w-3 h-3 inline" /> button above to retry.</p>
                </div>
              </motion.div>
            ) : ollamaOnline === null ? (
              /* ── Connecting ── */
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-white/20" />
                <p className="text-white/30 text-xs font-mono">Connecting to Ollama…</p>
              </div>
            ) : (
              /* ── Online / Ready ── */
              <div className="flex flex-col items-center text-center">
                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <Brain className="w-14 h-14 mb-4 mx-auto" style={{ color: "color-mix(in srgb, var(--accent-primary) 40%, transparent)" }} />
                </motion.div>
                <p className="text-white/40 text-sm font-mono mb-1">JARVIS Neural Interface</p>
                <p className="text-white/25 text-xs font-mono">
                  {selectedModel ? `Model: ${formatModel(selectedModel)} • Ready` : "Select a model above to begin"}
                </p>
                {selectedModel && (
                  <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
                    {SUGGESTED.map(s => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white/80 transition-all text-left"
                      >
                        <Sparkles className="w-3 h-3 inline mr-1.5" style={{ color: "var(--accent-primary)" }} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-purple-900/60 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[82%] group relative`}>
                <div className={`p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-900/40 border border-purple-500/30 text-white"
                    : "bg-black/50 border border-white/10 text-white/90"
                }`}>
                  <div className="flex items-center justify-between mb-1.5 gap-4">
                    <span className="text-[10px] font-mono text-white/30">
                      {msg.role === "user" ? "YOU" : `JARVIS • ${formatModel(msg.model ?? selectedModel)}`}
                    </span>
                    <span className="text-[9px] text-white/20 font-mono">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div>
                    {formatContent(msg.content)}
                    {msg.streaming && (
                      <motion.span
                        className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 align-middle rounded-sm"
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.65 }}
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(msg.content).catch(() => {})}
                  className="absolute -right-7 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-white/30 hover:text-white/70"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 space-y-2">
        {ollamaOnline === false && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Ollama offline — run <code className="bg-black/40 px-1 rounded font-mono">ollama serve</code> on your laptop, then set the IP via <Settings2 className="w-3 h-3 inline" /></span>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder={
              ollamaOnline === false ? "Ollama offline..."
              : !selectedModel ? "Select a model first..."
              : `Message ${formatModel(selectedModel)}… (Enter ↵ send, Shift+Enter for newline)`
            }
            disabled={!selectedModel || ollamaOnline === false}
            rows={1}
            className="flex-1 bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 resize-none outline-none transition-colors disabled:opacity-40"
            style={{ minHeight: "48px", maxHeight: "120px" }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          {sending ? (
            <button
              onClick={stopGeneration}
              className="px-4 rounded-xl bg-red-600/30 border border-red-500/40 text-red-400 hover:bg-red-600/50 transition-all flex items-center gap-1.5 text-sm font-mono"
            >
              <div className="w-3 h-3 bg-red-400 rounded-sm flex-shrink-0" />
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !selectedModel || ollamaOnline === false}
              className="px-4 rounded-xl bg-gradient-to-r from-purple-600/40 to-cyan-600/30 border border-purple-500/40 text-purple-300 hover:from-purple-600/60 hover:to-cyan-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
            >
              <Code2 className="w-4 h-4" />
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
