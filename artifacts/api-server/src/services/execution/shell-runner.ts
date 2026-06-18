import { spawn } from "node:child_process";
import type { ShellResult } from "./types";

const DEFAULT_TIMEOUT_MS = 120_000;

export interface RunShellOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  /** Run inside Ubuntu WSL2 via wsl.exe on Windows. */
  wsl?: boolean;
}

function buildSpawnArgs(command: string, wsl: boolean): { file: string; args: string[] } {
  const isWin = process.platform === "win32";
  if (wsl && isWin) {
    return { file: "wsl.exe", args: ["-e", "bash", "-lc", command] };
  }
  if (isWin) {
    return { file: "cmd.exe", args: ["/c", command] };
  }
  return { file: "bash", args: ["-lc", command] };
}

export function runShell(command: string, options: RunShellOptions = {}): Promise<ShellResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const wsl = options.wsl ?? process.platform === "win32";
  const { file, args } = buildSpawnArgs(command, wsl);
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const child = spawn(file, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: false,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`Command timed out after ${timeoutMs}ms`));
        return;
      }
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
        durationMs: Date.now() - start,
      });
    });
  });
}
