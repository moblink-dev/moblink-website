"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getIraacReferrals, scheduleAICall, updateReferralStatus, referralSourceLabels, referralStatusLabels, referralStatusColors, type AICallPurpose, type Referral, type ReferralStatus } from "../../../lib/referrals";

type DemoBatchCall = { id: string; maskedNumber: string; status: "queued"; createdAt: string };
const BATCH_QUEUE_KEY = "moblink_iraac_demo_batch_calls";

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filter, setFilter] = useState<ReferralStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [batchNumbers, setBatchNumbers] = useState("");
  const [batchConsent, setBatchConsent] = useState(false);
  const [batchQueued, setBatchQueued] = useState(0);
  const [batchRejected, setBatchRejected] = useState(0);
  const [batchQueue, setBatchQueue] = useState<DemoBatchCall[]>([]);
  const [callMessage, setCallMessage] = useState("");

  useEffect(() => {
    setReferrals(getIraacReferrals());
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(BATCH_QUEUE_KEY) || "[]");
      if (Array.isArray(parsed)) setBatchQueue(parsed.filter((item): item is DemoBatchCall => Boolean(item && typeof item === "object" && "maskedNumber" in item)));
    } catch {
      setBatchQueue([]);
    }
  }, []);

  const { filtered, counts } = useMemo(() => {
    const statusCounts = { requested: 0, triage: 0, follow_up_due: 0, pending: 0 };
    const visible: Referral[] = [];
    for (const referral of referrals) {
      if (referral.status === "requested") statusCounts.requested += 1;
      if (referral.status === "triage") statusCounts.triage += 1;
      if (referral.status === "follow_up_due") statusCounts.follow_up_due += 1;
      if (referral.status === "requested" || referral.status === "triage") statusCounts.pending += 1;
      if (filter === "all" || referral.status === filter) visible.push(referral);
    }
    return { filtered: visible, counts: statusCounts };
  }, [filter, referrals]);

  const replaceReferral = (updated: Referral | undefined) => {
    if (!updated) return;
    setReferrals((current) => current.map((referral) => (referral.id === updated.id ? updated : referral)));
  };

  const handleStatusChange = (id: string, status: ReferralStatus) => {
    replaceReferral(updateReferralStatus(id, status));
  };

  const handleSaveNotes = (id: string) => {
    const r = referrals.find((ref) => ref.id === id);
    if (!r) return;
    replaceReferral(updateReferralStatus(id, r.status, editNotes));
    setExpanded(null);
  };

  const handleAICall = (id: string, purpose: AICallPurpose) => {
    const result = scheduleAICall(id, purpose);
    if (result.referral) replaceReferral(result.referral);
    setCallMessage(result.status === "queued" ? "Demonstration AI call added to the lead." : result.reason || "The call could not be queued.");
  };

  const handleBatchQueue = () => {
    const entries = batchNumbers.split(/[\n,]+/).map((number) => number.trim()).filter(Boolean);
    const numbers = entries.filter((number) => /^(?:\+?61|0)4[\d\s-]{7,}$/.test(number));
    const now = new Date().toISOString();
    const additions = numbers.map((number, index) => ({ id: `batch_${Date.now()}_${index}`, maskedNumber: `04•• ••• ${number.replace(/\D/g, "").slice(-3)}`, status: "queued" as const, createdAt: now }));
    const nextQueue = [...batchQueue, ...additions];
    setBatchQueue(nextQueue);
    localStorage.setItem(BATCH_QUEUE_KEY, JSON.stringify(nextQueue));
    setBatchQueued(additions.length);
    setBatchRejected(entries.length - numbers.length);
    setBatchNumbers("");
    setBatchConsent(false);
  };

  return (
    <div className="admin-page-content">
      <div className="admin-top">
        <div>
          <p className="admin-kicker">IRAAC provider demo</p>
          <h1>Leads &amp; AI calls</h1>
        </div>
        <div className="admin-stat-badge">
          {counts.pending} pending
        </div>
      </div>

      <div className="lead-call-workspace">
        <div><p className="admin-kicker">AI-assisted follow-up</p><h2>Call a lead to check in or learn more.</h2><p>From each consented lead, IRAAC can queue a MobLink AI call that introduces IRAAC, explains relevant services and places a summary back into the shared conversation.</p><p className="intake-boundary">Demonstration only: no phone call or text is sent. Real calling requires verified consent, secure records and an approved escalation process.</p></div>
        <div className="batch-call-panel"><label htmlFor="batch-numbers">Add several demo mobile numbers</label><textarea id="batch-numbers" rows={4} value={batchNumbers} onChange={(event) => { setBatchNumbers(event.target.value); setBatchQueued(0); setBatchRejected(0); }} placeholder={'0400 000 000\n0411 111 111'} /><label className="batch-consent"><input type="checkbox" checked={batchConsent} onChange={(event) => setBatchConsent(event.target.checked)} /><span>I have separately recorded AI voice-call permission for these demonstration numbers.</span></label><button type="button" className="admin-button" disabled={!batchConsent || !batchNumbers.trim()} onClick={handleBatchQueue}>Add to demo call queue</button>{batchQueued > 0 ? <strong className="batch-queued">{batchQueued} valid demo {batchQueued === 1 ? "number" : "numbers"} added to the queue.</strong> : null}{batchRejected > 0 ? <span className="batch-rejected">{batchRejected} invalid {batchRejected === 1 ? "entry was" : "entries were"} not added.</span> : null}{batchQueue.length > 0 ? <div className="batch-queue-list"><strong>Demo call queue</strong>{batchQueue.slice(-5).reverse().map((call) => <span key={call.id}>{call.maskedNumber}<b>{call.status}</b></span>)}</div> : null}</div>
      </div>

      {callMessage ? <div className="lead-created lead-call-message" role="status">{callMessage}</div> : null}

      <div className="admin-filter-row">
        <button
          type="button"
          className={`admin-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({referrals.length})
        </button>
        <button
          type="button"
          className={`admin-filter-btn ${filter === "requested" ? "active" : ""}`}
          onClick={() => setFilter("requested")}
        >
          New ({counts.requested})
        </button>
        <button
          type="button"
          className={`admin-filter-btn ${filter === "triage" ? "active" : ""}`}
          onClick={() => setFilter("triage")}
        >
          Triage ({counts.triage})
        </button>
        <button
          type="button"
          className={`admin-filter-btn ${filter === "follow_up_due" ? "active" : ""}`}
          onClick={() => setFilter("follow_up_due")}
        >
          Follow-up ({counts.follow_up_due})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty">
          <p>No referrals in this status.</p>
          <p className="admin-empty-hint">Referrals appear here when a community member requests help from a service.</p>
        </div>
      ) : (
        <div className="admin-referral-list">
          {filtered.map((referral) => (
            <div className={`admin-referral-card ${referral.status === "requested" ? "admin-referral-new" : ""}`} key={referral.id}>
              <div className="admin-referral-header">
                <div className="admin-referral-person">
                  <strong>{referral.requesterName}</strong>
                  <span className="admin-referral-phone">{referral.requesterPhone}</span>
                </div>
                <span
                  className="admin-status-pill"
                  style={{ background: referralStatusColors[referral.status], color: "#fff" }}
                >
                  {referralStatusLabels[referral.status]}
                </span>
              </div>

              <div className="admin-referral-body">
                <div className="admin-referral-detail">
                  <span className="admin-detail-label">Matched service</span>
                  <span>{referral.serviceName}</span>
                </div>
                <div className="admin-referral-detail">
                  <span className="admin-detail-label">Need</span>
                  <span>{referral.needCategory}</span>
                </div>
                <div className="admin-referral-detail">
                  <span className="admin-detail-label">Source</span>
                  <span>{referralSourceLabels[referral.source]} · {referral.postcode || "No postcode"}</span>
                </div>
                <div className="admin-referral-detail">
                  <span className="admin-detail-label">Consent to follow-up</span>
                  <span>{referral.consentToFollowUp ? "Yes" : "No"}</span>
                </div>
                <div className="admin-referral-detail"><span className="admin-detail-label">AI call consent</span><span>{referral.consentToAICall ? "Recorded" : "Not recorded"}</span></div>
                {referral.message && (
                  <div className="admin-referral-message">
                    <span className="admin-detail-label">Message</span>
                    <p>{referral.message}</p>
                  </div>
                )}
                <div className="admin-referral-detail">
                  <span className="admin-detail-label">Received</span>
                  <span>{new Date(referral.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="admin-referral-actions">
                <Link className="admin-small-btn admin-small-btn-primary" href={`/admin/referrals/${referral.id}`}>Open lead & chat</Link>
                <button type="button" className="admin-small-btn admin-call-btn" disabled={!referral.consentToFollowUp || !referral.consentToAICall} onClick={() => handleAICall(referral.id, "check_in")}>AI check-in</button>
                <button type="button" className="admin-small-btn admin-call-btn" disabled={!referral.consentToFollowUp || !referral.consentToAICall} onClick={() => handleAICall(referral.id, "needs")}>Learn more</button>
                <select
                  value={referral.status}
                  onChange={(e) => handleStatusChange(referral.id, e.target.value as ReferralStatus)}
                  className="admin-status-select"
                >
                  {Object.entries(referralStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="admin-small-btn"
                  onClick={() => {
                    setExpanded(expanded === referral.id ? null : referral.id);
                    setEditNotes(referral.staffNotes || "");
                  }}
                >
                  {expanded === referral.id ? "Cancel" : "Notes"}
                </button>
              </div>

              {expanded === referral.id && (
                <div className="admin-referral-notes">
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Staff notes (visible to staff only)..."
                    className="admin-notes-input"
                  />
                  <button type="button" className="admin-small-btn admin-small-btn-primary" onClick={() => handleSaveNotes(referral.id)}>
                    Save notes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
