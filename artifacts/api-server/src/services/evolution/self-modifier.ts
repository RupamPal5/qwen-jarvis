import fs from "node:fs/promises";
import path from "node:path";
import {
  assertScopedPath,
  EVOLUTION_BACKUP_DIR,
  EVOLUTION_REGISTRY,
  WORKSPACE_ROOT,
} from "../../lib/paths";
import type { ApplyResult, FilePatch } from "./types";

async function backupFile(absolutePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(absolutePath, "utf8");
    await fs.mkdir(EVOLUTION_BACKUP_DIR, { recursive: true });
    const rel = path.relative(WORKSPACE_ROOT, absolutePath).replace(/\\/g, "_");
    const backupPath = path.join(
      EVOLUTION_BACKUP_DIR,
      `${Date.now()}_${rel}`,
    );
    await fs.writeFile(backupPath, content, "utf8");
    return backupPath;
  } catch {
    return null;
  }
}

async function applyPatch(patch: FilePatch): Promise<{ path: string; backup?: string }> {
  const absolute = assertScopedPath(patch.path);
  let backup: string | null = null;

  if (patch.operation === "create") {
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, patch.content, "utf8");
    return { path: patch.path };
  }

  if (patch.operation === "append") {
    backup = await backupFile(absolute);
    const existing = await fs.readFile(absolute, "utf8");
    await fs.writeFile(absolute, existing + patch.content, "utf8");
    return { path: patch.path, backup: backup ?? undefined };
  }

  // update
  backup = await backupFile(absolute);
  if (patch.search && patch.replace !== undefined) {
    const existing = await fs.readFile(absolute, "utf8");
    if (!existing.includes(patch.search)) {
      throw new Error(`Search block not found in ${patch.path}`);
    }
    await fs.writeFile(absolute, existing.replace(patch.search, patch.replace), "utf8");
  } else {
    await fs.writeFile(absolute, patch.content, "utf8");
  }

  return { path: patch.path, backup: backup ?? undefined };
}

export async function applyPatches(patches: FilePatch[]): Promise<ApplyResult> {
  const applied: string[] = [];
  const backups: string[] = [];

  for (const patch of patches) {
    const result = await applyPatch(patch);
    applied.push(result.path);
    if (result.backup) backups.push(result.backup);
  }

  return {
    draftId: "",
    applied,
    backups,
    hotReloadHint:
      "Vite HMR will hot-reload React source changes when the dev server is running.",
  };
}

/**
 * Append evolution nav + component registration patches to registry.ts.
 */
export function buildRegistryPatches(navEntry: {
  id: string;
  label: string;
  group: string;
  componentExport: string;
}): FilePatch[] {
  const registryRel = path.relative(WORKSPACE_ROOT, EVOLUTION_REGISTRY).replace(/\\/g, "/");
  const navLine = `  { id: "${navEntry.id}", label: "${navEntry.label}", group: "${navEntry.group}", componentExport: "${navEntry.componentExport}" },`;

  return [
    {
      path: registryRel,
      operation: "update",
      search: "import type { ComponentType } from \"react\";",
      replace: `import type { ComponentType } from "react";\nimport { ${navEntry.componentExport} } from "../components/evolved/${navEntry.componentExport}";`,
    },
    {
      path: registryRel,
      operation: "update",
      search: "// JARVIS_EVOLUTION_ENTRIES",
      replace: `// JARVIS_EVOLUTION_ENTRIES\n${navLine}`,
    },
    {
      path: registryRel,
      operation: "update",
      search: "// JARVIS_EVOLUTION_REGISTER",
      replace: `// JARVIS_EVOLUTION_REGISTER\nregisterEvolutionComponent("${navEntry.componentExport}", ${navEntry.componentExport});`,
    },
  ];
}

/** @deprecated use buildRegistryPatches */
export function buildRegistryPatch(navEntry: {
  id: string;
  label: string;
  group: string;
  componentExport: string;
}): FilePatch {
  return buildRegistryPatches(navEntry)[1];
}

export async function readRegistrySnippet(): Promise<string> {
  try {
    return await fs.readFile(EVOLUTION_REGISTRY, "utf8");
  } catch {
    return "";
  }
}
