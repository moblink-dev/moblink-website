export type IraacProgram = "MCC" | "YouthScape" | "The Crew" | "DARC";
export type MemberSupportLevel = "routine" | "elevated" | "high" | "urgent";
export type MemberCaseStatus = "active" | "follow_up" | "stable" | "closed";
export type MemberContactMethod = "phone" | "sms" | "email" | "in_app" | "ai_call" | "office";

export interface MemberActivity {
  id: string;
  type: MemberContactMethod;
  date: string;
  summary: string;
  outcome: "reached" | "message_left" | "scheduled" | "completed";
}

export interface Member {
  id: string;
  name: string;
  phoneMasked: string;
  suburb: string;
  postcode: string;
  programs: IraacProgram[];
  primaryNeed: string;
  supportLevel: MemberSupportLevel;
  caseStatus: MemberCaseStatus;
  joinedAt: string;
  lastContactAt: string;
  nextCheckInAt: string;
  preferredContact: "phone" | "sms" | "in_app";
  consentToContact: boolean;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  assignedTo: string;
  notes: string;
  activities: MemberActivity[];
}

const STORAGE_KEY = "moblink_iraac_members_v1";
const PROGRAMS = new Set<IraacProgram>(["MCC", "YouthScape", "The Crew", "DARC"]);
const SUPPORT_LEVELS = new Set<MemberSupportLevel>(["routine", "elevated", "high", "urgent"]);
const CASE_STATUSES = new Set<MemberCaseStatus>(["active", "follow_up", "stable", "closed"]);
const PREFERRED_CONTACT_METHODS = new Set<Member["preferredContact"]>(["phone", "sms", "in_app"]);
const MEMBER_CONTACT_METHODS = new Set<MemberContactMethod>(["phone", "sms", "email", "in_app", "ai_call", "office"]);

function member(
  id: string,
  name: string,
  phoneSuffix: string,
  suburb: string,
  postcode: string,
  programs: IraacProgram[],
  primaryNeed: string,
  supportLevel: MemberSupportLevel,
  caseStatus: MemberCaseStatus,
  joinedAt: string,
  lastContactAt: string,
  nextCheckInAt: string,
  satisfactionRating: Member["satisfactionRating"],
  feedback: string,
  assignedTo: string,
  preferredContact: Member["preferredContact"] = "phone",
  consentToContact = true,
): Member {
  return {
    id,
    name: `${name} (demo)`,
    phoneMasked: `04•• ••• ${phoneSuffix}`,
    suburb,
    postcode,
    programs,
    primaryNeed,
    supportLevel,
    caseStatus,
    joinedAt,
    lastContactAt,
    nextCheckInAt,
    preferredContact,
    consentToContact,
    satisfactionRating,
    feedback: feedback || undefined,
    assignedTo,
    notes: "Fictional demonstration member. Confirm identity and consent in a production system.",
    activities: lastContactAt ? [{
      id: `activity_${id}_latest`,
      type: preferredContact,
      date: lastContactAt,
      summary: "Latest demonstration contact recorded by the IRAAC team.",
      outcome: "reached",
    }] : [],
  };
}

