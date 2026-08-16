"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getMembers } from "../../../lib/members";
import { getIraacReferrals } from "../../../lib/referrals";
import { buildEmailReport, calculateProviderReport, formatReportDate, type ProviderReport } from "../../../lib/reporting";

const REPORT_RECIPIENTS_KEY = "moblink_iraac_report_recipients_v1";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminReportsPage() {
  const [report, setReport] = useState<ProviderReport | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    setReport(calculateProviderReport(getIraacReferrals(), getMembers(), new Date("2026-08-16T23:59:59.999Z")));
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(REPORT_RECIPIENTS_KEY) || "[]");
      if (Array.isArray(stored)) setRecipients(stored.filter((value): value is string => typeof value === "string" && EMAIL_PATTERN.test(value)));
    } catch {
      setRecipients([]);
    }
  }, []);

  const emailReport = useMemo(() => report ? buildEmailReport(report) : null, [report]);
  const mailto = emailReport && recipients.length
    ? `mailto:${recipients.join(",")}?subject=${encodeURIComponent(emailReport.subject)}&body=${encodeURIComponent(emailReport.body)}`
    : "";

  const addRecipient = (event: FormEvent) => {
    event.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setEmailMessage("Enter a valid email address.");
      return;
    }
    if (recipients.includes(email)) {
      setEmailMessage("That recipient is already on this report.");
      return;
    }
    const next = [...recipients, email];
    setRecipients(next);
    localStorage.setItem(REPORT_RECIPIENTS_KEY, JSON.stringify(next));
    setEmailInput("");
    setEmailMessage("Report recipient added in this demonstration browser.");
  };

  const removeRecipient = (email: string) => {
    const next = recipients.filter((recipient) => recipient !== email);
    setRecipients(next);
    localStorage.setItem(REPORT_RECIPIENTS_KEY, JSON.stringify(next));
    setEmailMessage("Report recipient removed.");
  };

  if (!report) return <div className="admin-page-content"><div className="admin-empty"><p>Preparing the IRAAC report…</p></div></div>;

  const maxNeed = Math.max(...report.byNeed.map((item) => item.count), 1);
  const maxSeriousness = Math.max(...report.bySeriousness.map((item) => item.count), 1);
  const topNeed = report.byNeed[0];

  return (
    <div className="admin-page-content report-workspace">
      <div className="admin-top report-top">
        <div><p className="admin-kicker">IRAAC provider portal</p><h1>Reports &amp; insights</h1><p className="admin-page-lead">A live demonstration view of member needs, service response, AI-assisted contact and community feedback.</p></div>
        <div className="report-period"><span>Current report</span><strong>{formatReportDate(report.generatedAt)}</strong></div>
      </div>

      <div className="prototype-note report-boundary"><strong>Fictional demonstration data.</strong> Every figure below is calculated from the demo members and requests currently held in this browser. It is not an operational IRAAC report.</div>

      <section className="report-email-panel" aria-labelledby="report-email-heading">
        <div><p className="admin-kicker">Report delivery</p><h2 id="report-email-heading">Add people who should receive this report.</h2><p>Recipient addresses stay in this browser. Opening the draft uses your device email app; MobLink does not send anything automatically.</p></div>
        <div className="report-email-controls">
          <form onSubmit={addRecipient}><label htmlFor="report-recipient">Report recipient email</label><div><input id="report-recipient" type="email" value={emailInput} onChange={(event) => { setEmailInput(event.target.value); setEmailMessage(""); }} placeholder="secretary@example.org.au" /><button className="admin-small-btn admin-small-btn-primary" type="submit">Add email</button></div></form>
          {recipients.length ? <div className="report-recipient-list">{recipients.map((email) => <span key={email}>{email}<button type="button" aria-label={`Remove ${email}`} onClick={() => removeRecipient(email)}>×</button></span>)}</div> : <p className="report-recipient-empty">No report recipients added yet.</p>}
          {emailMessage ? <p className="report-email-message" role="status">{emailMessage}</p> : null}
          {mailto ? <a className="admin-button" href={mailto}>Open email draft</a> : <button className="admin-button" type="button" disabled>Open email draft</button>}
        </div>
      </section>

      <section className="admin-report-section" aria-labelledby="outcomes-heading">
        <div className="report-section-heading"><div><p className="admin-kicker">Operating outcomes</p><h2 id="outcomes-heading">Are people receiving useful support?</h2></div><p>Rates change as lead records, call outcomes and feedback change.</p></div>
        <div className="report-kpi-grid">
          <KpiCard value={`${report.responseRate}%`} label="Response rate" detail={`${report.respondedReferrals} of ${report.totalReferrals} requests have a first response recorded.`} tone="ochre" />
          <KpiCard value={`${report.successfulConnectionRate}%`} label="Successful connections" detail={`${report.successfulConnections} responded request${report.successfulConnections === 1 ? "" : "s"} reached a connected outcome.`} tone="green" />
          <KpiCard value={report.averageRating === null ? "—" : `${report.averageRating}/5`} label="Average feedback" detail={`${report.feedbackCount} member and request ratings recorded.`} tone="blue" />
          <KpiCard value={`${report.aiCallCompletionRate}%`} label="AI-call completion" detail={`${report.aiCallsCompleted} of ${report.aiCallsTotal} demonstration AI calls completed.`} tone="purple" />
          <KpiCard value={String(report.totalMembers)} label="Members connected" detail={`${report.activeMembers} currently active across IRAAC programs.`} />
          <KpiCard value={String(report.checkInsDue)} label="Check-ins due" detail="Active members whose next check-in date has arrived." tone="red" />
          <KpiCard value={String(report.urgentCases)} label="High or urgent requests" detail="Open and historical requests marked high or urgent." tone="red" />
          <KpiCard value={String(report.totalReferrals)} label="Requests received" detail="IRAAC-matched app, hotline and provider requests." />
        </div>
        <details className="metric-definitions"><summary>How these KPIs are calculated</summary><dl><div><dt>Response rate</dt><dd>Requests with a first response timestamp ÷ all IRAAC requests.</dd></div><div><dt>Successful connection rate</dt><dd>Responded requests with a connected outcome ÷ all responded requests.</dd></div><div><dt>AI-call completion</dt><dd>Completed demonstration AI calls ÷ all queued, completed or failed AI calls.</dd></div><div><dt>Average feedback</dt><dd>Mean of available 1–5 ratings from member and request records.</dd></div></dl></details>
      </section>

      <section className="admin-report-section" aria-labelledby="pulse-heading">
        <div className="report-section-heading"><div><p className="admin-kicker">From IRAAC</p><h2 id="pulse-heading">Community needs pulse</h2></div><p>Plain-language signals from what people are asking for.</p></div>
        <div className="report-insight-grid">
          <article><span>Most common request</span><h3>{topNeed?.label || "No requests yet"}</h3><p>{topNeed ? `${topNeed.count} request${topNeed.count === 1 ? "" : "s"} currently ${topNeed.count === 1 ? "points" : "point"} to this need.` : "Needs will appear as requests arrive."}</p></article>
          <article><span>Seriousness guardrail</span><h3>{report.urgentCases} high or urgent</h3><p>These requests should be reviewed before routine work so urgent needs do not disappear inside volume.</p></article>
          <article><span>Member follow-up</span><h3>{report.checkInsDue} check-ins due</h3><p>Use the Members workspace to see who is due, their programs and their preferred contact method.</p></article>
        </div>
        <div className="admin-report-grid report-chart-grid">
          <ReportBars title="Requests by need" items={report.byNeed} max={maxNeed} />
          <ReportBars title="Seriousness of requests" items={report.bySeriousness.map((item) => ({ label: titleCase(item.label), count: item.count }))} max={maxSeriousness} variant="alert" />
        </div>
      </section>

      <section className="admin-report-section" aria-labelledby="program-heading">
        <div className="report-section-heading"><div><p className="admin-kicker">Program reach</p><h2 id="program-heading">How members are connected across IRAAC.</h2></div><p>A member can participate in more than one program.</p></div>
        <div className="admin-report-table-wrap"><table className="admin-report-table program-report-table"><thead><tr><th>Program</th><th>Members</th><th>Open requests</th><th>Average rating</th></tr></thead><tbody>{report.byProgram.map((program) => <tr key={program.program}><td><strong>{program.program}</strong></td><td>{program.members}</td><td>{program.openRequests}</td><td>{program.averageRating === null ? "No ratings" : `${program.averageRating} / 5`}</td></tr>)}</tbody></table></div>
      </section>

      <section className="admin-report-section" aria-labelledby="feedback-heading">
        <div className="report-section-heading"><div><p className="admin-kicker">Community feedback</p><h2 id="feedback-heading">What people say after using support.</h2></div><div className="report-rating-summary"><strong>{report.averageRating ?? "—"}</strong><span>average out of 5</span></div></div>
        <div className="feedback-report-layout">
          <div className="rating-distribution">{([5, 4, 3, 2, 1] as const).map((rating) => <div key={rating}><span>{rating} star</span><div><i style={{ width: `${report.feedbackCount ? (report.ratingDistribution[rating] / report.feedbackCount) * 100 : 0}%` }} /></div><b>{report.ratingDistribution[rating]}</b></div>)}</div>
          <div className="feedback-quotes">{report.feedback.slice(0, 6).map((feedback, index) => <blockquote key={`${feedback.name}-${index}`}><span aria-label={`${feedback.rating} out of 5 stars`}>{"★".repeat(feedback.rating)}{"☆".repeat(5 - feedback.rating)}</span><p>“{feedback.comment}”</p><cite>{feedback.name} · {feedback.source === "member" ? "member feedback" : "request feedback"}</cite></blockquote>)}</div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ value, label, detail, tone = "neutral" }: { value: string; label: string; detail: string; tone?: "neutral" | "ochre" | "green" | "blue" | "purple" | "red" }) {
  return <article className={`report-kpi-card report-kpi-${tone}`}><strong>{value}</strong><span>{label}</span><p>{detail}</p></article>;
}

function ReportBars({ title, items, max, variant = "standard" }: { title: string; items: Array<{ label: string; count: number }>; max: number; variant?: "standard" | "alert" }) {
  return <div className="admin-report-block"><h3>{title}</h3><div className="admin-report-bar-list">{items.map((item) => <div className="admin-report-bar-row" key={item.label}><span className="admin-report-bar-label">{item.label}</span><div className="admin-report-bar-track"><div className={variant === "alert" ? "admin-report-bar-fill report-bar-alert" : "admin-report-bar-fill admin-report-bar-fill-alt"} style={{ width: `${(item.count / max) * 100}%` }} /></div><span className="admin-report-bar-count">{item.count}</span></div>)}</div></div>;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
