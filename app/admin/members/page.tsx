"use client";

import { useEffect, useMemo, useState } from "react";
import { getMembers, recordMemberCheckIn, type IraacProgram, type Member, type MemberContactMethod, type MemberSupportLevel } from "../../../lib/members";
import { getIraacReferrals, scheduleAICall, type Referral } from "../../../lib/referrals";

const programs: Array<IraacProgram | "all"> = ["all", "MCC", "YouthScape", "The Crew", "DARC"];
const supportLabels: Record<MemberSupportLevel, string> = { routine: "Routine", elevated: "Elevated", high: "High", urgent: "Urgent" };

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState<IraacProgram | "all">("all");
  const [support, setSupport] = useState<MemberSupportLevel | "all">("all");
  const [channel, setChannel] = useState<MemberContactMethod>("in_app");
  const [outboundMessage, setOutboundMessage] = useState("");
  const [contactMethod, setContactMethod] = useState<MemberContactMethod>("phone");
  const [checkInSummary, setCheckInSummary] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});
  const [autoCheckIns, setAutoCheckIns] = useState<Record<string, boolean>>({ member_jayden: true, member_tahlia: true, member_sam: true });

  useEffect(() => {
    const loaded = getMembers();
    setMembers(loaded);
    setReferrals(getIraacReferrals());
    setSelectedId(loaded[0]?.id || "");
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !query || [member.name, member.suburb, member.postcode, member.primaryNeed, member.phoneMasked].some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (program === "all" || member.programs.includes(program)) && (support === "all" || member.supportLevel === support);
    });
  }, [members, program, search, support]);

  const selected = filtered.find((member) => member.id === selectedId) || filtered[0];
  const selectedReferral = selected ? referrals.find((referral) => normalizeName(referral.requesterName) === normalizeName(selected.name)) : undefined;
  const selectedStage = selected ? (stageOverrides[selected.id] || lifecycleFor(selected, selectedReferral)) : "new";
  const dueCount = members.filter((member) => member.caseStatus !== "closed" && new Date(member.nextCheckInAt) <= new Date("2026-08-16T23:59:59.999Z")).length;

  const selectMember = (member: Member, openDetails = false) => {
    setSelectedId(member.id);
    setStatusMessage("");
    if (openDetails) setDetailsOpen(true);
  };

  const handleMessage = () => {
    if (!selected || !outboundMessage.trim()) return;
    const updated = recordMemberCheckIn(selected.id, channel, outboundMessage);
    if (!updated) return setStatusMessage("This person has not given permission for that contact.");
    setMembers((current) => current.map((member) => member.id === updated.id ? updated : member));
    setOutboundMessage("");
    setStatusMessage(`Demo ${contactLabel(channel)} added to this conversation. Nothing was sent.`);
  };

  const handleCheckIn = () => {
    if (!selected) return;
    const updated = recordMemberCheckIn(selected.id, contactMethod, checkInSummary);
    if (!updated) return setStatusMessage("A check-in needs contact permission and a short note.");
    setMembers((current) => current.map((member) => member.id === updated.id ? updated : member));
    setCheckInSummary("");
    setStatusMessage("Demo check-in saved. No call or message was sent.");
  };

  const handleAiCall = () => {
    if (!selectedReferral) return setStatusMessage("This person needs a linked request before an AI-assisted call can be queued.");
    const result = scheduleAICall(selectedReferral.id, "check_in");
    if (result.referral) setReferrals((current) => current.map((item) => item.id === result.referral?.id ? result.referral : item));
    setStatusMessage(result.status === "queued" ? "Demo AI check-in queued. No phone call was placed." : result.reason || "The check-in could not be queued.");
  };

  return <div className="admin-page-content crm-page crm-inbox-page">
    <header className="crm-inbox-header">
      <div><p className="admin-kicker">IRAAC community support</p><h1>CRM</h1><p>Messages, history and next actions in one respectful conversation.</p></div>
      <div className="crm-inbox-summary"><span><b>{members.length}</b> people</span><span><b>{dueCount}</b> due</span><span><b>{members.filter((member) => member.supportLevel === "urgent" || member.supportLevel === "high").length}</b> priority</span></div>
    </header>

    <div className="crm-inbox-shell">
      <aside className="crm-people-pane" aria-label="IRAAC member list">
        <div className="crm-people-toolbar">
          <div><strong>People</strong><span>{filtered.length}</span></div>
          <input aria-label="Search people" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people or needs" />
          <div className="crm-compact-filters">
            <select aria-label="Filter by program" value={program} onChange={(event) => setProgram(event.target.value as IraacProgram | "all")}>{programs.map((item) => <option key={item} value={item}>{item === "all" ? "All programs" : item}</option>)}</select>
            <select aria-label="Filter by support level" value={support} onChange={(event) => setSupport(event.target.value as MemberSupportLevel | "all")}><option value="all">All levels</option>{Object.entries(supportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </div>
        </div>
        <div className="crm-person-list">
          {filtered.map((member) => {
            const last = member.activities.at(-1);
            return <button type="button" key={member.id} className={selected?.id === member.id ? "crm-person-row active" : "crm-person-row"} onClick={() => selectMember(member)} onDoubleClick={() => selectMember(member, true)}>
              <span className="crm-person-avatar">{initials(member.name)}</span>
              <span className="crm-person-copy"><span><strong>{member.name.replace(" (demo)", "")}</strong><time>{last ? shortDate(last.date) : "New"}</time></span><small>{last?.summary || member.primaryNeed}</small><em>{member.programs[0]} · {member.suburb}</em></span>
              {(member.supportLevel === "urgent" || member.supportLevel === "high") ? <i aria-label={`${supportLabels[member.supportLevel]} priority`} /> : null}
            </button>;
          })}
        </div>
      </aside>

      <section className="crm-conversation-pane" aria-label="Selected member conversation">
        {selected ? <>
          <header className="crm-conversation-head">
            <div className="crm-selected-person"><span className="crm-person-avatar">{initials(selected.name)}</span><div><h2>{selected.name.replace(" (demo)", "")}</h2><p>{selected.phoneMasked} · {selected.suburb} {selected.postcode} · {selected.programs.join(", ")}</p></div></div>
            <div className="crm-conversation-actions"><span className={`member-priority member-priority-${selected.supportLevel}`}>{supportLabels[selected.supportLevel]}</span><button type="button" onClick={() => setDetailsOpen(true)}>Member details</button></div>
          </header>

          <div className="crm-contact-bar">
            <span><b>Assigned</b> {selected.assignedTo}</span><span><b>Stage</b> {lifecycleStages.find((stage) => stage.value === selectedStage)?.label}</span>
            <label><input type="checkbox" checked={Boolean(autoCheckIns[selected.id])} onChange={(event) => setAutoCheckIns((current) => ({ ...current, [selected.id]: event.target.checked }))} /> AI auto check-in</label>
          </div>

          <div className="crm-message-feed">
            <p className="crm-date-divider">Shared MobLink history · demo</p>
            {conversationFor(selected).map((item) => <article key={item.id} className={`crm-message crm-message-${item.side}`}><span>{item.channel}</span><p>{item.body}</p><time>{item.date}</time></article>)}
            {selected.activities.map((activity) => <article key={activity.id} className="crm-message crm-message-staff"><span>{contactLabel(activity.type)}</span><p>{activity.summary}</p><time>{formatDateTime(activity.date)}</time></article>)}
            {statusMessage ? <p className="crm-status-message" role="status">{statusMessage}</p> : null}
          </div>

          <div className="crm-composer">
            <div className="crm-channel-row"><select aria-label="Reply channel" value={channel} onChange={(event) => setChannel(event.target.value as MemberContactMethod)}><option value="in_app">MobLink app</option><option value="sms">SMS</option><option value="email">Email</option></select><span>{selected.consentToContact ? "Contact permission recorded" : "No contact permission"}</span></div>
            <div className="crm-reply-row"><textarea rows={2} value={outboundMessage} onChange={(event) => setOutboundMessage(event.target.value)} placeholder={`Reply to ${selected.name.replace(" (demo)", "")}…`} /><button type="button" disabled={!selected.consentToContact || !outboundMessage.trim()} onClick={handleMessage}>Send demo reply</button></div>
          </div>
        </> : <div className="admin-empty"><p>No people match these filters.</p></div>}
      </section>

      {detailsOpen && selected ? <aside className="crm-record-drawer" aria-label="Selected member details">
        <header><div><p className="admin-kicker">Member record</p><h2>{selected.name.replace(" (demo)", "")}</h2></div><button type="button" aria-label="Close member details" onClick={() => setDetailsOpen(false)}>×</button></header>
        <label className="crm-stage-control">Support stage<select value={selectedStage} onChange={(event) => setStageOverrides((current) => ({ ...current, [selected.id]: event.target.value }))}>{lifecycleStages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label>
        <dl className="crm-record-facts"><div><dt>Primary need</dt><dd>{selected.primaryNeed}</dd></div><div><dt>Preferred contact</dt><dd>{selected.preferredContact.replace("_", " ")}</dd></div><div><dt>Member since</dt><dd>{formatDate(selected.joinedAt)}</dd></div><div><dt>Next check-in</dt><dd>{formatDate(selected.nextCheckInAt)}</dd></div><div><dt>Contact permission</dt><dd>{selected.consentToContact ? "Recorded" : "Not recorded"}</dd></div><div><dt>AI call permission</dt><dd>{selectedReferral?.consentToAICall ? "Recorded for linked request" : "Not recorded"}</dd></div></dl>
        <section className="crm-drawer-section"><h3>Schedule check-in</h3><select aria-label="Check-in method" value={contactMethod} onChange={(event) => setContactMethod(event.target.value as MemberContactMethod)}><option value="phone">Staff phone call</option><option value="sms">Text message</option><option value="in_app">MobLink chat</option><option value="office">Office visit</option></select><textarea rows={2} value={checkInSummary} onChange={(event) => setCheckInSummary(event.target.value)} placeholder="Next action or check-in note" /><div><button type="button" onClick={handleCheckIn} disabled={!checkInSummary.trim()}>Save note</button><button type="button" onClick={handleAiCall} disabled={!selectedReferral?.consentToAICall}>AI call</button></div></section>
        <section className="crm-feedback-compact"><span>{selected.satisfactionRating ? `${selected.satisfactionRating}/5` : "Due"}</span><div><strong>{selected.satisfactionRating ? "Latest service survey" : "Survey due"}</strong><p>{selected.feedback || `Ask how ${selected.programs[0]} support is going.`}</p></div></section>
        <p className="crm-demo-note">Fictional demonstration record. Production use requires secure staff access, consent history and protected case notes.</p>
      </aside> : null}
    </div>
  </div>;
}

const lifecycleStages = [{ value: "new", label: "New request" }, { value: "contacted", label: "Contacted" }, { value: "support_plan", label: "Support plan" }, { value: "connected", label: "Connected" }, { value: "member", label: "Active member" }, { value: "follow_up", label: "Follow-up" }, { value: "completed", label: "Completed" }];

function lifecycleFor(member: Member, referral?: Referral): string {
  if (member.caseStatus === "closed") return "completed";
  if (member.caseStatus === "follow_up") return "follow_up";
  if (member.caseStatus === "stable") return "member";
  if (referral?.status === "requested") return "new";
  if (referral?.status === "triage") return "contacted";
  if (referral?.outcome === "connected") return "connected";
  return "member";
}

function conversationFor(member: Member) {
  const firstName = member.name.replace(" (demo)", "").split(" ")[0];
  return [
    { id: `${member.id}_1`, side: "member", channel: "MobLink app", body: `Hi, I’m looking for help with ${member.primaryNeed.toLowerCase()}.`, date: "14 Aug · 9:18 am" },
    { id: `${member.id}_2`, side: "moblink", channel: "MobLink assistant", body: `Thanks ${firstName}. IRAAC’s ${member.programs[0]} team may be able to help. Would you like me to connect you?`, date: "14 Aug · 9:19 am" },
    { id: `${member.id}_3`, side: "member", channel: "MobLink app", body: "Yes please. A message in the app is easiest for me.", date: "14 Aug · 9:21 am" },
    { id: `${member.id}_4`, side: "system", channel: "Connection created", body: `Shared conversation opened with ${member.assignedTo}.`, date: "14 Aug · 9:21 am" },
  ];
}

function normalizeName(value: string) { return value.replace(/\s*\(demo\)\s*/i, "").trim().toLowerCase(); }
function initials(value: string) { return value.replace(" (demo)", "").split(" ").map((part) => part[0]).slice(0, 2).join(""); }
function contactLabel(method: MemberContactMethod) { return method === "in_app" ? "MobLink app" : method === "sms" ? "SMS" : method === "email" ? "Email" : method === "ai_call" ? "AI call" : method === "office" ? "Office visit" : "Phone"; }
function formatDate(value: string) { return value ? new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "Not recorded"; }
function formatDateTime(value: string) { return value ? new Date(value).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "Not recorded"; }
function shortDate(value: string) { return value ? new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "New"; }
