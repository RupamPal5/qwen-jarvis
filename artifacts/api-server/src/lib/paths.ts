import path from "node:path";
import { existsSync, realpathSync } from "node:fs";

/** Workspace root (monorepo). Override via JARVIS_WORKSPACE_ROOT. */
function resolveWorkspaceRoot(): string {
  const env = process.env["JARVIS_WORKSPACE_ROOT"];
  if (env) return path.resolve(env);

  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return process.cwd();
}

export const WORKSPACE_ROOT = resolveWorkspaceRoot();

export const JARVIS_UI_SRC = path.join(WORKSPACE_ROOT, "artifacts/jarvis-ui/src");
export const JARVIS_API_SRC = path.join(WORKSPACE_ROOT, "artifacts/api-server/src");
export const EVOLUTION_REGISTRY = path.join(JARVIS_UI_SRC, "evolution/registry.ts");
export const EVOLUTION_BACKUP_DIR = path.join(WORKSPACE_ROOT, ".jarvis-evolution-backups");

/** Directories where self-modification (code evolution) is permitted. */
export const SELF_MODIFY_ROOTS = [JARVIS_UI_SRC, JARVIS_API_SRC] as const;

const BLOCKED_ORGANIZE_PATTERNS = [
  /^[a-zA-Z]:\\windows/i,
  /^[a-zA-Z]:\\program files/i,
  /\/etc\//i,
  /\/usr\/bin/i,
  /\/bin\//i,
  /\/sbin\//i,
  /node_modules/,
  /\.git\//,
];

/**
 * Resolve paths for file organization / host tasks (broader than code self-modify).
 */
export function resolveHostPath(target: string): string {
  const normalized = target.replace(/\\/g, "/");
  if (normalized.includes("..")) {
    throw new Error("Path traversal rejected");
  }

  const absolute = path.isAbsolute(target)
    ? path.resolve(target)
    : path.resolve(WORKSPACE_ROOT, target);

  const norm = absolute.replace(/\\/g, "/");
  for (const pattern of BLOCKED_ORGANIZE_PATTERNS) {
    if (pattern.test(norm)) {
      throw new Error(`Blocked host path: ${target}`);
    }
  }

  return absolute;
}

export function isPathWithinRoots(targetPath: string, roots: readonly string[]): boolean {
  const resolved = path.resolve(targetPath);
  for (const root of roots) {
    const resolvedRoot = path.resolve(root);
    if (resolved === resolvedRoot || resolved.startsWith(resolvedRoot + path.sep)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve a repo-relative or absolute path and verify it sits inside allowed roots.
 * Rejects path traversal and sensitive files.
 */
export function assertScopedPath(relativeOrAbsolute: string): string {
  const normalized = relativeOrAbsolute.replace(/\\/g, "/");
  if (normalized.includes("..")) {
    throw new Error("Path traversal rejected");
  }

  const blocked = [
    "/node_modules/",
    "/.env",
    "/.git/",
    "/dist/",
    "/package-lock",
    "/pnpm-lock",
  ];
  for (const b of blocked) {
    if (normalized.includes(b)) {
      throw new Error(`Blocked path pattern: ${b}`);
    }
  }

  const absolute = path.isAbsolute(relativeOrAbsolute)
    ? path.resolve(relativeOrAbsolute)
    : path.resolve(WORKSPACE_ROOT, relativeOrAbsolute);

  let real: string;
  try {
    real = realpathSync(absolute);
  } catch {
    // New files may not exist yet — validate parent or target against roots
    if (!isPathWithinRoots(absolute, SELF_MODIFY_ROOTS)) {
      throw new Error(`Path outside self-modify scope: ${relativeOrAbsolute}`);
    }
    return absolute;
  }

  if (!isPathWithinRoots(real, SELF_MODIFY_ROOTS)) {
    throw new Error(`Path outside self-modify scope: ${relativeOrAbsolute}`);
  }

  return real;
}
