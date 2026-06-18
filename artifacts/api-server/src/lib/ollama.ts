const OLLAMA_BASE = process.env["OLLAMA_URL"] ?? "http://localhost:11434";

export type OllamaMessage = { role: string; content: string };

export async function ollamaFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${OLLAMA_BASE}${path}`, options);
}

export async function checkOllamaHealth(): Promise<{
  online: boolean;
  modelCount: number;
}> {
  try {
    const r = await ollamaFetch("/api/tags");
    if (!r.ok) return { online: false, modelCount: 0 };
    const data = (await r.json()) as { models?: unknown[] };
    return { online: true, modelCount: data.models?.length ?? 0 };
  } catch {
    return { online: false, modelCount: 0 };
  }
}

export async function ollamaChat(
  model: string,
  messages: OllamaMessage[],
  options?: { temperature?: number },
): Promise<{ content: string; raw: unknown }> {
  const r = await ollamaFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: options?.temperature !== undefined ? { temperature: options.temperature } : undefined,
    }),
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "unknown");
    throw new Error(`Ollama chat failed (${r.status}): ${text}`);
  }

  const data = (await r.json()) as { message?: { content?: string } };
  return { content: data.message?.content?.trim() ?? "", raw: data };
}

export function getOllamaBaseUrl(): string {
  return OLLAMA_BASE;
}
