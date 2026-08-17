"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function CentrelinkChat() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
  };

  return (
    <section className="centrelink-chat">
      <header className="mobile-conversation-head"><span className="inbox-centrelink-avatar">C</span><div><h1>Centrelink support</h1><p>Moblink assistant · general guidance</p></div></header>
      <div className="mobile-message-feed">
        <article className="mobile-message assistant"><p>I can help you understand the Centrelink process, find the Nowra service centre and identify payments worth checking. Services Australia makes the final eligibility decision.</p></article>
        <article className="mobile-message assistant"><p>A common online claim path is: sign in to myGov, open Centrelink, choose Payments and claims, then Claims and Make a claim. You may be asked pre-claim questions, supporting details and extra tasks before submitting.</p><div className="mobile-message-links"><a href="https://www.servicesaustralia.gov.au/centrelink-online-account-help-claim-payment-online" target="_blank" rel="noreferrer">Official claim steps ↗</a><Link href="/app/service/centrelink-nowra">Centrelink Nowra · 1.5 km</Link></div></article>
        {sent && <><article className="mobile-message user"><p>Thanks — I’d like help working out what may suit my situation.</p></article><article className="mobile-message assistant"><p>I can narrow the options with a few questions about work, study, caring, health and housing. Don’t send bank details or identity documents in chat.</p></article></>}
      </div>
      <form className="mobile-chat-composer" onSubmit={submit}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about Centrelink…" aria-label="Ask about Centrelink" /><button disabled={!message.trim()}>↑</button></form>
    </section>
  );
}
