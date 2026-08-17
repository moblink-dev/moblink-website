"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getMembers } from "../../../lib/members";
import { getIraacReferrals } from "../../../lib/referrals";
import { buildEmailReport, calculateProviderReport, formatReportDate, type ProviderReport } from "../../../lib/reporting";

const REPORT_RECIPIENTS_KEY = "moblink_iraac_report_recipients_v1";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_RECIPIENTS = ["secretary@iraac.example.org", "board@iraac.example.org"];
const monthlyReports = [
  { month: "August 2026", status: "Current draft · 16 members", title: "Legal navigation and transport are the clearest Illawarra pressure points.", sections: [
    ["Community finding", "Monthly check-ins show that people value trusted explanations and knowing the next step. YouthScape conversations also show that transport remains a barrier after legal support begins, particularly for court, appointments and safe accommodation pathways."],
    ["Program performance", "IRAAC’s strongest recorded experience is warm follow-up and continuity. Four people need a reply, so the immediate priority is response discipline: contact urgent members first, record the outcome and close the loop in Chat."],
    ["Regional meaning", "For the Illawarra, the records suggest the pressure is not only crisis demand. People are asking for earlier navigation, practical transport and a trusted coordinator before legal, housing or family issues escalate."],
    ["Funding evidence", "A YouthScape case can combine de-identified need, response time, referral outcomes, transport barriers and member feedback. The next application should define the cohort, delivery partners, safe-bail pathway and measurable outcomes before claiming eligibility."],
  ] },
  { month: "July 2026", status: "Issued · growth and coordination", title: "Membership grew while coordinated family support became more important.", sections: [
    ["Community finding", "New requests increasingly involved more than one need. Families described the burden of repeating their story and uncertainty about which service should act first."],
    ["Program performance", "DARC’s value is clearest when one IRAAC contact keeps the plan visible across family, housing, health and practical support. Follow-up consistency improved, while two lower ratings pointed to delay rather than poor treatment."],
    ["Regional meaning", "The Illawarra service system has many entry points, but navigation remains work in itself. IRAAC can demonstrate value by measuring reduced hand-offs, completed referrals and whether people still know who to contact after thirty days."],
    ["Funding evidence", "The strongest case is coordinated service navigation, supported by consented journey data and partner roles. A funder-ready version needs baseline demand, a defined DARC model and outcome measures approved by IRAAC."],
  ] },
  { month: "June 2026", status: "Issued · culture and participation", title: "Culture, practical activity and repeat participation strengthened engagement.", sections: [
    ["Community finding", "Members connected cultural identity, Country and useful group activity with confidence and belonging. Practical sessions helped people return rather than making a single enquiry."],
    ["Program performance", "MCC and The Crew created distinct evidence: MCC showed demand for peer governance support, while The Crew showed repeat participation and movement toward training, routine and employment."],
    ["Regional meaning", "Community connection is an outcome and an access pathway. In the Illawarra, trusted cultural and practical programs can make it easier for people to seek legal, family or wellbeing support earlier."],
    ["Funding evidence", "Future culture and participation bids should record attendance, repeat participation, local cultural authority, partner invitations and what changed. Public claims should wait for consent and program-level verification."],
  ] },
] as const;

