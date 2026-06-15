---
name: JARVIS Theme System
description: How themes work in JARVIS V5.0 — CSS vars, applyTheme(), component patterns
---

## Rule
`applyTheme(themeId)` in `theme.ts` writes CSS vars to `document.documentElement`. All visual elements MUST read from these vars — never use hardcoded Tailwind color classes for theme-sensitive UI.

## The 5 themes and their key accent colors
- **cyberpunk**: bg `#040607`, accent `#BF40FA` (Hyper Magenta), secondary `#4928C2` (Ultrasonic Blue)
- **night**: bg `#071018`, accent `#446983` (Icicle), secondary `#7991A8` (Arctic)
- **morning**: bg `#0b1e33`, accent `#338FBA` (sky blue), secondary `#A0C8CE`
- **winter**: bg `#0e1e30`, accent `#cadbe5` (frozen ice), secondary `#9aaab7`
- **desert**: bg `#130a04`, accent `#C07850` (terracotta), secondary `#F0DEB4`

## Key CSS vars set per theme
`--bg-base`, `--bg-surface`, `--bg-glass`, `--bg-glass-border`, `--accent-primary`, `--accent-secondary`, `--accent-tertiary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--glow-primary`, `--glow-secondary`, `--border-radius`, `--neon-intensity`

## Card component pattern
The inline `Card` component in `JarvisUI.tsx` now uses `className="glass-card border ..."` + inline `style` for glow (reads `var(--glow-primary)`). The `glow` prop accepts `"accent"|"cyan"|"purple"|"green"|"red"|"orange"|"none"` — all non-specific colors map to `var(--accent-primary)`.

## Where theme is applied
`useEffect([theme])` in `JarvisUI.tsx` calls `applyTheme(theme)` on mount and change. Zustand store holds `theme` as `ThemeId`.

**Why:** Hardcoded Tailwind color classes (e.g. `border-purple-500/30`) bypass the theme system and cause purple tint on all themes. CSS vars are the only correct approach.
