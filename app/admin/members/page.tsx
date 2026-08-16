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
import { getIraacReferrals, scheduleAICall, type Referral } from "../../../lib/referrals";

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
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState<IraacProgram | "all">("all");
  const [support, setSupport] = useState<MemberSupportLevel | "all">("all");
  const [contactMethod, setContactMethod] = useState<MemberContactMethod>("phone");
  const [checkInSummary, setCheckInSummary] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<MemberContactMethod>("in_app");
  const [outboundMessage, setOutboundMessage] = useState("");
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded = getMembers();
    setMembers(loaded);
    setReferrals(getIraacReferrals());
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
  const selectedReferral = selected ? referrals.find((referral) => normalizeName(referral.requesterName) === normalizeName(selected.name)) : undefined;
  const selectedStage = selected ? (stageOverrides[selected.id] || lifecycleFor(selected, selectedReferral)) : "new";

  const lifecycleCounts = useMemo(() => {
    return members.reduce<Record<string, number>>((counts, member) => {
      const referral = referrals.find((item) => normalizeName(item.requesterName) === normalizeName(member.name));
      const stage = stageOverrides[member.id] || lifecycleFor(member, referral);
      counts[stage] = (counts[stage] || 0) + 1;
      return counts;
    }, {});
  }, [members, referrals, stageOverrides]);

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

  const handleMessage = () => {
    if (!selected || !outboundMessage.trim()) return;
    const updated = recordMemberCheckIn(selected.id, channel, outboundMessage);
    if (!updated) {
      setMessage("This person has not given permission for that contact.");
      return;
    }
    setMembers((current) => current.map((member) => member.id === updated.id ? updated : member));
    setOutboundMessage("");
    setMessage(`Demonstration ${contactLabel(channel)} saved to the timeline. Nothing was sent.`);
  };

  const handleAiCall = () => {
    if (!selectedReferral) {
      setMessage("Create a support request before scheduling an AI-assisted call.");
      return;
    }
    const result = scheduleAICall(selectedReferral.id, "check_in");
    if (result.referral) setReferrals((current) => current.map((item) => item.id === result.referral?.id ? result.referral : item));
    setMessage(result.status === "queued" ? "Demonstration AI check-in added. No phone call was placed." : result.reason || "The check-in could not be added.");
  };

  return (
    <div className="admin-page-content crm-page">
      <div className="crm-command-head">
        <div><p className="admin-kicker">IRAAC · AI-assisted case management</p><h1>AI CRM</h1><p>Leads, members, messages and next actions in one workspace.</p></div>
        <div className="crm-head-actions"><span><b>{summary.due}</b> tasks due</span></div>
      </div>

      <div className="crm-demo-line"><strong>Demo records</strong><span>Masked details · contact permission stays visible on each record</span></div>

      <section className="crm-overview-strip" aria-label="Community support overview">
        <div className="crm-key-metrics"><div><strong>{members.length}</strong><span>People</span></div><div><strong>{summary.active}</strong><span>Active</span></div><div><strong>{summary.due}</strong><span>Due</span></div><div><strong>{summary.highPriority}</strong><span>Priority</span></div></div>
        <div className="crm-pipeline">{lifecycleStages.map((stage) => <div key={stage.value}><strong>{lifecycleCounts[stage.value] || 0}</strong><span>{stage.label}</span></div>)}</div>
      </section>

      <div className="member-filters" aria-label="Filter members">
        <label><span>Search members</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, suburb, postcode or need" /></label>
        <label><span>Program</span><select value={program} onChange={(event) => setProgram(event.target.value as IraacProgram | "all")}>{programs.map((item) => <option value={item} key={item}>{item === "all" ? "All programs" : item}</option>)}</select></label>
        <label><span>Support level</span><select value={support} onChange={(event) => setSupport(event.target.value as MemberSupportLevel | "all")}><option value="all">All levels</option>{Object.entries(supportLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </div>

      <div className="member-crm-layout">
        <section className="member-list-panel" aria-label="IRAAC member list">
          <div className="member-list-heading"><div><h2>People</h2><span>{filtered.length} shown</span></div></div>
          <div className="member-list">
            {filtered.length ? filtered.map((member) => (
              <button type="button" className={selected?.id === member.id ? "member-list-row selected" : "member-list-row"} onClick={() => { setSelectedId(member.id); setMessage(""); }} key={member.id}>
                <span className="member-list-person"><strong>{member.name}</strong><small>{member.phoneMasked} · {member.suburb}</small></span>
                <span className={`member-priority member-priority-${member.supportLevel}`}>{supportLabels[member.supportLevel]}</span>
                <span className="member-programs">{member.programs.join(" · ")}</span>
                <span className="crm-stage-label">{lifecycleStages.find((stage) => stage.value === (stageOverrides[member.id] || lifecycleFor(member, referrals.find((item) => normalizeName(item.requesterName) === normalizeName(member.name)))) )?.label}</span>
                <span className="member-next">Next check-in<br /><b>{formatDate(member.nextCheckInAt)}</b></span>
              </button>
            )) : <div className="admin-empty"><p>No members match these filters.</p></div>}
          </div>
        </section>

        <aside className="member-detail-panel" aria-label="Selected member details">
          {selected ? <>
            <div className="member-detail-head"><div><p className="admin-kicker">Member profile</p><h2>{selected.name}</h2><span>{selected.phoneMasked} · {selected.suburb} {selected.postcode}</span></div><span className={`member-priority member-priority-${selected.supportLevel}`}>{supportLabels[selected.supportLevel]}</span></div>
            <label className="crm-stage-control">Support stage<select value={selectedStage} onChange={(event) => setStageOverrides((current) => ({ ...current, [selected.id]: event.target.value }))}>{lifecycleStages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label>
            <dl className="member-detail-grid">
              <div><dt>Programs</dt><dd>{selected.programs.join(", ")}</dd></div>
              <div><dt>Primary need</dt><dd>{selected.primaryNeed}</dd></div>
              <div><dt>Assigned team</dt><dd>{selected.assignedTo}</dd></div>
              <div><dt>Contact preference</dt><dd>{selected.preferredContact.replace("_", " ")}</dd></div>
              <div><dt>Contact permission</dt><dd>{selected.consentToContact ? "Recorded" : "Not recorded"}</dd></div>
              <div><dt>Member since</dt><dd>{formatDate(selected.joinedAt)}</dd></div>
              <div><dt>Linked request</dt><dd>{selectedReferral ? selectedReferral.needCategory : "No open lead"}</dd></div>
              <div><dt>AI call permission</dt><dd>{selectedReferral?.consentToAICall ? "Recorded for this request" : "Not recorded"}</dd></div>
            </dl>
            {selected.satisfactionRating ? <div className="member-feedback"><span aria-label={`${selected.satisfactionRating} out of 5 stars`}>{"★".repeat(selected.satisfactionRating)}{"☆".repeat(5 - selected.satisfactionRating)}</span><p>{selected.feedback}</p></div> : null}
            <div className="crm-actions-grid">
              <div className="member-check-in"><h3>Message {selected.name.replace(" (demo)", "")}</h3><label>Channel<select value={channel} onChange={(event) => setChannel(event.target.value as MemberContactMethod)}><option value="in_app">MobLink app</option><option value="sms">SMS</option><option value="email">Email</option></select></label><label>Message<textarea rows={3} value={outboundMessage} onChange={(event) => setOutboundMessage(event.target.value)} placeholder="Write a clear, respectful update..." /></label><button className="admin-button" type="button" disabled={!selected.consentToContact || !outboundMessage.trim()} onClick={handleMessage}>Save demo message</button></div>
              <div className="member-check-in"><h3>Schedule a check-in</h3><label>Contact method<select value={contactMethod} onChange={(event) => setContactMethod(event.target.value as MemberContactMethod)}><option value="phone">Staff phone call</option><option value="sms">Text message</option><option value="in_app">MobLink chat</option><option value="ai_call">AI-assisted call</option><option value="office">Office visit</option></select></label><label>Summary<textarea rows={3} value={checkInSummary} onChange={(event) => setCheckInSummary(event.target.value)} placeholder="What should happen next?" /></label><div className="crm-action-buttons"><button className="admin-button" type="button" disabled={!selected.consentToContact || !checkInSummary.trim()} onClick={handleCheckIn}>Save check-in</button><button className="admin-small-btn" type="button" disabled={!selectedReferral?.consentToAICall} onClick={handleAiCall}>AI call check-in</button></div></div>
            </div>
            <div className="crm-survey-card"><div><span className="admin-kicker">Service feedback</span><h3>{selected.satisfactionRating ? "Survey completed" : "One survey due"}</h3><p>{selected.satisfactionRating ? selected.feedback : `Ask how ${selected.programs[0]} support is going and what IRAAC could do better.`}</p></div><strong>{selected.satisfactionRating ? `${selected.satisfactionRating}/5` : "Due"}</strong></div>
            {message ? <p className="member-check-in-message" role="status">{message}</p> : null}
            <div className="member-activity"><h3>Recent activity</h3>{selected.activities.slice(-4).reverse().map((activity) => <div key={activity.id}><span>{activity.type.replace("_", " ")} · {formatDate(activity.date)}</span><p>{activity.summary}</p></div>)}</div>
          </> : <div className="admin-empty"><p>Select a member to view their profile.</p></div>}
        </aside>
      </div>
    </div>
  );
}

const lifecycleStages = [
  { value: "new", label: "New request" }, { value: "contacted", label: "Contacted" },
  { value: "support_plan", label: "Support plan" }, { value: "connected", label: "Connected" },
  { value: "member", label: "Active member" }, { value: "follow_up", label: "Follow-up" },
  { value: "completed", label: "Completed" },
];

function lifecycleFor(member: Member, referral?: Referral): string {
  if (member.caseStatus === "closed") return "completed";
  if (member.caseStatus === "follow_up") return "follow_up";
  if (member.caseStatus === "stable") return "member";
  if (referral?.status === "requested") return "new";
  if (referral?.status === "triage") return "contacted";
  if (referral?.outcome === "connected") return "connected";
  return "member";
}

function normalizeName(value: string): string { return value.replace(/\s*\(demo\)\s*/i, "").trim().toLowerCase(); }
function contactLabel(method: MemberContactMethod): string { return method === "in_app" ? "MobLink message" : method === "sms" ? "SMS" : method === "email" ? "email" : "contact note"; }

function formatDate(value: string): string {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
