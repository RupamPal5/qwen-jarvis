"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________ΔΣΦΨΩ01";

function useScramble(target: string, durationMs = 1400) {
  const [output, setOutput] = useState("");
  const frameRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const reveals = target.split("").map((_, i) => (i / target.length) * 0.6);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        const char = target[i];
        if (char === " ") {
          out += " ";
          continue;
        }
        if (progress >= reveals[i] + 0.4 || progress === 1) {
          out += char;
        } else if (progress >= reveals[i]) {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setOutput(out);
      frameRef.current += 1;
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setOutput(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return output;
}

export function HolographicHeader() {
  const title = useScramble("JARVIS SOVEREIGN");

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.4em] text-[var(--color-cyan)]/70">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-cyan)]" />
        Neural Core Online
      </div>

      <div className="relative">
        <h1 className="font-mono text-3xl font-bold tracking-[0.15em] text-foreground text-glow-cyan sm:text-5xl">
          {title || "JARVIS SOVEREIGN"}
        </h1>
        {/* glitch layers */}
        <h1
          aria-hidden="true"
          className="glitch-layer absolute inset-0 font-mono text-3xl font-bold tracking-[0.15em] text-[var(--color-cyan)] sm:text-5xl"
          style={{ clipPath: "inset(0 0 55% 0)" }}
        >
          JARVIS SOVEREIGN
        </h1>
        <h1
          aria-hidden="true"
          className="glitch-layer absolute inset-0 font-mono text-3xl font-bold tracking-[0.15em] text-[var(--color-purple)] sm:text-5xl"
          style={{ clipPath: "inset(55% 0 0 0)", animationDelay: "0.15s" }}
        >
          JARVIS SOVEREIGN
        </h1>
      </div>

      <p className="mt-3 max-w-md text-pretty text-sm text-muted-foreground">
        Autonomous command interface · v4.2 · Sovereign protocol engaged
      </p>
    </div>
  );
}
