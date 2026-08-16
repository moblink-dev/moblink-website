import type { Member, IraacProgram } from "./members.ts";
import type { Referral, ReferralSeriousness } from "./referrals.ts";

export interface ProgramReport {
  program: IraacProgram;
  members: number;
  openRequests: number;
  averageRating: number | null;
}

export interface ProviderReport {
  generatedAt: string;
  totalMembers: number;
  activeMembers: number;
  checkInsDue: number;
  totalReferrals: number;
  respondedReferrals: number;
  responseRate: number;
  successfulConnections: number;
  successfulConnectionRate: number;
  urgentCases: number;
  aiCallsTotal: number;
  aiCallsCompleted: number;
  aiCallCompletionRate: number;
  averageRating: number | null;
  feedbackCount: number;
  surveyResponses: number;
  surveysDue: number;
  surveyResponseRate: number;
  unmetNeedsRaised: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  byNeed: Array<{ label: string; count: number }>;
  bySeriousness: Array<{ label: ReferralSeriousness; count: number }>;
  byProgram: ProgramReport[];
  feedback: Array<{ name: string; rating: number; comment: string; source: "member" | "request" }>;
}

const programServiceIds: Record<IraacProgram, string> = {
  MCC: "iraac-mcc",
  YouthScape: "iraac-youthscape",
  "The Crew": "iraac-the-crew",
  DARC: "iraac-darc",
};

export function calculateProviderReport(
  referrals: Referral[],
  members: Member[],
  now = new Date(),
): ProviderReport {
  const responded = referrals.filter((referral) => Boolean(referral.firstResponseAt));
  const successful = responded.filter((referral) => referral.outcome === "connected");
  const calls = referrals.flatMap((referral) => referral.aiCalls);
  const completedCalls = calls.filter((call) => call.status === "completed");
  const memberFeedback = members.flatMap((member) => member.satisfactionRating && member.feedback ? [{
    name: member.name,
    rating: member.satisfactionRating,
    comment: member.feedback,
    source: "member" as const,
  }] : []);
  const requestFeedback = referrals.flatMap((referral) => referral.rating && referral.feedback ? [{
    name: referral.requesterName,
    rating: referral.rating,
    comment: referral.feedback,
    source: "request" as const,
  }] : []);
  const feedback = [...memberFeedback, ...requestFeedback];
  const ratings = feedback.map((item) => item.rating);
  const surveyResponses = members.filter((member) => member.satisfactionRating && member.feedback).length;
  const surveysDue = members.filter((member) => member.caseStatus !== "closed" && !member.satisfactionRating).length;
  const unmetNeedsRaised = memberFeedback.filter((item) => /\b(still|waiting|need|quicker|delay)\b/i.test(item.comment)).length;
  const ratingDistribution: ProviderReport["ratingDistribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((rating) => { ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] += 1; });

  return {
    generatedAt: now.toISOString(),
    totalMembers: members.length,
    activeMembers: members.filter((member) => member.caseStatus !== "closed").length,
    checkInsDue: members.filter((member) => member.caseStatus !== "closed" && new Date(member.nextCheckInAt) <= now).length,
    totalReferrals: referrals.length,
    respondedReferrals: responded.length,
    responseRate: percentage(responded.length, referrals.length),
    successfulConnections: successful.length,
    successfulConnectionRate: percentage(successful.length, responded.length),
    urgentCases: referrals.filter((referral) => referral.seriousness === "high" || referral.seriousness === "urgent").length,
    aiCallsTotal: calls.length,
    aiCallsCompleted: completedCalls.length,
    aiCallCompletionRate: percentage(completedCalls.length, calls.length),
    averageRating: ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)) : null,
    feedbackCount: feedback.length,
    surveyResponses,
    surveysDue,
    surveyResponseRate: percentage(surveyResponses, surveyResponses + surveysDue),
    unmetNeedsRaised,
    ratingDistribution,
    byNeed: groupCounts(referrals.map((referral) => referral.needCategory)),
    bySeriousness: (["urgent", "high", "elevated", "routine"] as ReferralSeriousness[]).map((label) => ({
      label,
      count: referrals.filter((referral) => referral.seriousness === label).length,
    })),
    byProgram: (Object.keys(programServiceIds) as IraacProgram[]).map((program) => {
      const programMembers = members.filter((member) => member.programs.includes(program));
      const programRatings = programMembers.flatMap((member) => member.satisfactionRating ? [member.satisfactionRating] : []);
      return {
        program,
        members: programMembers.length,
        openRequests: referrals.filter((referral) => referral.serviceId === programServiceIds[program] && !["resolved", "withdrawn", "could_not_connect"].includes(referral.status)).length,
        averageRating: programRatings.length ? Number((programRatings.reduce((sum, rating) => sum + rating, 0) / programRatings.length).toFixed(1)) : null,
      };
    }),
    feedback,
  };
}

export function buildEmailReport(report: ProviderReport): { subject: string; body: string } {
  const date = formatReportDate(report.generatedAt);
  return {
    subject: `IRAAC community support report — ${date}`,
    body: [
      "IRAAC community support report",
      `Generated ${date}`,
      "",
      `Members: ${report.totalMembers} (${report.activeMembers} active)`,
      `Requests: ${report.totalReferrals}`,
      `Response rate: ${report.responseRate}%`,
      `Successful connection rate: ${report.successfulConnectionRate}%`,
      `High or urgent requests: ${report.urgentCases}`,
      `Check-ins due: ${report.checkInsDue}`,
      `AI calls completed: ${report.aiCallsCompleted} of ${report.aiCallsTotal}`,
      `Average feedback: ${report.averageRating === null ? "No ratings yet" : `${report.averageRating} out of 5`}`,
      `Member surveys: ${report.surveyResponses} received, ${report.surveysDue} due`,
      `Unmet needs raised: ${report.unmetNeedsRaised}`,
      "",
      "This report contains fictional demonstration data only. It is not an operational IRAAC record.",
    ].join("\n"),
  };
}

export function formatReportDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function percentage(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function groupCounts(values: string[]): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
