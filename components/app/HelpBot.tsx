"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { services } from "../../app/data";
import { useProviderServices } from "../../lib/provider-services";
import { replyToMessage, type AssistantContext } from "../../lib/assistant";
import { serviceImage } from "../../lib/service-images";
import { readChatSession, type ChatMessage as Message } from "../../lib/chat-session";

const greeting: Message = { role: "bot", text: "Hi, I’m the MobLink assistant. What do you need a hand with today? Tell me a little about what’s happening, and we’ll find a useful next step." };

export default function HelpBot({ initialServiceId }: { initialServiceId?: string }) {
  const catalogue = useProviderServices(services);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [context, setContext] = useState<AssistantContext>({ serviceId: initialServiceId });
  const [input, setInput] = useState("");
  const [humanMode, setHumanMode] = useState(false);
  const [ready, setReady] = useState(false);
  const storageKey = useRef("");
  const feed = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const serviceId = initialServiceId ?? new URLSearchParams(window.location.search).get("service") ?? undefined;
    const selected = catalogue.find(s => s.id === serviceId);
    storageKey.current = `moblink_chat_v1_${serviceId ?? "general"}`;
    try {
      const saved = readChatSession(sessionStorage.getItem(storageKey.current));
      if (saved) {
        setMessages(saved.messages);
        setContext(saved.context);
        setReady(true);
        return;
      }
    } catch { /* Storage may be unavailable; chatting still works in memory. */ }
    if (selected) {
      setContext({ serviceId });
      setMessages([{ role: "bot", text: `Let’s look at ${selected.name}. ${selected.description}\nI can help you check eligibility, contact details or the next step.`, serviceIds: [selected.id] }]);
    }
    setReady(true);
  }, [initialServiceId, catalogue]);

  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(storageKey.current, JSON.stringify({ messages: messages.slice(-80), context })); }
    catch { /* Keep the conversation usable if browser storage is full or blocked. */ }
  }, [ready, messages, context]);

  useEffect(() => {
    if (feed.current) feed.current.scrollTop = feed.current.scrollHeight;
  }, [messages, humanMode]);

  function send(text: string) {
    if (!text.trim()) return;
    const reply = replyToMessage(catalogue, text, context);
    const time = new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(new Date());
    setMessages(previous => [...previous.slice(-78), { role: "user", text: text.trim(), time }, { role: "bot", text: reply.text, serviceIds: reply.serviceIds, crisis: reply.crisis, time }]);
    setContext(reply.context);
    if (reply.humanSupport) setHumanMode(true);
    setInput("");
    composer.current?.focus();
  }

  function submit(event: FormEvent) { event.preventDefault(); send(input); }

  return (
    <section className="help-bot" aria-label="MobLink assistant conversation">
      <header className="help-bot-header">
        <div className="help-bot-header-info">
          <span className="assistant-mark" aria-hidden="true">✳</span>
          <div><strong>MobLink assistant</strong><span className="help-bot-status">Service guide · demo</span></div>
        </div>
        <button type="button" className="help-bot-human-toggle" onClick={() => setHumanMode(!humanMode)} aria-expanded={humanMode}>Human support</button>
      </header>
      <div className="help-bot-chat" ref={feed} role="log" aria-label="Messages" aria-live="polite">
        <p className="chat-date-label">Here to help, at your pace</p>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message-group ${msg.role}`}>
            <div className={`help-bot-msg help-bot-msg-${msg.role === "user" ? "user" : "bot"}`}>
              <div className="help-bot-msg-text">{msg.text.split("\n").map((line, j) => <p key={j}>{line}</p>)}</div>
              {msg.time && <time className="chat-message-time">{msg.time}<span aria-label={msg.role === "user" ? "Added to this demo chat" : undefined}>{msg.role === "user" ? " ✓" : ""}</span></time>}
            </div>
            {msg.crisis && <div className="chat-suggestions"><a href="tel:000">Call 000</a><a href="tel:139276">Call 13YARN</a><a href="tel:131114">Call Lifeline</a></div>}
            {msg.serviceIds?.map(id => catalogue.find(s => s.id === id)).filter(s => !!s).map(s => (
              <Link className="chat-service-card" href={`/app/service/${s.id}`} key={s.id}>
                <img src={serviceImage(s)} alt="" loading="lazy" width="60" height="60" />
                <span><strong>{s.name}</strong><small>{s.category} · {s.isNational ? "Phone / national listing" : s.suburb}{s.isFree ? " · Free" : ""}</small><b>View service <span aria-hidden="true">↗</span></b></span>
              </Link>
            ))}
          </div>
        ))}
        {messages.length === 1 && <div className="chat-suggestions" aria-label="Start a conversation">{(context.serviceId ? ["Am I eligible?", "How do I contact them?"] : ["Find housing", "Health & wellbeing", "Money & Centrelink", "Youth support"]).map(text => <button type="button" onClick={() => send(text)} key={text}>{text}</button>)}</div>}
        {humanMode && <aside className="chat-human-panel"><strong>Prefer to speak to a person?</strong><p>Open a service to call its team or prepare a support request. No live adviser is connected to this demo chat.</p><Link href="/app/search">Find a service to contact ↗</Link><button type="button" onClick={() => setHumanMode(false)}>Continue chatting</button><button type="button" onClick={() => { setMessages([greeting]); setContext({}); setHumanMode(false); }}>Clear this chat</button></aside>}
      </div>
      <form className="help-bot-input-row" onSubmit={submit}>
        <textarea ref={composer} rows={1} className="help-bot-input" placeholder="Message MobLink…" value={input} maxLength={2000} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(input); } }} aria-label="Message MobLink" />
        <button className="help-bot-send" disabled={!input.trim()} aria-label="Send message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v14" /></svg></button>
      </form>
    </section>
  );
}
