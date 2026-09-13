import type { Referral } from "./referrals.ts";

const dateFormatter = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Sydney" });
export function conversationDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Saved" : dateFormatter.format(date);
}

/** The customer demo shows Jayden's example and requests made through this app. */
export function customerConversations(referrals: Referral[]): Referral[] {
  return referrals.filter(item => item.id === "lead_demo_youthscape" || (!item.id.startsWith("lead_demo_") && item.source === "app"))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
