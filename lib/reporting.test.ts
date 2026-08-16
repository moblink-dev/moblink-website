import assert from "node:assert/strict";
import test from "node:test";

import type { Referral } from "./referrals.ts";
import type { Member } from "./members.ts";
import { buildEmailReport, calculateProviderReport } from "./reporting.ts";

const members = [
  {
    id: "member-1", name: "One (demo)", phoneMasked: "04•• ••• 111", suburb: "Wollongong", postcode: "2500",
    programs: ["YouthScape"], primaryNeed: "Legal support", supportLevel: "urgent", caseStatus: "active",
    joinedAt: "2026-08-01T00:00:00.000Z", lastContactAt: "2026-08-10T00:00:00.000Z", nextCheckInAt: "2026-08-15T00:00:00.000Z",
    preferredContact: "phone", consentToContact: true, satisfactionRating: 5, feedback: "Helpful", assignedTo: "Youth team", notes: "",
    activities: [],
  },
  {
    id: "member-2", name: "Two (demo)", phoneMasked: "04•• ••• 222", suburb: "Dapto", postcode: "2530",
    programs: ["The Crew"], primaryNeed: "Skills", supportLevel: "routine", caseStatus: "stable",
    joinedAt: "2026-07-01T00:00:00.000Z", lastContactAt: "2026-08-12T00:00:00.000Z", nextCheckInAt: "2026-09-01T00:00:00.000Z",
    preferredContact: "sms", consentToContact: true, satisfactionRating: 4, feedback: "Good", assignedTo: "Community team", notes: "",
    activities: [],
  },
] satisfies Member[];

const referrals = [
  {
    id: "ref-1", serviceId: "iraac-youthscape", serviceName: "IRAAC YouthScape", serviceCategory: "Youth",
    requesterName: "One (demo)", requesterPhone: "04•• ••• 111", requesterEmail: "", postcode: "2500", needCategory: "Youth legal support",
    message: "Help", consentToFollowUp: true, consentToAICall: true, source: "app", preferredContact: "phone",
    supplierNotification: "sent", status: "resolved", staffNotes: "", createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-03T00:00:00.000Z",
    seriousness: "urgent", firstResponseAt: "2026-08-01T01:00:00.000Z", outcome: "connected", rating: 5, feedback: "Supportive",
    aiCalls: [{ id: "call-1", purpose: "needs", status: "completed", createdAt: "2026-08-01T00:30:00.000Z", completedAt: "2026-08-01T00:36:00.000Z" }], conversation: [],
  },
  {
    id: "ref-2", serviceId: "iraac-the-crew", serviceName: "IRAAC The Crew", serviceCategory: "Employment",
    requesterName: "Two (demo)", requesterPhone: "04•• ••• 222", requesterEmail: "", postcode: "2530", needCategory: "Skills",
    message: "Help", consentToFollowUp: true, consentToAICall: false, source: "hotline", preferredContact: "sms",
    supplierNotification: "queued", status: "requested", staffNotes: "", createdAt: "2026-08-02T00:00:00.000Z", updatedAt: "2026-08-02T00:00:00.000Z",
    seriousness: "routine", firstResponseAt: "", outcome: "pending", aiCalls: [], conversation: [],
  },
] satisfies Referral[];

test("calculates response, connection, seriousness, calls, and ratings from source records", () => {
  const report = calculateProviderReport(referrals, members, new Date("2026-08-16T00:00:00.000Z"));

  assert.equal(report.totalMembers, 2);
  assert.equal(report.responseRate, 50);
  assert.equal(report.successfulConnectionRate, 100);
  assert.equal(report.urgentCases, 1);
  assert.equal(report.aiCallsCompleted, 1);
  assert.equal(report.aiCallCompletionRate, 100);
  assert.equal(report.averageRating, 4.67);
  assert.equal(report.checkInsDue, 1);
});

test("builds a plain-language email report without claiming the demo is operational", () => {
  const report = calculateProviderReport(referrals, members, new Date("2026-08-16T00:00:00.000Z"));
  const email = buildEmailReport(report);

  assert.equal(email.subject, "IRAAC community support report — 16 August 2026");
  assert.match(email.body, /Response rate: 50%/);
  assert.match(email.body, /fictional demonstration data/i);
});
