import { spawn, type ChildProcess } from "node:child_process";
import type { ProcessLaunchSpec } from "./types";

interface ManagedProcess {
  pid: number;
  label: string;
  command: string;
  startedAt: string;
  child: ChildProcess;
}

const processes = new Map<number, ManagedProcess>();

export function launchProcess(spec: ProcessLaunchSpec): { pid: number; label: string } {
  const isWin = process.platform === "win32";
  const wsl = spec.wsl ?? isWin;

  let file: string;
  let args: string[];

  if (wsl && isWin) {
    file = "wsl.exe";
    args = ["-e", "bash", "-lc", spec.command];
  } else if (isWin) {
    file = "cmd.exe";
    args = ["/c", spec.command];
  } else {
    file = "bash";
    args = ["-lc", spec.command];
  }

  const child = spawn(file, args, {
    cwd: spec.cwd,
    env: { ...process.env, ...spec.env },
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    shell: false,
  });

  child.unref();
  const pid = child.pid ?? 0;
  const label = spec.label ?? spec.command.slice(0, 80);

  if (pid > 0) {
    processes.set(pid, {
      pid,
      label,
      command: spec.command,
      startedAt: new Date().toISOString(),
      child,
    });
  }

  return { pid, label };
}

export function listProcesses(): Array<{
  pid: number;
  label: string;
  command: string;
  startedAt: string;
}> {
  return [...processes.values()].map((p) => ({
    pid: p.pid,
    label: p.label,
    command: p.command,
    startedAt: p.startedAt,
  }));
}

export function killProcess(pid: number): boolean {
  const managed = processes.get(pid);
  if (!managed) return false;
  try {
    managed.child.kill("SIGTERM");
    processes.delete(pid);
    return true;
  } catch {
    return false;
  }
}
