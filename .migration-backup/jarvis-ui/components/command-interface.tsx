"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Sparkles, Square } from "lucide-react";
import { useRef, useState } from "react";
import { GlassmorphicPanel } from "./glassmorphic-panel";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const RESPONSES = [
  "Acknowledged. Routing request through the neural core now.",
  "Analysis complete. All subsystems operating within nominal parameters.",
  "Understood. I have updated the sovereign protocol accordingly.",
  "Scanning... no anomalies detected across the network mesh.",
  "Command executed. Telemetry feeds are synchronized.",
];

type CommandInterfaceProps = {
  onSpeakingChange?: (speaking: boolean) => void;
};

export function CommandInterface({ onSpeakingChange }: CommandInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      text: "Sovereign protocol engaged. How may I assist you, Commander?",
    },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const text = value.trim();
    if (!text || busy) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };
    setMessages((m) => [...m, userMsg]);
    setValue("");
    setBusy(true);
    onSpeakingChange?.(true);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: RESPONSES[Math.floor(Math.random() * RESPONSES.length)],
      };
      setMessages((m) => [...m, reply]);
      setBusy(false);
      onSpeakingChange?.(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }, 1800);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  return (
    <GlassmorphicPanel
      className="flex max-h-[60vh] flex-col p-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div
        ref={scrollRef}
        className="mb-3 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl border px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 text-foreground"
                    : "border-[var(--color-purple)]/30 bg-[var(--color-purple)]/10 text-foreground"
                }`}
              >
                {m.role === "assistant" && (
                  <span className="mb-1 flex items-center gap-1 text-[0.65rem] uppercase tracking-widest text-[var(--color-purple-soft)]">
                    <Sparkles className="h-3 w-3" /> Jarvis
                  </span>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--color-purple)]/30 bg-[var(--color-purple)]/10 px-3.5 py-2.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="group relative flex items-center gap-2 rounded-2xl border border-white/15 bg-black/30 px-3 py-2 transition-all focus-within:border-[var(--color-cyan)]/60 focus-within:shadow-[0_0_24px_rgba(0,212,255,0.25)]">
        <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-cyan)]/70" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Issue a command to Jarvis..."
          aria-label="Command input"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <motion.button
          type="button"
          onClick={send}
          disabled={!value.trim() && !busy}
          whileTap={{ scale: 0.9 }}
          aria-label="Send command"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-purple)] text-background transition-opacity disabled:opacity-40"
        >
          {busy ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </GlassmorphicPanel>
  );
}
