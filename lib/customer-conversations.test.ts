import assert from "node:assert/strict";
import test from "node:test";
import { getDemoReferrals } from "./referrals.ts";
import { customerConversations } from "./customer-conversations.ts";

test("does not put other people's staff demo records into the customer inbox", () => {
  assert.deepEqual(customerConversations(getDemoReferrals()).map(item => item.id), ["lead_demo_youthscape"]);
});
test("includes local app requests while excluding call-centre and provider entries", () => {
  const example = getDemoReferrals()[0];
  const app = { ...example, id: "new_app_request", source: "app" as const, updatedAt: "2026-09-13T00:00:00.000Z" };
  const hotline = { ...app, id: "staff_request", source: "hotline" as const };
  assert.deepEqual(customerConversations([example, app, hotline]).map(item => item.id), ["new_app_request", "lead_demo_youthscape"]);
});
