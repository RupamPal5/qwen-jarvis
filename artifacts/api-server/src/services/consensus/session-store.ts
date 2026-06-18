import type { ConsensusSession } from "./types";

const sessions = new Map<string, ConsensusSession>();

const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function createSessionId(): string {
  return `consensus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function saveSession(session: ConsensusSession): void {
  sessions.set(session.id, session);
}

export function getSession(id: string): ConsensusSession | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}

/** Drop expired sessions to prevent memory growth. */
export function pruneExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    const updated = new Date(session.updatedAt).getTime();
    if (now - updated > TTL_MS) sessions.delete(id);
  }
}
