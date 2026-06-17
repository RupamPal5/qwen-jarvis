import React, { ReactNode } from 'react';

type GlassmorphicPanelProps = {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "blue" | "none";
  glowIntensity?: string;
  borderColor?: string;
};

export function GlassmorphicPanel({
  children,
  className = "",
  glow = "cyan",
  glowIntensity = "shadow-lg",
  borderColor
}: GlassmorphicPanelProps) {
  const glowClasses = {
    cyan: "shadow-cyan-500/30",
    purple: "shadow-purple-500/30",
    blue: "shadow-blue-500/30",
    none: "",
  };

  const borderClasses = {
    cyan: "border-cyan-500/30",
    purple: "border-purple-500/30",
    blue: "border-blue-500/30",
    none: "border-gray-800/30",
  };

  const glowClass = glow ? glowClasses[glow] : glowClasses.cyan;
  const borderClass = glow ? borderClasses[glow] : borderClasses.cyan;

  return (
    <div
      className={`rounded-xl bg-black/30 backdrop-blur-xl border ${borderClass} ${glowClass} ${glowIntensity} ${className}`}
      style={{
        background: "rgba(10, 20, 30, 0.3)",
        border: "1px solid rgba(120, 200, 255, 0.15)",
        boxShadow: glow !== "none" ? "0 8px 32px 0 rgba(0, 212, 255, 0.1)" : "none"
      }}
    >
      {children}
    </div>
  );
}
