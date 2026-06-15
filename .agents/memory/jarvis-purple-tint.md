---
name: JARVIS Purple Tint Suppression
description: How we suppress hardcoded Tailwind purple classes on non-cyberpunk themes
---

## The Problem
Many components (OllamaChat, InitializeSystem, JarvisUI) use hardcoded Tailwind classes like `border-purple-500/30`, `bg-purple-900/40`, `text-purple-400`. On non-cyberpunk themes these make everything look purple.

## The Fix
`index.css` contains `body:not(.theme-cyberpunk)` CSS rules that override those hardcoded Tailwind classes:

```css
body:not(.theme-cyberpunk) .border-purple-500\/30 { border-color: color-mix(...var(--accent-primary)...) !important; }
body:not(.theme-cyberpunk) .bg-purple-900\/40 { background-color: color-mix(...var(--accent-primary)...) !important; }
body:not(.theme-cyberpunk) .text-purple-400 { color: var(--accent-primary) !important; }
```

## Body class pattern
`applyTheme()` adds `theme-cyberpunk` / `theme-night` / `theme-morning` / `theme-winter` / `theme-desert` to `document.body.classList`. The CSS selectors rely on these body classes.

**Why:** Rewriting every component to remove purple is too expensive. The CSS override approach suppresses the tint automatically on all non-cyberpunk themes while leaving cyberpunk looking correctly purple/magenta.

**How to apply:** When adding new components with purple Tailwind classes, either (a) use CSS vars from the start, or (b) add a `body:not(.theme-cyberpunk)` override rule in `index.css` for the new class.