export const demoMembers: Member[] = [
  member("member_jayden", "Jayden", "214", "Wollongong", "2500", ["YouthScape"], "Youth legal support and a safe pathway", "urgent", "active", "2026-08-15T08:35:00.000Z", "2026-08-15T09:02:00.000Z", "2026-08-16T09:00:00.000Z", 5, "I felt listened to and understood what would happen next.", "YouthScape team", "sms"),
  member("member_may", "Aunty May", "807", "Unanderra", "2526", ["MCC", "DARC"], "Culture, Country and family connection", "elevated", "follow_up", "2026-08-05T09:10:00.000Z", "2026-08-15T10:05:00.000Z", "2026-08-18T10:00:00.000Z", 4, "The follow-up was warm and explained the options clearly.", "MCC team"),
  member("member_corey", "Corey", "391", "Wollongong", "2500", ["The Crew"], "Practical skills and community connection", "routine", "active", "2026-08-15T10:20:00.000Z", "", "2026-08-16T14:00:00.000Z", undefined, "", "Community programs team", "sms"),
  member("member_tahlia", "Tahlia", "118", "Dapto", "2530", ["YouthScape", "The Crew"], "Training, confidence and transport", "high", "active", "2026-07-21T09:00:00.000Z", "2026-08-14T11:30:00.000Z", "2026-08-17T11:00:00.000Z", 5, "The worker kept checking in and helped me make a plan.", "YouthScape team", "in_app"),
  member("member_noah", "Noah", "522", "Warrawong", "2502", ["YouthScape"], "Court support and family communication", "high", "follow_up", "2026-07-18T10:00:00.000Z", "2026-08-13T15:10:00.000Z", "2026-08-16T15:00:00.000Z", 4, "I knew who I could call when I had questions.", "YouthScape team", "phone"),
  member("member_kylie", "Kylie", "640", "Shellharbour", "2529", ["DARC"], "Family support and service coordination", "elevated", "stable", "2026-06-22T12:00:00.000Z", "2026-08-12T09:20:00.000Z", "2026-08-26T09:00:00.000Z", 5, "Everything was explained in plain language.", "DARC team", "sms"),
  member("member_les", "Uncle Les", "903", "Port Kembla", "2505", ["MCC"], "Connection to Country and community events", "routine", "stable", "2026-05-10T09:00:00.000Z", "2026-08-11T10:00:00.000Z", "2026-09-01T10:00:00.000Z", 5, "Good people and a strong community feeling.", "MCC team", "phone"),
  member("member_aliyah", "Aliyah", "274", "Albion Park", "2527", ["The Crew"], "Work readiness and practical skills", "routine", "active", "2026-08-02T09:00:00.000Z", "2026-08-13T13:40:00.000Z", "2026-08-20T13:00:00.000Z", 4, "I liked having practical things to work towards.", "Community programs team", "in_app"),
  member("member_ben", "Ben", "455", "Corrimal", "2518", ["DARC", "The Crew"], "Housing stability and participation", "high", "follow_up", "2026-07-04T09:00:00.000Z", "2026-08-15T12:20:00.000Z", "2026-08-17T12:00:00.000Z", 3, "The first connection helped, but I am still waiting on housing support.", "DARC team", "phone"),
  member("member_shae", "Shae", "731", "Berkeley", "2506", ["YouthScape"], "Education re-engagement", "elevated", "active", "2026-08-07T09:00:00.000Z", "2026-08-14T14:30:00.000Z", "2026-08-21T14:00:00.000Z", 4, "The messages made it easy to stay in touch.", "YouthScape team", "sms"),
  member("member_rose", "Rose", "066", "Kiama", "2533", ["MCC"], "Governance support for a community group", "routine", "stable", "2026-04-14T09:00:00.000Z", "2026-08-08T10:30:00.000Z", "2026-09-08T10:00:00.000Z", 5, "The templates and guidance were practical.", "MCC team", "phone"),
  member("member_dylan", "Dylan", "329", "Figtree", "2525", ["The Crew"], "Social connection and daily routine", "elevated", "active", "2026-08-09T09:00:00.000Z", "2026-08-15T16:00:00.000Z", "2026-08-19T16:00:00.000Z", 4, "I found an activity I want to keep attending.", "Community programs team", "in_app"),
  member("member_marlene", "Marlene", "842", "Lake Heights", "2502", ["DARC"], "Family advocacy and health navigation", "high", "active", "2026-07-25T09:00:00.000Z", "2026-08-14T09:45:00.000Z", "2026-08-16T10:00:00.000Z", 4, "The team helped me keep the different services organised.", "DARC team", "phone"),
  member("member_koby", "Koby", "177", "Oak Flats", "2529", ["YouthScape", "MCC"], "Culture, mentoring and legal navigation", "elevated", "stable", "2026-06-30T09:00:00.000Z", "2026-08-10T11:10:00.000Z", "2026-08-24T11:00:00.000Z", 5, "Connecting with culture made the other support easier.", "YouthScape team", "sms"),
  member("member_nina", "Nina", "584", "Woonona", "2517", ["The Crew"], "Employment pathways", "routine", "closed", "2026-03-12T09:00:00.000Z", "2026-08-01T10:00:00.000Z", "2026-10-01T10:00:00.000Z", 5, "I completed the program and moved into training.", "Community programs team", "sms"),
  member("member_sam", "Sam", "912", "Bellambi", "2518", ["DARC"], "Family check-in and food security", "urgent", "active", "2026-08-14T09:00:00.000Z", "2026-08-15T17:30:00.000Z", "2026-08-16T08:30:00.000Z", 3, "I need a quicker answer when something is urgent.", "DARC team", "phone"),
];

export function getMembers(): Member[] {
  if (typeof window === "undefined") return cloneDemoMembers();
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!Array.isArray(parsed) || !parsed.every(isMember)) return cloneDemoMembers();
    return parsed.map(cloneMember);
  } catch {
    return cloneDemoMembers();
  }
}

export function recordMemberCheckIn(
  memberId: string,
  method: MemberContactMethod,
  summary: string,
): Member | undefined {
  const members = getMembers();
  const selected = members.find((item) => item.id === memberId);
  if (!selected || !selected.consentToContact || !summary.trim()) return undefined;
  const now = new Date().toISOString();
  selected.lastContactAt = now;
  selected.activities.push({
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: method,
    date: now,
    summary: summary.trim(),
    outcome: "completed",
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return cloneMember(selected);
}

function isMember(value: unknown): value is Member {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Member>;
  return typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && typeof candidate.phoneMasked === "string"
    && typeof candidate.suburb === "string"
    && typeof candidate.postcode === "string"
    && typeof candidate.primaryNeed === "string"
    && typeof candidate.joinedAt === "string"
    && typeof candidate.lastContactAt === "string"
    && typeof candidate.nextCheckInAt === "string"
    && typeof candidate.assignedTo === "string"
    && typeof candidate.consentToContact === "boolean"
    && Array.isArray(candidate.programs)
    && candidate.programs.every((program) => PROGRAMS.has(program))
    && typeof candidate.supportLevel === "string"
    && SUPPORT_LEVELS.has(candidate.supportLevel)
    && typeof candidate.caseStatus === "string"
    && CASE_STATUSES.has(candidate.caseStatus)
    && typeof candidate.preferredContact === "string"
    && PREFERRED_CONTACT_METHODS.has(candidate.preferredContact)
    && (candidate.satisfactionRating === undefined || [1, 2, 3, 4, 5].includes(candidate.satisfactionRating))
    && Array.isArray(candidate.activities)
    && candidate.activities.every((activity) => activity
      && typeof activity === "object"
      && typeof activity.id === "string"
      && typeof activity.date === "string"
      && typeof activity.summary === "string"
      && MEMBER_CONTACT_METHODS.has(activity.type));
}

function cloneMember(value: Member): Member {
  return {
    ...value,
    programs: [...value.programs],
    activities: value.activities.map((activity) => ({ ...activity })),
  };
}

function cloneDemoMembers(): Member[] {
  return demoMembers.map(cloneMember);
}
