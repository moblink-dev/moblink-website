import type { AssistantContext } from "./assistant.ts";

export type ChatMessage = { role: "bot" | "user"; text: string; serviceIds?: string[]; time?: string; crisis?: boolean };
export type ChatSession = { messages: ChatMessage[]; context: AssistantContext };
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}
function isMessage(value: unknown): value is ChatMessage {
  return isRecord(value) && (value.role === "bot" || value.role === "user") && typeof value.text === "string"
    && (value.time === undefined || typeof value.time === "string")
    && (value.crisis === undefined || typeof value.crisis === "boolean")
    && (value.serviceIds === undefined || isStringArray(value.serviceIds));
}
export function readChatSession(raw: string | null): ChatSession | undefined {
  try {
    const parsed: unknown = JSON.parse(raw ?? "null");
    if (!isRecord(parsed) || !Array.isArray(parsed.messages) || !parsed.messages.length || !parsed.messages.every(isMessage) || !isRecord(parsed.context)) return;
    const value = parsed.context;
    return {
      messages: parsed.messages.slice(-80),
      context: {
        need: typeof value.need === "string" ? value.need : undefined,
        postcode: typeof value.postcode === "string" ? value.postcode : undefined,
        serviceId: typeof value.serviceId === "string" ? value.serviceId : undefined,
        matches: isStringArray(value.matches) ? value.matches : undefined,
      },
    };
  } catch { return; }
}
