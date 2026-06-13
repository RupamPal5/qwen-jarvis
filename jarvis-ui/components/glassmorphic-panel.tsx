"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type GlassmorphicPanelProps = {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "purple" | "none";
} & HTMLMotionProps<"div">;

export function GlassmorphicPanel({
  children,
  className = "",
  glow = "none",
  ...rest
}: GlassmorphicPanelProps) {
  const glowClass =
    glow === "cyan" ? "glow-cyan" : glow === "purple" ? "glow-purple" : "";

  return (
    <motion.div
      className={`relative rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur-xl ${glowClass} ${className}`}
      {...rest}
    >
      {/* top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {children}
    </motion.div>
  );
}
