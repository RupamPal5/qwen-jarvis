export type ThemeId = "cyberpunk" | "night" | "morning" | "winter" | "desert";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  vars: Record<string, string>;
  bodyClass: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon Purple-Blue",
    bodyClass: "theme-cyberpunk",
    vars: {
      "--bg-base": "#05010f",
      "--bg-surface": "rgba(20,5,50,0.85)",
      "--bg-glass": "rgba(100,20,200,0.12)",
      "--bg-glass-border": "rgba(180,50,255,0.35)",
      "--accent-primary": "#c026d3",
      "--accent-secondary": "#06b6d4",
      "--accent-tertiary": "#7c3aed",
      "--text-primary": "#f0e6ff",
      "--text-secondary": "rgba(220,180,255,0.7)",
      "--text-muted": "rgba(180,130,255,0.4)",
      "--glow-primary": "0 0 20px rgba(192,38,211,0.6), 0 0 60px rgba(192,38,211,0.2)",
      "--glow-secondary": "0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.15)",
      "--border-radius": "0.75rem",
      "--border-width": "1px",
      "--font-display": "'JetBrains Mono', monospace",
      "--neon-intensity": "1",
    },
  },
  night: {
    id: "night",
    name: "Night Sky",
    description: "Deep cosmic dark",
    bodyClass: "theme-night",
    vars: {
      "--bg-base": "#010409",
      "--bg-surface": "rgba(10,15,30,0.90)",
      "--bg-glass": "rgba(20,30,60,0.15)",
      "--bg-glass-border": "rgba(30,80,160,0.3)",
      "--accent-primary": "#3b82f6",
      "--accent-secondary": "#818cf8",
      "--accent-tertiary": "#0ea5e9",
      "--text-primary": "#e2e8f0",
      "--text-secondary": "rgba(180,200,240,0.75)",
      "--text-muted": "rgba(100,130,200,0.5)",
      "--glow-primary": "0 0 15px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.1)",
      "--glow-secondary": "0 0 15px rgba(129,140,248,0.35)",
      "--border-radius": "0.5rem",
      "--border-width": "1px",
      "--font-display": "'JetBrains Mono', monospace",
      "--neon-intensity": "0.5",
    },
  },
  morning: {
    id: "morning",
    name: "Morning Sky",
    description: "Frosted glass light mode",
    bodyClass: "theme-morning",
    vars: {
      "--bg-base": "#f0f4ff",
      "--bg-surface": "rgba(255,255,255,0.82)",
      "--bg-glass": "rgba(220,235,255,0.6)",
      "--bg-glass-border": "rgba(100,160,255,0.4)",
      "--accent-primary": "#2563eb",
      "--accent-secondary": "#f59e0b",
      "--accent-tertiary": "#06b6d4",
      "--text-primary": "#0f172a",
      "--text-secondary": "rgba(30,50,100,0.75)",
      "--text-muted": "rgba(80,100,160,0.55)",
      "--glow-primary": "0 4px 20px rgba(37,99,235,0.2)",
      "--glow-secondary": "0 4px 15px rgba(245,158,11,0.2)",
      "--border-radius": "1rem",
      "--border-width": "1.5px",
      "--font-display": "'Inter', sans-serif",
      "--neon-intensity": "0",
    },
  },
  winter: {
    id: "winter",
    name: "Winter",
    description: "Crystalline frost",
    bodyClass: "theme-winter",
    vars: {
      "--bg-base": "#0c1824",
      "--bg-surface": "rgba(200,230,255,0.10)",
      "--bg-glass": "rgba(180,220,255,0.08)",
      "--bg-glass-border": "rgba(160,210,255,0.45)",
      "--accent-primary": "#7dd3fc",
      "--accent-secondary": "#e0f2fe",
      "--accent-tertiary": "#38bdf8",
      "--text-primary": "#e0f2fe",
      "--text-secondary": "rgba(186,230,253,0.8)",
      "--text-muted": "rgba(125,211,252,0.5)",
      "--glow-primary": "0 0 20px rgba(125,211,252,0.35), 0 0 50px rgba(125,211,252,0.1)",
      "--glow-secondary": "0 0 15px rgba(224,242,254,0.3)",
      "--border-radius": "0.375rem",
      "--border-width": "1px",
      "--font-display": "'JetBrains Mono', monospace",
      "--neon-intensity": "0.3",
    },
  },
  desert: {
    id: "desert",
    name: "Desert Minimal",
    description: "Raw architectural clarity",
    bodyClass: "theme-desert",
    vars: {
      "--bg-base": "#1a1612",
      "--bg-surface": "rgba(40,35,28,0.92)",
      "--bg-glass": "rgba(60,50,38,0.3)",
      "--bg-glass-border": "rgba(180,150,100,0.25)",
      "--accent-primary": "#d97706",
      "--accent-secondary": "#78716c",
      "--accent-tertiary": "#a78bfa",
      "--text-primary": "#fafaf9",
      "--text-secondary": "rgba(230,215,195,0.75)",
      "--text-muted": "rgba(168,162,158,0.5)",
      "--glow-primary": "0 2px 12px rgba(217,119,6,0.15)",
      "--glow-secondary": "none",
      "--border-radius": "0.25rem",
      "--border-width": "1px",
      "--font-display": "'Inter', sans-serif",
      "--neon-intensity": "0",
    },
  },
};

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  document.body.classList.remove(...Object.values(THEMES).map(t => t.bodyClass));
  document.body.classList.add(theme.bodyClass);
}
