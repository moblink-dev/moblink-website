"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BottomNav from "../../../../components/app/BottomNav";
import { addReferralMessage, getDemoReferrals, getReferralById, type Referral } from "../../../../lib/referrals";

type Mode = "assistant" | "advisor";

const messageDateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Australia/Sydney",
});

export default function ConnectedServiceChatPage() {
  const { id } = useParams<{ id: string }>();
  const [referral, setReferral] = useState<Referral | undefined>(() => getDemoReferrals().find((item) => item.id === id));
  const [mode, setMode] = useState<Mode>("assistant");
  const [message, setMessage] = useState("");
  const [localReplies, setLocalReplies] = useState<string[]>([]);

  useEffect(() => setReferral(getReferralById(id)), [id]);

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    if (mode === "advisor") setLocalReplies((items) => [...items, message.trim()]);
    else {
      const updated = addReferralMessage(id, { sender: "community", senderName: "Jayden", body: message });
      if (updated) setReferral(updated);
    }
    setMessage("");
  };

  return (
    <main className="app-page"><div className="phone-shell phone-shell-compact mobile-chat-shell">
      <Link className="mobile-chat-back" href="/app/messages">← Inbox</Link>
      {!referral ? <div className="compact-empty"><p>This conversation is not available in this browser session.</p></div> : (
        <section className="provider-mobile-chat">
          <header className="mobile-conversation-head"><span className="inbox-iraac-avatar">I</span><div><h1>IRAAC</h1><p>YouthScape · youth legal support</p></div></header>
          <div className="conversation-mode-switch" role="tablist" aria-label="Choose who to speak with">
            <button className={mode === "assistant" ? "active" : ""} onClick={() => setMode("assistant")}>✨ IRAAC assistant</button>
            <button className={mode === "advisor" ? "active" : ""} onClick={() => setMode("advisor")}>🙋 Lead Advisor</button>
          </div>
          <div className="mobile-message-feed">
            {mode === "assistant" ? referral.conversation.map((item) => (
              <article className={`mobile-message ${item.sender === "community" ? "user" : "assistant"}`} key={item.id}><strong>{item.sender === "community" ? "You" : item.senderName}</strong><p>{item.body}</p><time>{messageDateFormatter.format(new Date(item.createdAt))}</time></article>
            )) : (
              <>
                <article className="mobile-message assistant"><strong>IRAAC Lead Advisor</strong><p>Hi Jayden, I can see your YouthScape request and the context you chose to share with IRAAC. I’m a real person from the IRAAC team. How can I help today?</p></article>
                <article className="mobile-message assistant"><p>I can explain the next step, arrange a call or help organise an office visit. We’ll respond here during service hours.</p></article>
                {localReplies.map((reply, index) => <article className="mobile-message user" key={`${reply}-${index}`}><strong>You</strong><p>{reply}</p></article>)}
              </>
            )}
          </div>
          <form className="mobile-chat-composer" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={mode === "advisor" ? "Message the IRAAC Lead Advisor…" : "Message the IRAAC assistant…"} /><button type="submit" disabled={!message.trim()}>↑</button></form>
        </section>
      )}
      <BottomNav current="/app/messages" />
    </div></main>
  );
}
