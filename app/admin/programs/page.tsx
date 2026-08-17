"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMembers, type IraacProgram, type Member } from "../../../lib/members";

const programDetails: Array<{ name: IraacProgram; focus: string; outcome: string; team: string }> = [
  { name: "MCC", focus: "Peer-led governance, administration and reporting capability for Aboriginal Community Organisations.", outcome: "Invited organisations leave with practical systems, stronger reporting and fewer compliance gaps.", team: "MCC team" },
  { name: "YouthScape", focus: "Culture, opportunity, legal navigation and safe pathways for young people.", outcome: "Young people understand their next step, stay connected and can reach trusted legal and practical support.", team: "YouthScape team" },
  { name: "The Crew", focus: "Practical skills, community connection, participation and work readiness.", outcome: "Members return to useful activity, build confidence and move toward training or employment.", team: "Community programs team" },
  { name: "DARC", focus: "Coordinated family support, advocacy and navigation across several needs.", outcome: "Families repeat their story less and have one clearer plan across services.", team: "DARC team" },
];

export default function ProgramsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<IraacProgram>("MCC");
  useEffect(() => setMembers(getMembers()), []);

  const rows = useMemo(() => members
    .filter((member) => member.programs.includes(selected))
    .sort((a, b) => new Date(b.lastContactAt || b.joinedAt).getTime() - new Date(a.lastContactAt || a.joinedAt).getTime()), [members, selected]);
  const detail = programDetails.find((item) => item.name === selected) || programDetails[0];
  const active = rows.filter((member) => member.caseStatus !== "closed").length;
  const due = rows.filter((member) => member.caseStatus !== "closed" && new Date(member.nextCheckInAt) <= new Date("2026-08-16T23:59:59.999Z")).length;
  const ratings = rows.flatMap((member) => member.satisfactionRating ? [member.satisfactionRating] : []);
  const average = ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : "—";

  return <div className="admin-page-content programs-page">
    <header className="programs-head"><div><p className="admin-kicker">IRAAC operations</p><h1>Programs</h1><p>See who is participating, what support is underway and what each program needs next.</p></div><Link className="admin-small-btn admin-small-btn-primary" href="/admin/services">Edit public services</Link></header>
    <nav className="program-tabs" aria-label="IRAAC programs">{programDetails.map((program) => {
      const count = members.filter((member) => member.programs.includes(program.name) && member.caseStatus !== "closed").length;
      return <button key={program.name} type="button" className={selected === program.name ? "active" : ""} onClick={() => setSelected(program.name)}><strong>{program.name}</strong><span>{count} active</span></button>;
    })}</nav>
    <section className="program-overview-card">
      <div><p className="admin-kicker">{detail.team}</p><h2>{detail.name}</h2><p>{detail.focus}</p><small><b>Outcome to track:</b> {detail.outcome}</small></div>
      <div className="program-mini-kpis"><span><b>{active}</b> active</span><span><b>{due}</b> due</span><span><b>{average}/5</b> rating</span><span><b>{rows.filter((member) => member.supportLevel === "high" || member.supportLevel === "urgent").length}</b> priority</span></div>
    </section>
    <section className="program-member-table" aria-labelledby="program-members-heading">
      <header><div><p className="admin-kicker">Live program register</p><h2 id="program-members-heading">{selected} members</h2></div><Link href="/admin/members">Open Chat →</Link></header>
      <div className="admin-report-table-wrap"><table className="admin-report-table"><thead><tr><th>Member</th><th>What they need</th><th>Activity</th><th>Next contact</th><th>Why now</th><th>Status</th></tr></thead><tbody>{rows.map((member) => <tr key={member.id}><td><strong>{member.name.replace(" (demo)", "")}</strong><small>{member.suburb} {member.postcode}</small></td><td>{member.primaryNeed}</td><td>{member.activities.at(-1)?.summary || "New connection — first response needed"}</td><td>{formatDate(member.nextCheckInAt)}</td><td>{member.supportLevel === "urgent" ? "Urgent need" : member.caseStatus === "follow_up" ? "Follow-up due" : member.caseStatus === "closed" ? "Outcome review" : "Ongoing support"}</td><td><span className={`program-status program-status-${member.supportLevel}`}>{member.caseStatus.replace("_", " ")}</span></td></tr>)}</tbody></table></div>
    </section>
    <p className="dashboard-demo-boundary">Fictional demonstration members. Program notes and activity require secure staff permissions before production use.</p>
  </div>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
}
