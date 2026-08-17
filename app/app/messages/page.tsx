"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HelpBot from "../../../components/app/HelpBot";
import CentrelinkChat from "../../../components/app/CentrelinkChat";
import BottomNav from "../../../components/app/BottomNav";

type Thread = "moblink" | "centrelink" | null;

export default function ChatPage() {
  const [thread, setThread] = useState<Thread>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("service")) setThread("moblink");
  }, []);

  if (thread) {
    return (
      <main className="app-page">
        <div className="phone-shell phone-shell-compact mobile-chat-shell">
          <button type="button" className="mobile-chat-back" onClick={() => setThread(null)}>← Inbox</button>
          {thread === "moblink" ? <HelpBot /> : <CentrelinkChat />}
          <BottomNav current="/app/messages" />
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact inbox-shell-redesign">
        <header className="mobile-page-head"><div><p>Conversations</p><h1>Chat</h1></div><span className="inbox-unread">2 new</span></header>

        <section className="inbox-welcome">
          <img src="/images/ai-agent.jpg" alt="" />
          <div><strong>What do you need help with?</strong><span>Message Moblink or continue with a service.</span></div>
        </section>

        <div className="inbox-list inbox-list-redesign">
          <button type="button" className="inbox-item" onClick={() => setThread("moblink")}>
            <span className="inbox-item-avatar inbox-ai-avatar"><img src="/images/ai-agent.jpg" alt="" /></span>
            <div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">Moblink assistant</strong><span className="inbox-item-time">Now</span></div><span className="inbox-item-preview">Tell me what is happening and I’ll help find the next step.</span><span className="inbox-item-badge">Online</span></div>
          </button>

          <Link href="/app/connected/lead_demo_youthscape" className="inbox-item inbox-item-unread">
            <span className="inbox-item-avatar inbox-iraac-avatar">I</span>
            <div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">IRAAC</strong><span className="inbox-item-time">9:21 am</span></div><span className="inbox-item-preview">YouthScape received your request. Continue with the assistant or a Lead Advisor.</span><span className="inbox-item-badge">Connected</span></div>
          </Link>

          <button type="button" className="inbox-item" onClick={() => setThread("centrelink")}>
            <span className="inbox-item-avatar inbox-centrelink-avatar">C</span>
            <div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">Centrelink support</strong><span className="inbox-item-time">New</span></div><span className="inbox-item-preview">Understand the claim process, possible payments and the nearest service centre.</span></div>
          </button>

          <div className="inbox-section-label"><span>Check-ins &amp; surveys</span><strong>2 due</strong></div>
          <Link href="/app/survey?type=iraac" className="inbox-item inbox-survey-item"><span className="inbox-item-avatar">📝</span><div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">IRAAC service check-in</strong><span className="inbox-item-time">Optional</span></div><span className="inbox-item-preview">How is YouthScape support going? Tell IRAAC what helped and what you still need.</span></div></Link>
          <Link href="/app/survey?type=moblink" className="inbox-item inbox-survey-item"><span className="inbox-item-avatar">🗣️</span><div className="inbox-item-body"><div className="inbox-item-top"><strong className="inbox-item-name">Moblink monthly Have Your Say</strong><span className="inbox-item-time">Due</span></div><span className="inbox-item-preview">Share what community needs so de-identified themes can inform government.</span></div></Link>
        </div>
        <BottomNav current="/app/messages" />
      </div>
    </main>
  );
}
