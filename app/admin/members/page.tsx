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
  const [stage, setStage] = useState("all");
  const [channel, setChannel] = useState<MemberContactMethod>("in_app");
  const [outboundMessage, setOutboundMessage] = useState("");
  const [contactMethod, setContactMethod] = useState<MemberContactMethod>("phone");
  const [checkInSummary, setCheckInSummary] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});
  const [autoCheckIns, setAutoCheckIns] = useState<Record<string, boolean>>({ member_jayden: true, member_tahlia: true, member_sam: true });
  const [recordDrafts, setRecordDrafts] = useState<Record<string, string>>({});

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
      const referral = referrals.find((item) => normalizeName(item.requesterName) === normalizeName(member.name));
      return matchesSearch && (program === "all" || member.programs.includes(program)) && (support === "all" || member.supportLevel === support) && (stage === "all" || (stageOverrides[member.id] || lifecycleFor(member, referral)) === stage);
    }).sort((a, b) => responsePriority(a) - responsePriority(b));
  }, [members, program, referrals, search, stage, stageOverrides, support]);

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
      <div><p className="admin-kicker">IRAAC community support</p><h1>Members</h1><p>Messages, history and next actions in one respectful conversation.</p></div>
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
            <select aria-label="Filter by member stage" value={stage} onChange={(event) => setStage(event.target.value)}><option value="all">All stages</option>{lifecycleStages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          </div>
        </div>
        <div className="crm-person-list">
          {filtered.map((member) => {
            const last = member.activities.at(-1);
            const response = responseStatus(member);
            return <button type="button" key={member.id} className={selected?.id === member.id ? "crm-person-row active" : "crm-person-row"} onClick={() => selectMember(member)} onDoubleClick={() => selectMember(member, true)}>
              <span className="crm-person-avatar">{initials(member.name)}</span>
              <span className="crm-person-copy"><span><strong>{member.name.replace(" (demo)", "")}</strong><time className={response.urgent ? "needs-response" : ""}>{response.label}</time></span><small>{last?.summary || member.primaryNeed}</small><em>{member.programs[0]} · {member.suburb}</em></span>
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
            <span><b>Assigned</b> {selected.assignedTo}</span><span><b>Stage</b> {lifecycleStages.find((stage) => stage.value === selectedStage)?.label}</span><span><b>Response</b> {responseStatus(selected).label}</span>
            <label><input type="checkbox" checked={Boolean(autoCheckIns[selected.id])} onChange={(event) => setAutoCheckIns((current) => ({ ...current, [selected.id]: event.target.checked }))} /> Monthly AI check-in{autoCheckIns[selected.id] ? ` · next ${nextMonthlyCheckIn(selected)}` : ""}</label>
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

      {detailsOpen && selected ? <aside className="crm-record-drawer crm-record-workspace" aria-label="Selected member details">
        <header><div><p className="admin-kicker">Member record</p><h2>{selected.name.replace(" (demo)", "")}</h2></div><button type="button" aria-label="Close member details" onClick={() => setDetailsOpen(false)}>×</button></header>
        <div className="crm-record-layout"><section>
          <div className="crm-record-controls"><label>Support stage<select value={selectedStage} onChange={(event) => setStageOverrides((current) => ({ ...current, [selected.id]: event.target.value }))}>{lifecycleStages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Support level<select value={selected.supportLevel} disabled><option>{supportLabels[selected.supportLevel]}</option></select></label><label>Preferred contact<select value={selected.preferredContact} disabled><option>{selected.preferredContact.replace("_", " ")}</option></select></label></div>
          <dl className="crm-record-facts"><div><dt>Primary need</dt><dd>{selected.primaryNeed}</dd></div><div><dt>Programs</dt><dd>{selected.programs.join(", ")}</dd></div><div><dt>Member since</dt><dd>{formatDate(selected.joinedAt)}</dd></div><div><dt>Next check-in</dt><dd>{autoCheckIns[selected.id] ? nextMonthlyCheckIn(selected) : formatDate(selected.nextCheckInAt)}</dd></div><div><dt>Last contact</dt><dd>{formatDateTime(selected.lastContactAt)}</dd></div><div><dt>Assigned team</dt><dd>{selected.assignedTo}</dd></div><div><dt>Contact permission</dt><dd>{selected.consentToContact ? "Recorded" : "Not recorded"}</dd></div><div><dt>AI call permission</dt><dd>{selectedReferral?.consentToAICall ? "Recorded for linked request" : "Not recorded"}</dd></div></dl>
          <div className="crm-wellbeing-grid"><EditableArea label="Living situation" value={recordDrafts[`${selected.id}_living`] || "Staying with family; confirm current address at next contact."} onChange={(value) => setRecordDrafts((current) => ({ ...current, [`${selected.id}_living`]: value }))} /><EditableArea label="Health and wellbeing" value={recordDrafts[`${selected.id}_health`] || "No clinical assessment recorded. Ask what support feels safe and useful."} onChange={(value) => setRecordDrafts((current) => ({ ...current, [`${selected.id}_health`]: value }))} /><EditableArea label="Financial and practical" value={recordDrafts[`${selected.id}_finance`] || "Transport and service costs to be checked; no financial assessment recorded."} onChange={(value) => setRecordDrafts((current) => ({ ...current, [`${selected.id}_finance`]: value }))} /><EditableArea label="Safety and relationships" value={recordDrafts[`${selected.id}_safety`] || "Confirm privately at each contact; escalate only under IRAAC’s approved safeguarding process."} onChange={(value) => setRecordDrafts((current) => ({ ...current, [`${selected.id}_safety`]: value }))} /></div>
          <EditableArea label="Address and contact updates" value={recordDrafts[`${selected.id}_address`] || `${selected.suburb} ${selected.postcode} · ${selected.phoneMasked}`} onChange={(value) => setRecordDrafts((current) => ({ ...current, [`${selected.id}_address`]: value }))} />
        </section><section className="crm-record-timeline"><h3>Complete contact history</h3>{conversationFor(selected).map((item) => <article key={`record_${item.id}`}><span>{item.date} · {item.channel}</span><p>{item.body}</p></article>)}{selected.activities.map((activity) => <article key={`record_${activity.id}`}><span>{formatDateTime(activity.date)} · {contactLabel(activity.type)}</span><p>{activity.summary}</p></article>)}<h3>Programs, visits and linked support</h3><p>{selected.programs.join(", ")} · No office visit or event attendance has been confirmed in this demonstration record.</p><p>Linked MobLink services and family accounts require explicit permission before they appear here.</p></section></div>
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
  const monthly = monthlyCheckInConversation(member);
  return [
    { id: `${member.id}_1`, side: "member", channel: "MobLink app", body: `Hi, I’m looking for help with ${member.primaryNeed.toLowerCase()}.`, date: "14 Aug · 9:18 am" },
    { id: `${member.id}_2`, side: "moblink", channel: "MobLink assistant", body: `Thanks ${firstName}. IRAAC’s ${member.programs[0]} team may be able to help. Would you like me to connect you?`, date: "14 Aug · 9:19 am" },
    { id: `${member.id}_3`, side: "member", channel: "MobLink app", body: "Yes please. A message in the app is easiest for me.", date: "14 Aug · 9:21 am" },
    { id: `${member.id}_4`, side: "system", channel: "Connection created", body: `Shared conversation opened with ${member.assignedTo}.`, date: "14 Aug · 9:21 am" },
    ...monthly,
  ];
}

function monthlyCheckInConversation(member: Member) {
  const firstName = member.name.replace(" (demo)", "").split(" ")[0];
  const samples: Record<string, Array<{ id: string; side: string; channel: string; body: string; date: string }>> = {
    member_jayden: [
      { id: "jayden_call_1", side: "moblink", channel: "AI phone check-in · transcript", body: `Hi ${firstName}, MobLink is checking in on behalf of IRAAC. You’re connected with YouthScape for legal support and a safe pathway. How is it going, has it helped, and do you need anything else?`, date: "16 Aug · 10:02 am" },
      { id: "jayden_call_2", side: "member", channel: "AI phone check-in · transcript", body: "It helped me understand the next court step. I still need help arranging transport, but I know who to call now.", date: "16 Aug · 10:03 am" },
      { id: "jayden_call_3", side: "system", channel: "Check-in outcome", body: "Experience: 5/5 · Legal question clearer: yes · Unmet need: transport · IRAAC follow-up created.", date: "16 Aug · 10:04 am" },
    ],
    member_corey: [
      { id: "corey_call_1", side: "moblink", channel: "AI phone check-in · transcript", body: "MobLink checked in for IRAAC about The Crew. Corey said the practical sessions are helping, rated the experience 4/5, and asked for the next workshop date.", date: "16 Aug · 11:20 am" },
    ],
    member_kylie: [
      { id: "kylie_call_1", side: "moblink", channel: "AI phone check-in · transcript", body: "MobLink checked in for IRAAC about DARC family coordination. Kylie rated support 5/5 and said the main issue is resolved, but would like a monthly message so nothing slips.", date: "12 Aug · 9:20 am" },
    ],
  };
  return samples[member.id] || [];
}

function responseStatus(member: Member) {
  const labels: Record<string, { label: string; urgent: boolean; rank: number }> = {
    member_corey: { label: "Needs response", urgent: true, rank: 0 }, member_sam: { label: "2h waiting", urgent: true, rank: 1 }, member_jayden: { label: "1 day waiting", urgent: true, rank: 2 }, member_tahlia: { label: "2 days waiting", urgent: true, rank: 3 },
  };
  return labels[member.id] || { label: shortDate(member.lastContactAt), urgent: false, rank: 100 - (new Date(member.lastContactAt || 0).getTime() / 1_000_000_000_000) };
}
function responsePriority(member: Member) { return responseStatus(member).rank; }
function nextMonthlyCheckIn(member: Member) { const base = new Date(member.lastContactAt || member.joinedAt); base.setUTCMonth(base.getUTCMonth() + 1); return base.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" }); }
function EditableArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="crm-editable-area">{label}<textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }

function normalizeName(value: string) { return value.replace(/\s*\(demo\)\s*/i, "").trim().toLowerCase(); }
function initials(value: string) { return value.replace(" (demo)", "").split(" ").map((part) => part[0]).slice(0, 2).join(""); }
function contactLabel(method: MemberContactMethod) { return method === "in_app" ? "MobLink app" : method === "sms" ? "SMS" : method === "email" ? "Email" : method === "ai_call" ? "AI call" : method === "office" ? "Office visit" : "Phone"; }
function formatDate(value: string) { return value ? new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "Not recorded"; }
function formatDateTime(value: string) { return value ? new Date(value).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "Not recorded"; }
function shortDate(value: string) { return value ? new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "New"; }
