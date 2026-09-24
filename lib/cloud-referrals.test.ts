import assert from "node:assert/strict";
import test from "node:test";
import { cloudRowToReferral, referralToCloudInsert, type CloudReferralRow } from "./cloud-referrals.ts";
import { createReferral } from "./referrals.ts";

test("maps a consented referral to the cloud without prototype-only fields", () => {
  const referral = createReferral({
    serviceId: "iraac-youthscape",
    serviceName: "IRAAC YouthScape",
    serviceCategory: "Youth",
    requesterName: "Synthetic person",
    requesterPhone: "0400000000",
    requesterEmail: "synthetic@example.invalid",
    postcode: "2500",
    needCategory: "Youth support",
    message: "Synthetic test request",
    consentToFollowUp: true,
    preferredContact: "sms",
  });
  assert.deepEqual(referralToCloudInsert(referral), {
    client_service_key: "iraac-youthscape",
    service_name: "IRAAC YouthScape",
    service_category: "Youth",
    requester_name: "Synthetic person",
    requester_phone: "0400000000",
    requester_email: "synthetic@example.invalid",
    postcode: "2500",
    preferred_contact: "sms",
    need_category: "Youth support",
    message: "Synthetic test request",
    consent_to_follow_up: true,
  });
});

test("restores a cloud referral without claiming the provider was contacted", () => {
  const row: CloudReferralRow = {
    id: "30000000-0000-0000-0000-000000000001",
    client_service_key: "iraac-youthscape",
    service_name: "IRAAC YouthScape",
    service_category: "Youth",
    requester_name: "Synthetic person",
    requester_phone: "0400000000",
    requester_email: "",
    postcode: "2500",
    preferred_contact: "in_app",
    need_category: "Youth support",
    message: "Synthetic test request",
    consent_to_follow_up: true,
    status: "requested",
    created_at: "2026-09-24T00:00:00.000Z",
    updated_at: "2026-09-24T00:00:00.000Z",
  };
  const referral = cloudRowToReferral(row);
  assert.equal(referral.id, row.id);
  assert.match(referral.conversation[0]!.body, /not been contacted/i);
  assert.equal(referral.supplierNotification, "not_required");
});
