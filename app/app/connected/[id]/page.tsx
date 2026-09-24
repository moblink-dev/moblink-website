"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import HumanSupport from "../../../../components/app/HumanSupport";
import BottomNav from "../../../../components/app/BottomNav";
import { addReferralMessage, getDemoReferrals, getReferralById, saveReferral, type Referral } from "../../../../lib/referrals";
import { getCloudReferral } from "../../../../lib/cloud-referrals";
import { services } from "../../../data";
import { replyToMessage } from "../../../../lib/assistant";
import { useProviderServices } from "../../../../lib/provider-services";

type Mode = "assistant" | "advisor";
const messageDateFormatter = new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });

export default function ConnectedServiceChatPage() {
  const { id } = useParams<{ id: string }>();
  const [referral, setReferral] = useState<Referral | undefined>(() => getDemoReferrals().find(item => item.id === id));
  const [mode, setMode] = useState<Mode>("assistant");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cloudBacked, setCloudBacked] = useState(false);
  const feed = useRef<HTMLDivElement>(null);
  const catalogue = useProviderServices(services);
  const service = catalogue.find(item => item.id === referral?.serviceId);
  const organisation = referral?.serviceId.startsWith("iraac-") ? "IRAAC" : referral?.serviceName ?? "Service";

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      const local = getReferralById(id);
      if (local) {
        setCloudBacked(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(local.id));
        setReferral(local);
        return;
      }
      void getCloudReferral(id).then((remote) => {
        if (!remote || cancelled) return;
        saveReferral(remote);
        setCloudBacked(true);
        setReferral(remote);
      }).catch(() => {
        if (!cancelled) setError("The cloud-saved request could not be loaded. Please try again.");
      });
    };
    refresh(); setMessage(""); setError("");
    window.addEventListener("storage", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", refresh);
    };
  }, [id]);
  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight; }, [referral, mode]);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || !referral) return;
    try {
      const updated = addReferralMessage(id, { sender: "community", senderName: referral.requesterName, body: message, mode });
      if (!updated) { setError("Couldn’t save your message. Please try again."); return; }
      setReferral(updated);
      setMessage("");
      setError("");
      if (mode === "assistant") {
        const reply = replyToMessage(catalogue, message, { serviceId: referral.serviceId, postcode: referral.postcode });
        const answered = addReferralMessage(id, { sender: "moblink", senderName: `${organisation} assistant`, body: reply.text, mode: "assistant" });
        if (answered) setReferral(answered);
      }
    } catch {
      setError("This browser couldn’t save the conversation. Your message may not be stored; check it before trying again.");
    }
  }

  return (
    <main className="app-page"><div className="phone-shell phone-shell-compact mobile-chat-shell">
      <Link className="mobile-chat-back" href="/app/messages">← Chats</Link>
      {!referral ? <div className="compact-empty"><p>This conversation is not available in this browser session.</p><Link href="/app/search">Find a service</Link></div> : (
        <section className="provider-mobile-chat" aria-label={`${organisation} conversation`}>
          <header className="mobile-conversation-head"><span className="inbox-iraac-avatar" aria-hidden="true">{organisation[0]}</span><div><h1>{organisation}</h1><p>{referral.serviceName} · {cloudBacked ? "cloud-saved request" : "demo conversation"}</p></div></header>
          <div className="conversation-mode-switch" role="group" aria-label="Choose who to speak with">
            <button type="button" className={mode === "assistant" ? "active" : ""} aria-pressed={mode === "assistant"} onClick={() => setMode("assistant")}>✳ {organisation} assistant</button>
            <button type="button" className={mode === "advisor" ? "active" : ""} aria-pressed={mode === "advisor"} onClick={() => setMode("advisor")}>{organisation} adviser</button>
          </div>
          {mode === "advisor" && !id.startsWith("lead_demo_") ? <HumanSupport team={organisation === "IRAAC" ? "iraac" : "moblink"} history={referral.conversation.map(item=>({role:item.senderName,text:item.body}))} initialLocation={referral.postcode} /> : <>
          <div className="mobile-message-feed" ref={feed} role="log" aria-label="Service messages" aria-live="polite">
            <p className="provider-demo-note">{mode === "advisor" ? `Human adviser · ${organisation} team · fictional demo` : `${organisation} assistant · fictional demo`}</p>
            {referral.conversation.filter(item => mode === "advisor" || item.mode !== "advisor").map(item => (
              <article className={`mobile-message ${item.sender === "community" ? "user" : "assistant"}`} key={item.id}><strong>{item.sender === "community" ? "You" : item.senderName}</strong><p>{item.body}</p><time>{messageDateFormatter.format(new Date(item.createdAt))}</time></article>
            ))}

          </div>
          {error && <p role="alert">{error}</p>}
          <form className="mobile-chat-composer" onSubmit={sendMessage}><input value={message} maxLength={2000} onChange={event => setMessage(event.target.value)} placeholder={mode === "advisor" ? `Message the ${organisation} adviser…` : `Message the ${organisation} assistant…`} aria-label={mode === "advisor" ? "Demo adviser message" : "Message the service assistant"} /><button type="submit" disabled={!message.trim()} aria-label="Send message">↑</button></form>
          </>}
        </section>
      )}
      <BottomNav current="/app/messages" />
    </div></main>
  );
}
