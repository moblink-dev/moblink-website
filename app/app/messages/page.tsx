"use client";

import { useState } from "react";
import Link from "next/link";
import HelpBot from "../../../components/app/HelpBot";
import BottomNav from "../../../components/app/BottomNav";

export default function ChatPage() {
  const [inChat, setInChat] = useState(true);

  if (inChat) {
    return (
      <main className="app-page">
        <div className="phone-shell phone-shell-compact">
          <div className="phone-status" aria-hidden="true">
            <span className="phone-time">MobLink</span>
            <span className="phone-signal">1800 MOB LINK</span>
          </div>
          <div className="detail-back">
            <button type="button" className="detail-back-link" onClick={() => setInChat(false)}>
              ← Inbox
            </button>
          </div>
          <header className="app-top app-top-compact">
            <div>
              <p className="app-kicker">1800 Mob Link</p>
              <h1>Chat</h1>
            </div>
          </header>
          <HelpBot />
          <BottomNav current="/app/messages" />
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Inbox</span>
          <span className="phone-signal">1800 MOB LINK</span>
        </div>

        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">1800 Mob Link</p>
            <h1>Inbox</h1>
          </div>
        </header>

        <div className="inbox-list">
          <button type="button" className="inbox-item" onClick={() => setInChat(true)}>
            <span className="inbox-item-avatar">🤖</span>
            <div className="inbox-item-body">
              <div className="inbox-item-top">
                <strong className="inbox-item-name">MobLink guide</strong>
                <span className="inbox-item-time">Now</span>
              </div>
              <span className="inbox-item-preview">Tell MobLink what is going on and we&apos;ll help you find the next step.</span>
              <span className="inbox-item-badge">Online</span>
            </div>
          </button>

          <Link href="/app/connected/" className="inbox-item">
            <span className="inbox-item-avatar">🔗</span>
            <div className="inbox-item-body">
              <div className="inbox-item-top">
                <strong className="inbox-item-name">Service requests</strong>
                <span className="inbox-item-time" />
              </div>
              <span className="inbox-item-preview">Track your referrals and requests for help</span>
            </div>
          </Link>

          <Link href="/app/survey/" className="inbox-item">
            <span className="inbox-item-avatar">📝</span>
            <div className="inbox-item-body">
              <div className="inbox-item-top">
                <strong className="inbox-item-name">IRAAC service check-in</strong>
                <span className="inbox-item-time">Due</span>
              </div>
              <span className="inbox-item-preview">How is your support going? Tell IRAAC what helped and what you still need.</span>
              <span className="inbox-item-badge">1 survey due</span>
            </div>
          </Link>
        </div>

        <BottomNav current="/app/messages" />
      </div>
    </main>
  );
}
