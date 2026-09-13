export type SupportTeam = "moblink" | "iraac";
export type SupportHistory = { role: string; text: string }[];
export type SupportConversation = {
  id: string;
  team: SupportTeam;
  customer_name: string;
  location: string;
  assistant_history: SupportHistory;
  created_at: string;
};
export type SupportMessage = {
  id: string;
  conversation_id: string;
  kind: "customer" | "staff";
  body: string;
  created_at: string;
};

export function supportConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPPORT_ENABLED === "true",
  );
}
export function prepareSupportHistory(history: unknown): SupportHistory {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-80)
    .filter(
      (item): item is { role: string; text: string } =>
        item !== null &&
        typeof item === "object" &&
        typeof item.role === "string" &&
        typeof item.text === "string",
    )
    .map((item) => ({
      role: item.role.slice(0, 100),
      text: item.text.slice(0, 2000),
    }));
}
