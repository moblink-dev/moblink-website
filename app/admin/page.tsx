"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMembers, type Member } from "../../lib/members";
import { getIraacReferrals } from "../../lib/referrals";
import { calculateProviderReport, type ProviderReport } from "../../lib/reporting";

const snapshot = new Date("2026-08-16T23:59:59.999Z");
const priority = { urgent:0, high:1, elevated:2, routine:3 };

export default function AdminDashboard() {
  const [data, setData] = useState<{report:ProviderReport; members:Member[]} | null>(null);
  useEffect(() => { const members = getMembers(); setData({members,report:calculateProviderReport(getIraacReferrals(),members,snapshot)}); }, []);
  if (!data) return <div className="admin-page-content"><p role="status">Preparing your community overview…</p></div>;
  const { report, members } = data;
  const followUps = members.filter(m=>m.caseStatus !== "closed" && (m.supportLevel === "urgent" || m.supportLevel === "high" || new Date(m.nextCheckInAt) <= snapshot)).sort((a,b)=>priority[a.supportLevel]-priority[b.supportLevel] || a.nextCheckInAt.localeCompare(b.nextCheckInAt)).slice(0,5);
  const maxMembers = Math.max(1,...report.byProgram.map(p=>p.members));
  return <div className="admin-page-content workspace-overview">
    <header className="workspace-page-heading"><div><p className="admin-kicker">Community overview</p><h1>Make the next connection count.</h1><p>See who needs a follow-up and keep your community’s support moving.</p></div><Link className="workspace-primary" href="/admin/members">Open conversations ↗</Link></header>
    <p className="workspace-snapshot">Example reporting period: 16 August 2026 · Figures come from this browser’s demo records.</p>
    <div className="workspace-metrics"><Metric value={String(report.activeMembers)} label="Active members" detail="People in your community" /><Metric value={String(report.checkInsDue)} label="Check-ins due" detail="In the example reporting period" /><Metric value={`${report.responseRate}%`} label="Response rate" detail="See the breakdown in Reports" /><Metric value={report.averageRating == null ? "—" : `${report.averageRating}/5`} label="Member feedback" detail={`${report.feedbackCount} recorded responses`} /></div>
    <div className="workspace-overview-grid">
      <section className="workspace-card workspace-followups"><header><div><p className="admin-kicker">Start here</p><h2>People to follow up with</h2></div><Link href="/admin/members">View everyone ↗</Link></header><p className="workspace-card-intro">Priority support and check-ins from the example records.</p><div className="workspace-followup-list">{followUps.map(member=><Link key={member.id} href={`/admin/members?member=${encodeURIComponent(member.id)}`}><span className="workspace-member-avatar" aria-hidden="true">{member.name[0]}</span><div><strong>{member.name.replace(" (demo)","")}</strong><p>{member.primaryNeed}</p><small>{member.programs.join(" · ")} · {member.suburb}</small></div><span className={`workspace-priority workspace-priority-${member.supportLevel}`}>{member.supportLevel === "urgent" ? "Urgent" : member.supportLevel === "high" ? "Priority" : "Check-in"}</span><span aria-hidden="true">›</span></Link>)}{!followUps.length && <p className="workspace-card-intro">No priority or overdue check-ins in these example records.</p>}</div></section>
      <section className="workspace-card"><header><div><p className="admin-kicker">Your programs</p><h2>Where people connect</h2></div></header><div className="workspace-programs">{report.byProgram.map(program=><div key={program.program}><div><strong>{program.program}</strong><span>{program.members} members</span></div><div className="workspace-bar" aria-hidden="true"><span style={{width:`${program.members/maxMembers*100}%`}} /></div></div>)}</div><Link className="workspace-text-link" href="/admin/programs">Manage programs ↗</Link><div className="workspace-connections"><strong>{report.successfulConnections} connections</strong><p>From {report.totalReferrals} demonstration referrals. Review the full picture before drawing conclusions.</p><Link href="/admin/reports">View reports →</Link></div></section>
      <section className="workspace-card workspace-service-check"><div className="workspace-card-symbol" aria-hidden="true">⌕</div><div><p className="admin-kicker">Your public presence</p><h2>Help people find the right service.</h2><p>Review descriptions, service areas and contact details before sharing them with your community.</p><Link className="workspace-text-link" href="/admin/services">Review your services ↗</Link></div></section>
      <section className="workspace-card workspace-service-check"><div className="workspace-card-symbol" aria-hidden="true">✳</div><div><p className="admin-kicker">Planning ahead</p><h2>Bring your evidence together.</h2><p>Explore the funding workspace and prepare a draft using your program and community information.</p><Link className="workspace-text-link" href="/admin/funding">Explore funding workspace ↗</Link></div></section>
    </div><p className="workspace-footnote">Human support uses a separate staff inbox and requires an authorised account. Demo actions here do not send messages to real people.</p>
  </div>;
}
function Metric({value,label,detail}:{value:string;label:string;detail:string}) { return <article><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
