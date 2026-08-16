import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import {
  addReferralMessage,
  createReferral,
  getReferrals,
  saveReferral,
  scheduleAICall,
  updateReferralStatus,
} from "./referrals.ts";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  clear() {
    this.values.clear();
  }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });

beforeEach(() => storage.clear());

function makeReferral(consentToFollowUp = true, consentToAICall = consentToFollowUp) {
  return createReferral({
    serviceId: "iraac-youthscape",
    serviceName: "IRAAC YouthScape",
    serviceCategory: "Centrelink",
    requesterName: "Test person",
    requesterPhone: "0400 000 000",
    requesterEmail: "",
    postcode: "2541",
    needCategory: "Centrelink",
    message: "Help with a Centrelink claim",
    consentToFollowUp,
    consentToAICall,
    source: "hotline",
    preferredContact: "sms",
  });
}

test("creates, saves, and reads a consented referral", () => {
  const referral = makeReferral();
  saveReferral(referral);

  const stored = getReferrals();
  const created = stored.find((item) => item.id === referral.id);
  assert.ok(created);
  assert.equal(created.supplierNotification, "queued");
  assert.match(created.conversation[0]?.body ?? "", /has been shared/);
});

test("does not describe a non-consented referral as shared", () => {
  const referral = makeReferral(false);

  assert.equal(referral.supplierNotification, "not_required");
  assert.match(referral.conversation[0]?.body ?? "", /has not been shared/);
});

test("updates status, notes, and the connected conversation", () => {
  const referral = makeReferral();
  saveReferral(referral);

  const updated = updateReferralStatus(referral.id, "triage", "Call after 2pm");
  assert.equal(updated?.status, "triage");
  assert.equal(updated?.staffNotes, "Call after 2pm");

  const messaged = addReferralMessage(referral.id, {
    sender: "provider",
    senderName: "Nowra Centrelink Support",
    body: "We can help tomorrow.",
  });
  assert.equal(messaged?.conversation.at(-1)?.body, "We can help tomorrow.");
});

test("falls back to demo data for malformed browser storage", () => {
  storage.setItem("moblink_referrals", JSON.stringify({ invalid: true }));
  assert.equal(getReferrals()[0]?.id, "lead_demo_youthscape");
});

test("queues a consented AI call and records it in the shared conversation", () => {
  const referral = makeReferral();
  saveReferral(referral);

  const result = scheduleAICall(referral.id, "needs");

  assert.equal(result.status, "queued");
  assert.equal(result.referral?.status, "triage");
  assert.match(result.referral?.conversation.at(-1)?.body ?? "", /IRAAC/);
  assert.match(result.referral?.conversation.at(-1)?.body ?? "", /find out more/i);
});

test("does not queue an AI call without request-specific follow-up consent", () => {
  const referral = makeReferral(false);
  saveReferral(referral);

  const result = scheduleAICall(referral.id, "check_in");

  assert.equal(result.status, "blocked");
  assert.match(result.reason ?? "", /consent/i);
  assert.equal(result.referral?.conversation.length, 1);
});

test("does not infer AI voice-call consent from general follow-up consent", () => {
  const referral = makeReferral(true, false);
  saveReferral(referral);

  const result = scheduleAICall(referral.id, "check_in");

  assert.equal(result.status, "blocked");
  assert.match(result.reason ?? "", /AI voice-call consent/i);
});

test("prevents duplicate pending AI calls and calls on closed leads", () => {
  const referral = makeReferral();
  saveReferral(referral);
  assert.equal(scheduleAICall(referral.id, "check_in").status, "queued");
  assert.match(scheduleAICall(referral.id, "check_in").reason ?? "", /already queued/i);
  updateReferralStatus(referral.id, "resolved");
  assert.match(scheduleAICall(referral.id, "needs").reason ?? "", /Closed leads/i);
});

test("replaces the retired generic demo lead while preserving created leads", () => {
  const created = makeReferral();
  storage.setItem("moblink_referrals", JSON.stringify([
    { ...created, id: "lead_demo_centrelink" },
    created,
  ]));

  const migrated = getReferrals();

  assert.ok(migrated.some((item) => item.id === "lead_demo_youthscape"));
  assert.ok(migrated.some((item) => item.id === created.id));
  assert.ok(!migrated.some((item) => item.id === "lead_demo_centrelink"));
});

test("returns fresh demo records when browser storage is empty", () => {
  const firstRead = getReferrals();
  firstRead[0]?.conversation.push({
    id: "temporary",
    sender: "moblink",
    senderName: "MobLink",
    body: "Temporary mutation",
    createdAt: new Date().toISOString(),
  });

  assert.ok(!getReferrals()[0]?.conversation.some((message) => message.id === "temporary"));
});

test("normalizes malformed nested stored referral collections", () => {
  const referral = makeReferral();
  storage.setItem("moblink_referrals", JSON.stringify([{ ...referral, aiCalls: {}, conversation: "invalid", rating: 9, seriousness: "extreme", outcome: "done" }]));

  const normalized = getReferrals().find((item) => item.id === referral.id);

  assert.deepEqual(normalized?.aiCalls, []);
  assert.deepEqual(normalized?.conversation, []);
  assert.equal(normalized?.rating, undefined);
  assert.equal(normalized?.seriousness, "elevated");
  assert.equal(normalized?.outcome, "pending");
  assert.equal(scheduleAICall(referral.id, "check_in").status, "queued");
});
