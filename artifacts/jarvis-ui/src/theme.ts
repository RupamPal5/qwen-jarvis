export type ThemeId = "cyberpunk" | "night" | "morning" | "winter" | "desert" | "command_center";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  vars: Record<string, string>;
  bodyClass: string;
}

/**
 * All palettes taken from user-supplied reference images.
 *
 * cyberpunk  — Periwinkle / Hyper Magenta / Ultrasonic Blue palette
 * night      — Arctic / Midnight / Solstice / Polar / Icicle palette
 * morning    — Sky cloud palette (D2E5DB → 024683)
 * winter     — Frozen / Icy Veil / Glacier Glow / Frost Byte / Midnight Chill
 * desert     — Terracotta / sand / clay palette
 */
export const THEMES: Record<ThemeId, Theme> = {

  // ── CYBERPUNK ─────────────────────────────────────────────────
  // Periwinkle #E3D9FC · Hyper Magenta #BF40FA · Ultrasonic Blue #4928C2
  // Velvet Purple #5B2A62 · Black #040607
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Hyper Magenta · Ultra Violet",
    bodyClass: "theme-cyberpunk",
    vars: {
      "--bg-base":          "#040607",
      "--bg-surface":       "rgba(91,42,98,0.18)",
      "--bg-glass":         "rgba(73,40,194,0.14)",
      "--bg-glass-border":  "rgba(191,64,250,0.40)",
      "--accent-primary":   "#BF40FA",
      "--accent-secondary": "#4928C2",
      "--accent-tertiary":  "#E3D9FC",
      "--text-primary":     "#E3D9FC",
      "--text-secondary":   "rgba(227,217,252,0.72)",
      "--text-muted":       "rgba(191,64,250,0.50)",
      "--glow-primary":     "0 0 24px rgba(191,64,250,0.65), 0 0 60px rgba(191,64,250,0.20)",
      "--glow-secondary":   "0 0 20px rgba(73,40,194,0.55), 0 0 40px rgba(73,40,194,0.15)",
      "--border-radius":    "0.75rem",
      "--border-width":     "1px",
      "--font-display":     "'JetBrains Mono', monospace",
      "--neon-intensity":   "1",
    },
  },

  // ── NIGHT SKY ─────────────────────────────────────────────────
  // Midnight #071018 · Solstice #1C2B38 · Polar #38506A · Icicle #446983 · Arctic #7991A8
  night: {
    id: "night",
    name: "Night Sky",
    description: "Midnight · Polar · Arctic",
    bodyClass: "theme-night",
    vars: {
      "--bg-base":          "#071018",
      "--bg-surface":       "rgba(28,43,56,0.88)",
      "--bg-glass":         "rgba(56,80,106,0.18)",
      "--bg-glass-border":  "rgba(68,105,131,0.40)",
      "--accent-primary":   "#446983",
      "--accent-secondary": "#7991A8",
      "--accent-tertiary":  "#9cb8cc",
      "--text-primary":     "#d4e4f0",
      "--text-secondary":   "rgba(180,210,230,0.78)",
      "--text-muted":       "rgba(121,145,168,0.55)",
      "--glow-primary":     "0 0 18px rgba(68,105,131,0.45), 0 0 50px rgba(68,105,131,0.12)",
      "--glow-secondary":   "0 0 14px rgba(121,145,168,0.35)",
      "--border-radius":    "0.5rem",
      "--border-width":     "1px",
      "--font-display":     "'JetBrains Mono', monospace",
      "--neon-intensity":   "0.4",
    },
  },

  // ── MORNING SKY ───────────────────────────────────────────────
  // D2E5DB · A0C8CE · 338FBA · 024683 · 436677
  morning: {
    id: "morning",
    name: "Morning Sky",
    description: "Cloud · Sky · Ocean",
    bodyClass: "theme-morning",
    vars: {
      "--bg-base":          "#0b1e33",
      "--bg-surface":       "rgba(2,70,131,0.25)",
      "--bg-glass":         "rgba(51,143,186,0.14)",
      "--bg-glass-border":  "rgba(160,200,206,0.38)",
      "--accent-primary":   "#338FBA",
      "--accent-secondary": "#A0C8CE",
      "--accent-tertiary":  "#D2E5DB",
      "--text-primary":     "#D2E5DB",
      "--text-secondary":   "rgba(210,229,219,0.75)",
      "--text-muted":       "rgba(160,200,206,0.50)",
      "--glow-primary":     "0 0 20px rgba(51,143,186,0.40), 0 0 50px rgba(51,143,186,0.12)",
      "--glow-secondary":   "0 0 16px rgba(160,200,206,0.30)",
      "--border-radius":    "0.875rem",
      "--border-width":     "1px",
      "--font-display":     "'JetBrains Mono', monospace",
      "--neon-intensity":   "0.5",
    },
  },

  // ── WINTER ────────────────────────────────────────────────────
  // Frozen #cadbe5 · Icy Veil #dfe8ed · Glacier Glow #ecf1f7
  // Frost Byte #9aaab7 · Midnight Chill #2a4876 · Polar Night #152f57
  winter: {
    id: "winter",
    name: "Winter",
    description: "Frozen · Glacier · Polar",
    bodyClass: "theme-winter",
    vars: {
      "--bg-base":          "#0e1e30",
      "--bg-surface":       "rgba(42,72,118,0.22)",
      "--bg-glass":         "rgba(202,219,229,0.10)",
      "--bg-glass-border":  "rgba(202,219,229,0.35)",
      "--accent-primary":   "#cadbe5",
      "--accent-secondary": "#9aaab7",
      "--accent-tertiary":  "#ecf1f7",
      "--text-primary":     "#ecf1f7",
      "--text-secondary":   "rgba(202,219,229,0.80)",
      "--text-muted":       "rgba(154,170,183,0.55)",
      "--glow-primary":     "0 0 20px rgba(202,219,229,0.30), 0 0 50px rgba(202,219,229,0.08)",
      "--glow-secondary":   "0 0 14px rgba(154,170,183,0.25)",
      "--border-radius":    "0.375rem",
      "--border-width":     "1px",
      "--font-display":     "'JetBrains Mono', monospace",
      "--neon-intensity":   "0.25",
    },
  },

  // ── DESERT MINIMAL ────────────────────────────────────────────
  // Terracotta #8C3B1A · Clay #C07850 · Cream #F0DEB4 · Tan #A87848
  // Sandy gold #C09860 · Off-white #F5EDD0
  desert: {
    id: "desert",
    name: "Desert",
    description: "Terracotta · Clay · Sand",
    bodyClass: "theme-desert",
    vars: {
      "--bg-base":          "#130a04",
      "--bg-surface":       "rgba(60,30,12,0.88)",
      "--bg-glass":         "rgba(140,59,26,0.16)",
      "--bg-glass-border":  "rgba(192,120,80,0.38)",
      "--accent-primary":   "#C07850",
      "--accent-secondary": "#F0DEB4",
      "--accent-tertiary":  "#A87848",
      "--text-primary":     "#F5EDD0",
      "--text-secondary":   "rgba(240,222,180,0.78)",
      "--text-muted":       "rgba(192,152,96,0.55)",
      "--glow-primary":     "0 2px 16px rgba(192,120,80,0.25), 0 0 40px rgba(192,120,80,0.08)",
      "--glow-secondary":   "none",
      "--border-radius":    "0.25rem",
      "--border-width":     "1px",
      "--font-display":     "'JetBrains Mono', monospace",
      "--neon-intensity":   "0",
    },
  },

  // Command Center theme for the futuristic control plane
  command_center: {
    id: "command_center",
    name: "Command Center",
    description: "Futuristic control center theme with cyberpunk aesthetics",
    bodyClass: "theme-command-center",
    vars: {
      "--bg-base":          "#040607",
      "--bg-surface":       "rgba(20, 40, 60, 0.85)",
      "--bg-glass":         "rgba(30, 50, 80, 0.25)",
      "--bg-glass-border":  "rgba(0, 212, 255, 0.35)",
      "--accent-primary":   "#00d4ff",
      "--accent-secondary": "#4928C2",
      "--accent-tertiary":  "#BF40FA",
      "--text-primary":     "#E3D9FC",
      "--text-secondary":   "rgba(227,217,252,0.72)",
      "--text-muted":       "rgba(0, 212, 255, 0.50)",
      "--glow-primary":     "0 0 24px rgba(0, 212, 255, 0.65), 0 0 60px rgba(0, 212, 255, 0.20)",
      "--glow-secondary":   "0 0 20px rgba(73,40,194,0.55), 0 0 40px rgba(73,40,194,0.15)",
      "--border-radius":    "0.75rem",
      "--border-width":     "1px",
      "--font-display":     "'JetBrains Mono', monospace",
      "--neon-intensity":   "1",
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
