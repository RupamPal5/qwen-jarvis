/**
 * J.A.R.V.I.S. Self-Evolution registry — dynamically extended by the evolution service.
 * New nav entries are appended below JARVIS_EVOLUTION_ENTRIES.
 */
import type { ComponentType } from "react";

export interface EvolutionNavEntry {
  id: string;
  label: string;
  group: string;
  componentExport: string;
}

// JARVIS_EVOLUTION_ENTRIES
export const EVOLUTION_NAV: EvolutionNavEntry[] = [];

// JARVIS_EVOLUTION_REGISTER

/** Lazy component map — populated as evolved components are created. */
export const EVOLUTION_COMPONENTS: Record<string, ComponentType> = {};

export function registerEvolutionComponent(name: string, component: ComponentType): void {
  EVOLUTION_COMPONENTS[name] = component;
}