export default function AdminReportsPage() {
  const [report, setReport] = useState<ProviderReport | null>(null);
  const [recipients, setRecipients] = useState<string[]>(DEFAULT_RECIPIENTS);
  const [emailInput, setEmailInput] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  useEffect(() => {
    setReport(calculateProviderReport(getIraacReferrals(), getMembers(), new Date("2026-08-16T23:59:59.999Z")));
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(REPORT_RECIPIENTS_KEY) || "null");
      if (Array.isArray(stored)) {
        const validRecipients = stored.filter((value): value is string => typeof value === "string" && EMAIL_PATTERN.test(value));
        setRecipients(validRecipients.length ? validRecipients : DEFAULT_RECIPIENTS);
      }
    } catch {
      setRecipients(DEFAULT_RECIPIENTS);
    }
  }, []);
  const emailReport = useMemo(() => report ? buildEmailReport(report) : null, [report]);
  const mailto = emailReport && recipients.length ? `mailto:${recipients.join(",")}?subject=${encodeURIComponent(emailReport.subject)}&body=${encodeURIComponent(emailReport.body)}` : "";
  const saveRecipients = (next: string[]) => { setRecipients(next); localStorage.setItem(REPORT_RECIPIENTS_KEY, JSON.stringify(next)); };
  const addRecipient = (event: FormEvent) => { event.preventDefault(); const email = emailInput.trim().toLowerCase(); if (!EMAIL_PATTERN.test(email)) return setEmailMessage("Enter a valid email address."); if (recipients.includes(email)) return setEmailMessage("That recipient is already attached."); saveRecipients([...recipients, email]); setEmailInput(""); setEmailMessage("Recipient added to future demo reports."); };
  if (!report) return <div className="admin-page-content"><div className="admin-empty"><p>Preparing the IRAAC report…</p></div></div>;
  const topNeed = report.byNeed[0];

  return <div className="admin-page-content report-workspace report-workspace-compact">
    <header className="report-compact-head"><div><p className="admin-kicker">IRAAC intelligence · {formatReportDate(report.generatedAt)}</p><h1>Reports &amp; insights</h1><p>Community demand, response quality, program reach and evidence for funding.</p></div><span>Next monthly report<br /><b>31 August</b></span></header>
    <p className="report-demo-line"><b>Demo data:</b> figures are calculated from fictional members and requests in this browser.</p>
    <section className="report-command-centre" aria-label="Key performance indicators and community pulse">
      <div className="report-compact-kpis"><MiniKpi value={`${report.responseRate}%`} label="Response" /><MiniKpi value={`${report.successfulConnectionRate}%`} label="Connected" /><MiniKpi value={`${report.averageRating ?? "—"}/5`} label="Experience" /><MiniKpi value={`${report.aiCallCompletionRate}%`} label="AI calls" /><MiniKpi value={String(report.activeMembers)} label="Active" /><MiniKpi value={String(report.checkInsDue)} label="Due" /><MiniKpi value={String(report.urgentCases)} label="Priority" /><MiniKpi value={`${report.surveyResponseRate}%`} label="Surveys" /></div>
      <div className="report-data-tables">
        <table><caption>Community needs</caption><thead><tr><th>Signal</th><th>Current reading</th><th>Action</th></tr></thead><tbody><tr><td>Top request</td><td>{topNeed?.label || "No requests"} · {topNeed?.count || 0}</td><td>Check capacity and response time</td></tr><tr><td>Seriousness</td><td>{report.urgentCases} high or urgent</td><td>Review before routine work</td></tr><tr><td>Follow-up</td><td>{report.checkInsDue} check-ins due</td><td>Open Chat response queue</td></tr><tr><td>Unmet needs</td><td>{report.unmetNeedsRaised} survey signals</td><td>Ask what blocked earlier help</td></tr></tbody></table>
        <table><caption>Program reach</caption><thead><tr><th>Program</th><th>Members</th><th>Open</th><th>Rating</th></tr></thead><tbody>{report.byProgram.map((item) => <tr key={item.program}><td><Link href="/admin/programs"><b>{item.program}</b></Link></td><td>{item.members}</td><td>{item.openRequests}</td><td>{item.averageRating ?? "—"}/5</td></tr>)}</tbody></table>
        <table><caption>Survey intelligence</caption><thead><tr><th>Measure</th><th>Result</th><th>Interpretation</th></tr></thead><tbody><tr><td>Received</td><td>{report.surveyResponses}</td><td>{report.surveyResponseRate}% response rate</td></tr><tr><td>Due</td><td>{report.surveysDue}</td><td>Schedule consented follow-up</td></tr><tr><td>Working</td><td colSpan={2}>Warm explanations, clear next steps, cultural connection</td></tr><tr><td>Watch</td><td colSpan={2}>Legal navigation, transport, housing delay, urgent response</td></tr></tbody></table>
      </div>
    </section>
    <section className="admin-report-section report-feedback-compact" aria-labelledby="feedback-heading"><header className="report-section-heading"><div><p className="admin-kicker">Community feedback</p><h2 id="feedback-heading">What people say after support</h2></div><div className="report-rating-summary"><strong>{report.averageRating ?? "—"}</strong><span>average / 5</span></div></header><div className="feedback-report-layout"><div className="rating-distribution">{([5,4,3,2,1] as const).map((rating) => <div key={rating}><span>{rating} star</span><div><i style={{ width: `${report.feedbackCount ? report.ratingDistribution[rating] / report.feedbackCount * 100 : 0}%` }} /></div><b>{report.ratingDistribution[rating]}</b></div>)}</div><div className="feedback-quotes">{report.feedback.slice(0,4).map((item,index) => <blockquote key={`${item.name}-${index}`}><span>{"★".repeat(item.rating)}{"☆".repeat(5-item.rating)}</span><p>“{item.comment}”</p><cite>{item.name}</cite></blockquote>)}</div></div></section>
    <section className="monthly-report-history monthly-report-expanded" aria-labelledby="monthly-history-heading"><header><div><p className="admin-kicker">Monthly intelligence</p><h2 id="monthly-history-heading">Reports over time</h2></div><span>Generated monthly · human review required</span></header><div className="monthly-report-list">{monthlyReports.map((item, index) => <details key={item.month} open={index === 0}><summary><span><b>{item.month}</b><small>{item.status}</small></span><strong>Read full report</strong></summary><div className="monthly-report-body"><h3>{item.title}</h3>{item.sections.map(([heading, body]) => <section key={heading}><h4>{heading}</h4><p>{body}</p></section>)}<div className="monthly-report-sent"><b>{index === 0 ? "Scheduled recipients" : "Sent to"}</b>{recipients.map((email) => <span key={email}>{email}</span>)}</div>{index === 0 ? <Link href="/admin/funding">Discuss evidence with Moblink →</Link> : null}</div></details>)}</div></section>
    <section className="report-email-panel report-email-panel-end" aria-labelledby="report-email-heading"><div><p className="admin-kicker">Monthly newsletter delivery</p><h2 id="report-email-heading">Who receives IRAAC’s reports?</h2><p>Edit the shared recipient list. In this prototype, Moblink only opens a draft in the device email app.</p></div><div className="report-email-controls"><form onSubmit={addRecipient}><label htmlFor="report-recipient">Add recipient email</label><div><input id="report-recipient" type="email" value={emailInput} onChange={(event) => setEmailInput(event.target.value)} placeholder="person@example.org" /><button className="admin-small-btn admin-small-btn-primary" type="submit">Add</button></div></form><div className="report-recipient-list">{recipients.map((email) => <span key={email}>{email}<button type="button" aria-label={`Remove ${email}`} onClick={() => saveRecipients(recipients.filter((item) => item !== email))}>×</button></span>)}</div>{emailMessage ? <p className="report-email-message" role="status">{emailMessage}</p> : null}{mailto ? <a className="admin-button" href={mailto}>Open August email draft</a> : <button className="admin-button" disabled type="button">Add a recipient first</button>}</div></section>
  </div>;
}

function MiniKpi({ value, label }: { value: string; label: string }) { return <article><strong>{value}</strong><span>{label}</span></article>; }
