"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  addReferralMessage,
  getIraacReferralById,
  preferredContactLabels,
  referralSourceLabels,
  referralStatusLabels,
  scheduleAICall,
  supplierNotificationLabels,
  updateReferralStatus,
  type AICallPurpose,
  type Referral,
  type ReferralStatus,
} from "../../../../lib/referrals";

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [referral, setReferral] = useState<Referral>();
  const [message, setMessage] = useState("");
  const [callStatus, setCallStatus] = useState("");

  useEffect(() => setReferral(getIraacReferralById(id)), [id]);

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const updated = addReferralMessage(id, {
      sender: "provider",
      senderName: referral?.serviceName || "Service provider",
      body: message,
    });
    if (updated) setReferral(updated);
    setMessage("");
  };

  const queueCall = (purpose: AICallPurpose) => {
    const result = scheduleAICall(id, purpose);
    if (result.referral) setReferral(result.referral);
    setCallStatus(result.status === "queued" ? "Demonstration call queued and recorded below." : result.reason || "The call could not be queued.");
  };

  if (!referral) {
    return <div className="admin-page-content"><div className="admin-empty"><p>This lead is not available in this browser session.</p><Link href="/admin/referrals">Back to leads</Link></div></div>;
  }

  return (
    <div className="admin-page-content">
      <div className="admin-top">
        <div><p className="admin-kicker">IRAAC matched lead</p><h1>{referral.needCategory}</h1></div>
        <Link className="admin-small-btn" href="/admin/referrals">← All leads</Link>
      </div>

      <div className="lead-detail-grid">
        <aside className="lead-profile-card">
          <div className="lead-profile-person"><span>{referral.requesterName.slice(0, 1)}</span><div><strong>{referral.requesterName}</strong><small>{referral.requesterPhone}</small></div></div>
          <dl>
            <div><dt>Need</dt><dd>{referral.message}</dd></div>
            <div><dt>Location</dt><dd>Postcode {referral.postcode || "not supplied"}</dd></div>
            <div><dt>Source</dt><dd>{referralSourceLabels[referral.source]}</dd></div>
            <div><dt>Follow-up</dt><dd>{preferredContactLabels[referral.preferredContact]}</dd></div>
            <div><dt>Consent</dt><dd>{referral.consentToFollowUp ? "Confirmed for this request" : "Not confirmed"}</dd></div>
            <div><dt>AI voice-call consent</dt><dd>{referral.consentToAICall ? "Recorded for this demo lead" : "Not recorded"}</dd></div>
            <div><dt>Supplier alert</dt><dd>{supplierNotificationLabels[referral.supplierNotification]}</dd></div>
          </dl>
          <label className="lead-status-control">Lead status<select value={referral.status} onChange={(event) => setReferral(updateReferralStatus(id, event.target.value as ReferralStatus))}>{Object.entries(referralStatusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <div className="lead-ai-actions"><p className="admin-kicker">MobLink AI phone assistant</p><h2>Ask MobLink to call on IRAAC&apos;s behalf</h2><button type="button" className="admin-button" disabled={!referral.consentToFollowUp || !referral.consentToAICall} onClick={() => queueCall("check_in")}>AI call: quick check-in</button><button type="button" className="admin-small-btn" disabled={!referral.consentToFollowUp || !referral.consentToAICall} onClick={() => queueCall("needs")}>AI call: learn more</button>{callStatus ? <p className="lead-call-status" role="status">{callStatus}</p> : null}<small>No real call is placed in this prototype. A production call requires separately recorded AI voice-call consent and an approved script.</small></div>
          <p className="intake-boundary">Only use these details for the support request the person agreed to.</p>
        </aside>

        <section className="lead-chat-card">
          <div className="lead-chat-head"><div><p className="admin-kicker">Connected conversation</p><h2>{referral.serviceName}</h2></div><span className="online-dot">Shared</span></div>
          <div className="lead-chat-thread">
            {referral.conversation.map((item) => (
              <div className={`lead-message lead-message-${item.sender}`} key={item.id}>
                <strong>{item.senderName}</strong><p>{item.body}</p><time>{new Date(item.createdAt).toLocaleString()}</time>
              </div>
            ))}
          </div>
          <form className="lead-composer" onSubmit={sendMessage}>
            <label htmlFor="provider-message">Reply to the community member</label>
            <div><input id="provider-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a clear, respectful update..." /><button className="admin-button" type="submit" disabled={!message.trim()}>Send</button></div>
          </form>
        </section>
      </div>
    </div>
  );
}
