import { createClient } from "./supabase/client.ts";
import { cloudConfigured, ensureCustomerSession } from "./cloud-session.ts";
import type { PreferredContact, Referral, ReferralStatus } from "./referrals.ts";

const REFERRAL_COLUMNS =
  "id,client_service_key,service_name,service_category,requester_name,requester_phone,requester_email,postcode,preferred_contact,need_category,message,consent_to_follow_up,status,created_at,updated_at" as const;

export type CloudReferralRow = {
  id: string;
  client_service_key: string;
  service_name: string;
  service_category: string;
  requester_name: string;
  requester_phone: string;
  requester_email: string;
  postcode: string;
  preferred_contact: PreferredContact;
  need_category: string;
  message: string;
  consent_to_follow_up: boolean;
  status: ReferralStatus;
  created_at: string;
  updated_at: string;
};

export function referralToCloudInsert(referral: Referral) {
  return {
    client_service_key: referral.serviceId,
    service_name: referral.serviceName,
    service_category: referral.serviceCategory,
    requester_name: referral.requesterName,
    requester_phone: referral.requesterPhone,
    requester_email: referral.requesterEmail,
    postcode: referral.postcode,
    preferred_contact: referral.preferredContact,
    need_category: referral.needCategory,
    message: referral.message,
    consent_to_follow_up: referral.consentToFollowUp,
  };
}

export function cloudRowToReferral(row: CloudReferralRow): Referral {
  return {
    id: row.id,
    serviceId: row.client_service_key,
    serviceName: row.service_name,
    serviceCategory: row.service_category,
    requesterName: row.requester_name,
    requesterPhone: row.requester_phone,
    requesterEmail: row.requester_email,
    postcode: row.postcode,
    needCategory: row.need_category,
    message: row.message,
    consentToFollowUp: row.consent_to_follow_up,
    consentToAICall: false,
    source: "app",
    preferredContact: row.preferred_contact,
    supplierNotification: "not_required",
    seriousness: "elevated",
    firstResponseAt: "",
    outcome: "pending",
    aiCalls: [],
    conversation: [
      {
        id: `cloud_${row.id}_saved`,
        sender: "moblink",
        senderName: "MobLink",
        body:
          "Your request is securely saved in MobLink. The selected provider has not been contacted yet.",
        createdAt: row.created_at,
      },
    ],
    status: row.status,
    staffNotes: "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveCloudReferral(referral: Referral): Promise<Referral> {
  if (!cloudConfigured()) throw new Error("Cloud referrals are not configured");
  const client = createClient();
  await ensureCustomerSession(client);
  const result = await client
    .from("referrals")
    .insert(referralToCloudInsert(referral))
    .select(REFERRAL_COLUMNS)
    .single();
  if (result.error || !result.data) {
    throw result.error ?? new Error("Referral was not returned after saving");
  }
  return cloudRowToReferral(result.data as CloudReferralRow);
}

export async function listCloudReferrals(): Promise<Referral[]> {
  if (!cloudConfigured()) return [];
  const client = createClient();
  const current = await client.auth.getUser();
  if (current.error || !current.data.user) return [];
  const result = await client
    .from("referrals")
    .select(REFERRAL_COLUMNS)
    .order("created_at", { ascending: false });
  if (result.error) throw result.error;
  return (result.data as CloudReferralRow[]).map(cloudRowToReferral);
}

export async function getCloudReferral(id: string): Promise<Referral | undefined> {
  if (!cloudConfigured()) return undefined;
  const client = createClient();
  const current = await client.auth.getUser();
  if (current.error || !current.data.user) return undefined;
  const result = await client
    .from("referrals")
    .select(REFERRAL_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (result.error) throw result.error;
  return result.data ? cloudRowToReferral(result.data as CloudReferralRow) : undefined;
}
