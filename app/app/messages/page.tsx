"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HelpBot from "../../../components/app/HelpBot";
import CentrelinkChat from "../../../components/app/CentrelinkChat";
import BottomNav from "../../../components/app/BottomNav";
import { getReferrals, getDemoReferrals } from "../../../lib/referrals";
import { customerConversations, conversationDate } from "../../../lib/customer-conversations";

type Thread = "moblink" | "centrelink" | null;

export default function ChatPage() {
  return <Suspense fallback={<main className="app-page"><div className="phone-shell phone-shell-compact"><p role="status">Opening your chats…</p></div></main>}><ChatContent /></Suspense>;
}

function ChatContent() {
  const query = useSearchParams();
  const serviceId = query.get("service") ?? undefined;
  const thread: Thread = query.has("service") || query.has("assistant") ? "moblink" : query.has("centrelink") ? "centrelink" : null;
  const [conversations, setConversations] = useState(() => customerConversations(getDemoReferrals()));

  useEffect(() => {
    if (!thread) setConversations(customerConversations(getReferrals()));
  }, [thread]);

  if (thread) {
    return (
      <main className="app-page">
        <div className="phone-shell phone-shell-compact mobile-chat-shell">
          <Link className="mobile-chat-back" href="/app/messages">← Inbox</Link>
          {thread === "moblink" ? <HelpBot key={serviceId ?? "general"} initialServiceId={serviceId} /> : <CentrelinkChat />}
          <BottomNav current="/app/messages" />
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact inbox-shell-redesign">
        <header className="mobile-page-head"><div><p>Conversations</p><h1>Chat</h1></div><span className="inbox-unread">Demo</span></header>

        <section className="inbox-welcome">
          <span className="assistant-mark" aria-hidden="true">✳</span>
          <div><strong>What do you need help with?</strong><span>Message MobLink or continue with a service.</span></div>
        </section>

        <div className="inbox-list inbox-list-redesign">
          <Link className="inbox-item" href="/app/messages?assistant=1">
            <span className="inbox-item-avatar inbox-ai-avatar"><span className="assistant-mark" aria-hidden="true">✳</span></span>
            <div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">MobLink assistant</strong><span className="inbox-item-time">Now</span></div><span className="inbox-item-preview">Tell me what is happening and I’ll help find the next step.</span><span className="inbox-item-badge">Service guide</span></div>
          </Link>

          {conversations.map(conversation => <Link key={conversation.id} href={`/app/connected/${conversation.id}`} className="inbox-item">
            <span className="inbox-item-avatar inbox-iraac-avatar" aria-hidden="true">{conversation.serviceName[0]}</span>
            <div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">{conversation.serviceName}</strong><span className="inbox-item-time">{conversationDate(conversation.updatedAt)}</span></div><span className="inbox-item-preview">{conversation.conversation.at(-1)?.body || conversation.message || "Your request is ready to review."}</span><span className="inbox-item-badge">Saved on this device</span></div>
          </Link>)}

          <Link className="inbox-item" href="/app/messages?centrelink=1">
            <span className="inbox-item-avatar inbox-centrelink-avatar">C</span>
            <div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">Centrelink support</strong><span className="inbox-item-time">New</span></div><span className="inbox-item-preview">Understand the claim process, possible payments and the nearest service centre.</span></div>
          </Link>

          <div className="inbox-section-label"><span>Check-ins &amp; surveys</span><strong>2 due</strong></div>
          <Link href="/app/survey?type=iraac" className="inbox-item inbox-survey-item"><span className="inbox-item-avatar">📝</span><div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">IRAAC service check-in</strong><span className="inbox-item-time">Optional</span></div><span className="inbox-item-preview">How is YouthScape support going? Tell IRAAC what helped and what you still need.</span></div></Link>
          <Link href="/app/survey?type=moblink" className="inbox-item inbox-survey-item"><span className="inbox-item-avatar">🗣️</span><div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">MobLink monthly Have Your Say</strong><span className="inbox-item-time">Due</span></div><span className="inbox-item-preview">Share what community needs so de-identified themes can inform government.</span></div></Link>
        </div>
        <BottomNav current="/app/messages" />
      </div>
    </main>
  );
}
