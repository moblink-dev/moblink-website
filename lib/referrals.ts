export type ReferralStatus =
  | "requested"
  | "triage"
  | "referred"
  | "follow_up_due"
  | "resolved"
  | "could_not_connect"
  | "escalated"
  | "withdrawn";

export type ReferralSource = "app" | "hotline" | "ai_outbound" | "provider";
export type PreferredContact = "phone" | "sms" | "in_app";
export type SupplierNotificationStatus = "not_required" | "queued" | "sent";
export type AICallPurpose = "check_in" | "needs";
export type ReferralSeriousness = "routine" | "elevated" | "high" | "urgent";
export type ReferralOutcome = "pending" | "progressing" | "connected" | "not_connected";

export interface AICallActivity {
  id: string;
  purpose: AICallPurpose;
  status: "queued" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
}

export interface ReferralMessage {
  id: string;
  sender: "community" | "provider" | "moblink";
  senderName: string;
  body: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  postcode: string;
  needCategory: string;
  message: string;
  consentToFollowUp: boolean;
  consentToAICall: boolean;
  source: ReferralSource;
  preferredContact: PreferredContact;
  supplierNotification: SupplierNotificationStatus;
  seriousness: ReferralSeriousness;
  firstResponseAt: string;
  outcome: ReferralOutcome;
  rating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  aiCalls: AICallActivity[];
  conversation: ReferralMessage[];
  status: ReferralStatus;
  staffNotes: string;
  createdAt: string;
  updatedAt: string;
}

type ReferralInput = Omit<
  Referral,
  | "id"
  | "status"
  | "staffNotes"
  | "createdAt"
  | "updatedAt"
  | "conversation"
  | "supplierNotification"
  | "aiCalls"
  | "postcode"
  | "source"
  | "preferredContact"
  | "consentToAICall"
  | "seriousness"
  | "firstResponseAt"
  | "outcome"
  | "rating"
  | "feedback"
> & {
  conversation?: ReferralMessage[];
  supplierNotification?: SupplierNotificationStatus;
  aiCalls?: AICallActivity[];
  postcode?: string;
  source?: ReferralSource;
  preferredContact?: PreferredContact;
  consentToAICall?: boolean;
  seriousness?: ReferralSeriousness;
  firstResponseAt?: string;
  outcome?: ReferralOutcome;
  rating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
};

const STORAGE_KEY = "moblink_referrals";
const LEGACY_STORAGE_KEY = "iraac_referrals";
const REFERRAL_SERIOUSNESS = new Set<ReferralSeriousness>(["routine", "elevated", "high", "urgent"]);
const REFERRAL_OUTCOMES = new Set<ReferralOutcome>(["pending", "progressing", "connected", "not_connected"]);

