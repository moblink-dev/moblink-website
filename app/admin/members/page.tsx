"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMembers,
  recordMemberCheckIn,
  type IraacProgram,
  type Member,
  type MemberContactMethod,
  type MemberSupportLevel,
} from "../../../lib/members";

const programs: Array<IraacProgram | "all"> = ["all", "MCC", "YouthScape", "The Crew", "DARC"];
const DEMO_REPORT_DATE = new Date("2026-08-16T23:59:59.999Z");
const supportLabels: Record<MemberSupportLevel, string> = {
  routine: "Routine",
  elevated: "Elevated",
  high: "High",
  urgent: "Urgent",
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState<IraacProgram | "all">("all");
  const [support, setSupport] = useState<MemberSupportLevel | "all">("all");
  const [contactMethod, setContactMethod] = useState<MemberContactMethod>("phone");
  const [checkInSummary, setCheckInSummary] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loaded = getMembers();
    setMembers(loaded);
    setSelectedId(loaded[0]?.id || "");
  }, []);

  const summary = useMemo(() => ({
    active: members.filter((member) => member.caseStatus !== "closed").length,
    due: members.filter((member) => member.caseStatus !== "closed" && new Date(member.nextCheckInAt) <= DEMO_REPORT_DATE).length,
    highPriority: members.filter((member) => member.supportLevel === "high" || member.supportLevel === "urgent").length,
  }), [members]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !query || [member.name, member.suburb, member.postcode, member.primaryNeed, member.phoneMasked]
        .some((value) => value.toLowerCase().includes(query));
      const matchesProgram = program === "all" || member.programs.includes(program);
      const matchesSupport = support === "all" || member.supportLevel === support;
      return matchesSearch && matchesProgram && matchesSupport;
    });
  }, [members, program, search, support]);

  const selected = filtered.find((member) => member.id === selectedId) || filtered[0];

  const handleCheckIn = () => {
    if (!selected) return;
    const updated = recordMemberCheckIn(selected.id, contactMethod, checkInSummary);
    if (!updated) {
      setMessage("A check-in needs recorded contact permission and a short summary.");
      return;
    }
    setMembers((current) => current.map((member) => member.id === updated.id ? updated : member));
    setCheckInSummary("");
    setMessage("Demonstration check-in saved to this member record. No call or message was sent.");
  };

  return (
    <div className="admin-page-content">
      <div className="admin-top">
        <div><p className="admin-kicker">IRAAC provider portal</p><h1>Members</h1><p className="admin-page-lead">A community CRM for people connected with IRAAC programs, support requests and follow-up.</p></div>
        <div className="admin-stat-badge">{summary.active} active</div>
      </div>

      <div className="prototype-note member-boundary"><strong>Fictional demonstration population.</strong> Names and mobile numbers are masked demo records. Production use requires authenticated staff, role-based access, consent history and secure case records.</div>

      <div className="admin-summary-cards member-summary-cards">
        <div className="admin-mini-card"><div className="admin-mini-stat">{members.length}</div><div className="admin-mini-label">Total members</div></div>
        <div className="admin-mini-card"><div className="admin-mini-stat">{summary.active}</div><div className="admin-mini-label">Active members</div></div>
        <div className="admin-mini-card"><div className="admin-mini-stat">{summary.due}</div><div className="admin-mini-label">Check-ins due</div></div>
        <div className="admin-mini-card"><div className="admin-mini-stat">{summary.highPriority}</div><div className="admin-mini-label">High or urgent</div></div>
      </div>

      <div className="member-filters" aria-label="Filter members">
        <label><span>Search members</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, suburb, postcode or need" /></label>
        <label><span>Program</span><select value={program} onChange={(event) => setProgram(event.target.value as IraacProgram | "all")}>{programs.map((item) => <option value={item} key={item}>{item === "all" ? "All programs" : item}</option>)}</select></label>
        <label><span>Support level</span><select value={support} onChange={(event) => setSupport(event.target.value as MemberSupportLevel | "all")}><option value="all">All levels</option>{Object.entries(supportLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>

      <div className="member-crm-layout">
        <section className="member-list-panel" aria-label="IRAAC member list">
          <div className="member-list-heading"><div><h2>Community members</h2><span>{filtered.length} shown</span></div></div>
          <div className="member-list">
            {filtered.length ? filtered.map((member) => (
              <button type="button" className={selected?.id === member.id ? "member-list-row selected" : "member-list-row"} onClick={() => { setSelectedId(member.id); setMessage(""); }} key={member.id}>
                <span className="member-list-person"><strong>{member.name}</strong><small>{member.phoneMasked} · {member.suburb}</small></span>
                <span className={`member-priority member-priority-${member.supportLevel}`}>{supportLabels[member.supportLevel]}</span>
                <span className="member-programs">{member.programs.join(" · ")}</span>
                <span className="member-next">Next check-in<br /><b>{formatDate(member.nextCheckInAt)}</b></span>
              </button>
            )) : <div className="admin-empty"><p>No members match these filters.</p></div>}
          </div>
        </section>

        <aside className="member-detail-panel" aria-label="Selected member details">
          {selected ? <>
            <div className="member-detail-head"><div><p className="admin-kicker">Member profile</p><h2>{selected.name}</h2><span>{selected.phoneMasked} · {selected.suburb} {selected.postcode}</span></div><span className={`member-priority member-priority-${selected.supportLevel}`}>{supportLabels[selected.supportLevel]}</span></div>
            <dl className="member-detail-grid">
              <div><dt>Programs</dt><dd>{selected.programs.join(", ")}</dd></div>
              <div><dt>Primary need</dt><dd>{selected.primaryNeed}</dd></div>
              <div><dt>Assigned team</dt><dd>{selected.assignedTo}</dd></div>
              <div><dt>Contact preference</dt><dd>{selected.preferredContact.replace("_", " ")}</dd></div>
              <div><dt>Contact permission</dt><dd>{selected.consentToContact ? "Recorded" : "Not recorded"}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(selected.joinedAt)}</dd></div>
            </dl>
            {selected.satisfactionRating ? <div className="member-feedback"><span aria-label={`${selected.satisfactionRating} out of 5 stars`}>{"★".repeat(selected.satisfactionRating)}{"☆".repeat(5 - selected.satisfactionRating)}</span><p>{selected.feedback}</p></div> : null}
            <div className="member-check-in"><h3>Record a check-in</h3><label>Contact method<select value={contactMethod} onChange={(event) => setContactMethod(event.target.value as MemberContactMethod)}><option value="phone">Staff phone call</option><option value="sms">Text message</option><option value="in_app">MobLink chat</option><option value="ai_call">AI-assisted call</option><option value="office">Office visit</option></select></label><label>Summary<textarea rows={3} value={checkInSummary} onChange={(event) => setCheckInSummary(event.target.value)} placeholder="What was discussed and what happens next?" /></label><button className="admin-button" type="button" disabled={!selected.consentToContact || !checkInSummary.trim()} onClick={handleCheckIn}>Save demonstration check-in</button>{message ? <p className="member-check-in-message" role="status">{message}</p> : null}</div>
            <div className="member-activity"><h3>Recent activity</h3>{selected.activities.slice(-4).reverse().map((activity) => <div key={activity.id}><span>{activity.type.replace("_", " ")} · {formatDate(activity.date)}</span><p>{activity.summary}</p></div>)}</div>
          </> : <div className="admin-empty"><p>Select a member to view their profile.</p></div>}
        </aside>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
