"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMembers } from "../../lib/members";
import { getIraacReferrals } from "../../lib/referrals";
import { calculateProviderReport, type ProviderReport } from "../../lib/reporting";

export default function AdminDashboard() {
  const [report, setReport] = useState<ProviderReport | null>(null);
  useEffect(() => setReport(calculateProviderReport(getIraacReferrals(), getMembers(), new Date("2026-08-16T23:59:59.999Z"))), []);
  if (!report) return <div className="admin-page-content"><p>Preparing IRAAC dashboard…</p></div>;
  const topProgram = [...report.byProgram].sort((a, b) => b.members - a.members)[0];
  return <div className="admin-page-content compact-dashboard">
    <header className="compact-dashboard-head"><div><p className="admin-kicker">IRAAC · 16 August 2026</p><h1>Community dashboard</h1><p>Members, response, service outcomes and funding readiness at a glance.</p></div><Link href="/admin/members">{report.checkInsDue} actions due →</Link></header>
    <section className="dashboard-kpi-strip"><Metric value={String(report.activeMembers)} label="Active members" trend="+3 this month" /><Metric value={`${report.responseRate}%`} label="Response rate" trend={report.responseRate >= 80 ? "On track" : "Needs attention"} /><Metric value={`${report.successfulConnectionRate}%`} label="Lead conversion" trend={`${report.successfulConnections} connected`} /><Metric value={`${report.averageRating ?? "—"}/5`} label="Member happiness" trend={`${report.feedbackCount} responses`} /><Metric value={String(report.checkInsDue)} label="AI check-ins due" trend="Next batch today" /><Metric value={String(report.totalReferrals)} label="Leads received" trend="Illawarra matched" /></section>
    <div className="dashboard-operations-grid">
      <section className="dashboard-panel dashboard-priority"><header><div><p className="admin-kicker">Response queue</p><h2>Who needs IRAAC next</h2></div><Link href="/admin/members">Open inbox</Link></header><ul><li><b>Corey</b><span>New lead · The Crew</span><em>Needs response</em></li><li><b>Sam</b><span>Urgent DARC check-in</span><em>2h waiting</em></li><li><b>Jayden</b><span>Transport after YouthScape call</span><em>1 day</em></li><li><b>Tahlia</b><span>Training and transport follow-up</span><em>2 days</em></li></ul></section>
      <section className="dashboard-panel"><header><div><p className="admin-kicker">Community pulse</p><h2>What members are saying</h2></div><Link href="/admin/reports">Full report</Link></header><div className="dashboard-sentiment"><strong>{report.averageRating ?? "—"}/5</strong><p><b>Working:</b> warm explanations, clear next steps and cultural connection.</p><p><b>Watch:</b> legal navigation, transport and urgent response time.</p></div></section>
      <section className="dashboard-panel"><header><div><p className="admin-kicker">Program demand</p><h2>{topProgram?.program || "IRAAC programs"} has the widest reach</h2></div><Link href="/admin/programs">Open programs</Link></header><div className="dashboard-program-bars">{report.byProgram.map((item) => <div key={item.program}><span>{item.program}</span><i><b style={{ width: `${Math.max(14, item.members / Math.max(...report.byProgram.map((value) => value.members)) * 100)}%` }} /></i><em>{item.members}</em></div>)}</div></section>
      <section className="dashboard-panel"><header><div><p className="admin-kicker">Funding</p><h2>Evidence is building</h2></div><Link href="/admin/funding">Ask Moblink</Link></header><ul className="dashboard-funding-list"><li><b>Youth justice pathways</b><span>Strong member evidence</span></li><li><b>MCC culture and Country</b><span>Watch next suitable round</span></li><li><b>August evidence report</b><span>Draft due 31 Aug</span></li></ul></section>
      <section className="dashboard-panel dashboard-schedule"><header><div><p className="admin-kicker">Next 30 days</p><h2>Automated support rhythm</h2></div></header><div><span><b>{report.checkInsDue}</b> AI check-ins</span><span><b>{report.surveysDue}</b> surveys due</span><span><b>31 Aug</b> monthly report</span><span><b>1 Sep</b> response allowance resets</span></div></section>
      <section className="dashboard-panel"><header><div><p className="admin-kicker">Provider readiness</p><h2>Profile and operations</h2></div><Link href="/admin/profile">Complete profile</Link></header><p className="dashboard-readiness">Services are published. Public address, opening hours and IRAAC contact details still need confirmation. Funding conversations and reports remain drafts for staff review.</p></section>
    </div><p className="dashboard-demo-boundary">Fictional demonstration data only. No calls, subscriptions, reports or messages are sent automatically.</p>
  </div>;
}

function Metric({ value, label, trend }: { value: string; label: string; trend: string }) { return <article><strong>{value}</strong><span>{label}</span><small>{trend}</small></article>; }