export function createReferral(data: ReferralInput): Referral {
  const now = new Date().toISOString();
  return {
    ...data,
    postcode: data.postcode ?? "",
    source: data.source ?? "app",
    preferredContact: data.preferredContact ?? "phone",
    consentToAICall: data.consentToAICall ?? false,
    seriousness: data.seriousness ?? "elevated",
    firstResponseAt: data.firstResponseAt ?? "",
    outcome: data.outcome ?? "pending",
    rating: data.rating,
    feedback: data.feedback,
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "requested",
    staffNotes: "",
    supplierNotification: data.supplierNotification ?? (data.consentToFollowUp ? "queued" : "not_required"),
    aiCalls: data.aiCalls ?? [],
    conversation: data.conversation ?? [
      {
        id: `msg_${Date.now()}_welcome`,
        sender: "moblink",
        senderName: "Moblink",
        body: data.consentToFollowUp
          ? `Your request has been shared with ${data.serviceName}. You can keep the conversation here.`
          : `This request is saved on this device and has not been shared with ${data.serviceName}.`,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function getReferrals(): Referral[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return cloneDemoReferrals();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return cloneDemoReferrals();
    const referrals = parsed
      .filter(isStoredReferral)
      .map(normalizeReferral)
      .filter((referral) => referral.id !== "lead_demo_centrelink");
    const missingDemoReferrals = cloneDemoReferrals().filter(
      (demo) => !referrals.some((referral) => referral.id === demo.id),
    );
    if (missingDemoReferrals.length > 0 || referrals.length !== parsed.length) {
      const migrated = [...missingDemoReferrals, ...referrals];
      writeReferrals(migrated);
      return migrated;
    }
    return referrals;
  } catch {
    return cloneDemoReferrals();
  }
}

export function getDemoReferrals(): Referral[] {
  return cloneDemoReferrals();
}

export function saveReferral(referral: Referral): void {
  if (typeof window === "undefined") return;
  const referrals = getReferrals();
  const idx = referrals.findIndex((r) => r.id === referral.id);
  if (idx >= 0) {
    referrals[idx] = { ...referral, updatedAt: new Date().toISOString() };
  } else {
    referrals.push(referral);
  }
  writeReferrals(referrals);
}

export function updateReferralStatus(id: string, status: ReferralStatus, notes?: string): Referral | undefined {
  const referrals = getReferrals();
  const r = referrals.find((ref) => ref.id === id);
  if (!r) return undefined;
  if (r.status === status && (notes === undefined || r.staffNotes === notes)) return r;
  r.status = status;
  if (notes !== undefined) r.staffNotes = notes;
  r.updatedAt = new Date().toISOString();
  writeReferrals(referrals);
  return r;
}

export function addReferralMessage(
  id: string,
  message: Pick<ReferralMessage, "sender" | "senderName" | "body">,
): Referral | undefined {
  const referrals = getReferrals();
  const referral = referrals.find((item) => item.id === id);
  if (!referral || !message.body.trim()) return undefined;

  referral.conversation.push({
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    body: message.body.trim(),
    createdAt: new Date().toISOString(),
  });
  referral.updatedAt = new Date().toISOString();
  writeReferrals(referrals);
  return referral;
}

export function scheduleAICall(
  id: string,
  purpose: AICallPurpose,
): { status: "queued" | "blocked"; referral?: Referral; reason?: string } {
  const referrals = getReferrals();
  const referral = referrals.find((item) => item.id === id);
  if (!referral) return { status: "blocked", reason: "Lead not found." };
  if (!referral.serviceId.startsWith("iraac-")) {
    return { status: "blocked", referral, reason: "This lead is not matched to an IRAAC service." };
  }
  if (!referral.consentToFollowUp) {
    return { status: "blocked", referral, reason: "Follow-up consent is required before an AI call can be queued." };
  }
  if (!referral.consentToAICall) {
    return { status: "blocked", referral, reason: "Specific AI voice-call consent is required before a call can be queued." };
  }
  if (["resolved", "withdrawn", "could_not_connect"].includes(referral.status)) {
    return { status: "blocked", referral, reason: "Closed leads cannot be added to the AI call queue." };
  }
  if (referral.aiCalls.some((call) => call.purpose === purpose && call.status === "queued")) {
    return { status: "blocked", referral, reason: "A demonstration call for this purpose is already queued." };
  }

  const now = new Date().toISOString();
  const activity: AICallActivity = {
    id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    purpose,
    status: "queued",
    createdAt: now,
  };
  referral.aiCalls.push(activity);
  referral.status = "triage";
  referral.conversation.push({
    id: `msg_${Date.now()}_ai_call`,
    sender: "moblink",
    senderName: "Moblink AI call assistant",
    body: purpose === "check_in"
      ? "IRAAC queued a demonstration AI phone check-in. The call will ask whether the person is safe, whether they still want support, and record a summary here. No real call is placed in this prototype."
      : "IRAAC queued a demonstration AI phone call to find out more about what support the person needs and explain relevant IRAAC services. A summary will be recorded here. No real call is placed in this prototype.",
    createdAt: now,
  });
  referral.updatedAt = now;
  writeReferrals(referrals);
  return { status: "queued", referral };
}

export function getReferralById(id: string): Referral | undefined {
  return getReferrals().find((r) => r.id === id);
}

export function getIraacReferrals(): Referral[] {
  return getReferrals().filter((referral) => referral.serviceId.startsWith("iraac-"));
}

export function getIraacReferralById(id: string): Referral | undefined {
  return getIraacReferrals().find((referral) => referral.id === id);
}

export function getReferralStats(referrals = getReferrals()) {
  return {
    total: referrals.length,
    requested: referrals.filter((r) => r.status === "requested").length,
    triage: referrals.filter((r) => r.status === "triage").length,
    referred: referrals.filter((r) => r.status === "referred").length,
    followUpDue: referrals.filter((r) => r.status === "follow_up_due").length,
    resolved: referrals.filter((r) => r.status === "resolved").length,
    couldNotConnect: referrals.filter((r) => r.status === "could_not_connect").length,
    escalated: referrals.filter((r) => r.status === "escalated").length,
    withdrawn: referrals.filter((r) => r.status === "withdrawn").length,
    byCategory: groupBy(referrals, "needCategory"),
    byService: groupBy(referrals, "serviceName"),
  };
}

function groupBy(items: Referral[], key: keyof Referral): Record<string, number> {
  return items.reduce(
    (acc, item) => {
      const k = String(item[key]);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function writeReferrals(referrals: Referral[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
}

function cloneDemoReferrals(): Referral[] {
  return demoReferrals.map((referral) => ({
    ...referral,
    aiCalls: referral.aiCalls.map((call) => ({ ...call })),
    conversation: referral.conversation.map((message) => ({ ...message })),
  }));
}

function normalizeReferral(referral: Referral): Referral {
  const demo = demoReferrals.find((item) => item.id === referral.id);
  const isIraacDemo = Boolean(demo);
  const storedCalls = Array.isArray(referral.aiCalls) ? referral.aiCalls : [];
  const demoCalls = demo?.aiCalls.filter((call) => !storedCalls.some((stored) => stored.id === call.id)) || [];
  return {
    ...referral,
    postcode: referral.id === "lead_demo_youthscape" && referral.postcode === "2541" ? "2500" : referral.postcode || "",
    source: referral.source || "app",
    preferredContact: referral.preferredContact || "phone",
    consentToAICall: referral.consentToAICall === true || (isIraacDemo && referral.consentToAICall !== false),
    supplierNotification: referral.supplierNotification || "not_required",
    seriousness: REFERRAL_SERIOUSNESS.has(referral.seriousness) ? referral.seriousness : demo?.seriousness || "elevated",
    firstResponseAt: referral.firstResponseAt || demo?.firstResponseAt || "",
    outcome: REFERRAL_OUTCOMES.has(referral.outcome) ? referral.outcome : demo?.outcome || "pending",
    rating: [1, 2, 3, 4, 5].includes(referral.rating ?? 0) ? referral.rating : demo?.rating,
    feedback: referral.feedback ?? demo?.feedback,
    conversation: Array.isArray(referral.conversation) ? referral.conversation : [],
    aiCalls: [...storedCalls, ...demoCalls],
  };
}

function isStoredReferral(value: unknown): value is Referral {
  if (!value || typeof value !== "object") return false;
  const referral = value as Partial<Referral>;
  return (
    typeof referral.id === "string" &&
    typeof referral.serviceId === "string" &&
    typeof referral.serviceName === "string" &&
    typeof referral.requesterName === "string" &&
    typeof referral.requesterPhone === "string" &&
    typeof referral.message === "string" &&
    typeof referral.consentToFollowUp === "boolean" &&
    typeof referral.status === "string" &&
    typeof referral.createdAt === "string"
  );
}

export const demoReferrals: Referral[] = [
  {
    id: "lead_demo_youthscape",
    serviceId: "iraac-youthscape",
    serviceName: "IRAAC YouthScape",
    serviceCategory: "Youth",
    requesterName: "Jayden (demo)",
    requesterPhone: "04•• ••• 214",
    requesterEmail: "",
    postcode: "2500",
    needCategory: "Youth legal support",
    message: "A young person in Wollongong needs practical support around bail, a safe place to return to and connection with a trusted worker.",
    consentToFollowUp: true,
    consentToAICall: true,
    source: "hotline",
    preferredContact: "sms",
    supplierNotification: "queued",
    seriousness: "urgent",
    firstResponseAt: "2026-08-15T09:02:00.000Z",
    outcome: "connected",
    rating: 5,
    feedback: "I felt listened to and understood what would happen next.",
    status: "requested",
    staffNotes: "Confirm that YouthScape is suitable and coordinate qualified legal support where needed.",
    aiCalls: [{ id: "call_demo_youth_1", purpose: "needs", status: "completed", createdAt: "2026-08-15T08:48:00.000Z", completedAt: "2026-08-15T08:55:00.000Z" }],
    conversation: [
      {
        id: "msg_demo_1",
        sender: "moblink",
        senderName: "Moblink call centre",
        body: "This person asked Moblink for youth support in the Illawarra and agreed to an SMS follow-up from IRAAC.",
        createdAt: "2026-08-15T08:35:00.000Z",
      },
      {
        id: "msg_demo_2",
        sender: "community",
        senderName: "Community member",
        body: "I would like to talk with someone who can explain what happens next.",
        createdAt: "2026-08-15T08:42:00.000Z",
      },
    ],
    createdAt: "2026-08-15T08:35:00.000Z",
    updatedAt: "2026-08-15T08:42:00.000Z",
  },
  {
    id: "lead_demo_country",
    serviceId: "iraac-mcc",
    serviceName: "IRAAC MCC - Mob and Country Connections",
    serviceCategory: "Culture",
    requesterName: "Aunty May (demo)",
    requesterPhone: "04•• ••• 807",
    requesterEmail: "",
    postcode: "2526",
    needCategory: "Culture and Country",
    message: "Looking for a culturally safe way for family members in the Illawarra to reconnect with community and Country.",
    consentToFollowUp: true,
    consentToAICall: true,
    source: "app",
    preferredContact: "phone",
    supplierNotification: "sent",
    seriousness: "elevated",
    firstResponseAt: "2026-08-15T10:05:00.000Z",
    outcome: "progressing",
    rating: 4,
    feedback: "The follow-up was warm and explained the available options clearly.",
    status: "follow_up_due",
    staffNotes: "Call after 10am and ask which family members would like to participate.",
    aiCalls: [{ id: "call_demo_country_1", purpose: "check_in", status: "completed", createdAt: "2026-08-15T09:45:00.000Z", completedAt: "2026-08-15T09:51:00.000Z" }],
    conversation: [{
      id: "msg_demo_country_1",
      sender: "moblink",
      senderName: "Moblink",
      body: "This person chose IRAAC MCC and agreed to a phone follow-up for this request.",
      createdAt: "2026-08-15T09:10:00.000Z",
    }],
    createdAt: "2026-08-15T09:10:00.000Z",
    updatedAt: "2026-08-15T09:10:00.000Z",
  },
  {
    id: "lead_demo_crew",
    serviceId: "iraac-the-crew",
    serviceName: "IRAAC The Crew",
    serviceCategory: "Community",
    requesterName: "Corey (demo)",
    requesterPhone: "04•• ••• 391",
    requesterEmail: "",
    postcode: "2500",
    needCategory: "Skills and community connection",
    message: "Interested in practical activities, building skills and meeting other community members around Wollongong.",
    consentToFollowUp: true,
    consentToAICall: true,
    source: "hotline",
    preferredContact: "sms",
    supplierNotification: "queued",
    seriousness: "routine",
    firstResponseAt: "",
    outcome: "pending",
    status: "requested",
    staffNotes: "",
    aiCalls: [],
    conversation: [{
      id: "msg_demo_crew_1",
      sender: "moblink",
      senderName: "Moblink hotline",
      body: "This person asked about practical community programs and agreed to an IRAAC SMS follow-up.",
      createdAt: "2026-08-15T10:20:00.000Z",
    }],
    createdAt: "2026-08-15T10:20:00.000Z",
    updatedAt: "2026-08-15T10:20:00.000Z",
  },
];

export const referralStatusLabels: Record<ReferralStatus, string> = {
  requested: "New — pending review",
  triage: "In triage",
  referred: "Referred to service",
  follow_up_due: "Follow-up due",
  resolved: "Resolved",
  could_not_connect: "Could not connect",
  escalated: "Escalated",
  withdrawn: "Withdrawn",
};

export const referralSourceLabels: Record<ReferralSource, string> = {
  app: "Moblink app",
  hotline: "Moblink hotline",
  ai_outbound: "AI-assisted outbound call",
  provider: "Provider-created",
};

export const preferredContactLabels: Record<PreferredContact, string> = {
  phone: "Phone call",
  sms: "Text message",
  in_app: "Moblink chat",
};

export const supplierNotificationLabels: Record<SupplierNotificationStatus, string> = {
  not_required: "Not required",
  queued: "Queued",
  sent: "Sent",
};

export const referralStatusColors: Record<ReferralStatus, string> = {
  requested: "#f59e0b",
  triage: "#3b82f6",
  referred: "#10b981",
  follow_up_due: "#8b5cf6",
  resolved: "#6b7280",
  could_not_connect: "#ef4444",
  escalated: "#dc2626",
  withdrawn: "#9ca3af",
};

export const needCategories = [
  "Housing",
  "Legal",
  "Health",
  "Mental Health",
  "Addiction",
  "Family",
  "Youth",
  "Elderly Care",
  "Disability",
  "Employment",
  "Education",
  "Financial",
  "Centrelink",
  "Culture",
  "Transport",
  "Food",
  "Other",
];
