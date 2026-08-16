"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Speaker = "moblink" | "sebenza" | "iraac";
type Message = { id: string; speaker: Speaker; body: string };
type Thread = { id: string; title: string; preview: string; messages: Message[] };

const initialThreads: Thread[] = [
  { id: "opportunities", title: "Funding opportunities for IRAAC", preview: "MobLink reviewed IRAAC programs and community evidence.", messages: [
    { id: "m1", speaker: "moblink", body: "Hi, I’m MobLink. I’ve reviewed IRAAC’s four programs, 16 fictional member records, service outcomes and feedback. Your strongest evidence is around youth legal pathways, culture and Country, practical skills, and coordinated family support." },
    { id: "m2", speaker: "moblink", body: "I suggest exploring four funding paths first: youth justice and early intervention for YouthScape; culture and Country programs for MCC; community participation and equipment for The Crew; and family coordination for DARC. I can help turn the evidence in Reports into a draft case for support. Current eligibility must still be checked against official guidelines." },
  ] },
  { id: "youthscape", title: "YouthScape legal pathways", preview: "Evidence for youth justice and safe bail support.", messages: [{ id: "y1", speaker: "moblink", body: "YouthScape has useful evidence for a youth justice funding case: urgent legal navigation, family communication and safe support pathways. Shall I draft the need, outcomes and evidence sections?" }] },
  { id: "mcc", title: "MCC culture and Country", preview: "Funding for cultural connection and governance support.", messages: [{ id: "c1", speaker: "moblink", body: "MCC may align with culture, Country and Aboriginal community organisation capability funding. IRAAC’s member feedback can show why relationship-based support matters." }] },
  { id: "crew", title: "The Crew equipment", preview: "Practical skills, participation and program materials.", messages: [{ id: "t1", speaker: "moblink", body: "The Crew has a clear practical participation story. I can assemble evidence for equipment, workshops, transport and delivery costs without inventing outcomes." }] },
  { id: "darc", title: "DARC family pathways", preview: "Family coordination, advocacy and navigation.", messages: [{ id: "d1", speaker: "moblink", body: "DARC’s strongest funding story is coordinated support: helping families navigate several services without repeating their story. Survey responses can strengthen the outcome evidence." }] },
  { id: "transport", title: "Community transport", preview: "Transport barriers across IRAAC programs.", messages: [{ id: "tr1", speaker: "moblink", body: "Transport appears across several IRAAC needs. We can build a shared evidence summary showing how travel barriers affect attendance, legal support and connection to Country." }] },
];

export default function AdminFundingPage() {
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState(initialThreads[0].id);
  const [railOpen, setRailOpen] = useState(true);
  const [mode, setMode] = useState<"moblink" | "sebenza">("moblink");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const active = threads.find((thread) => thread.id === activeId) || threads[0];
  const addMessage = (message: Message) => setThreads((current) => current.map((thread) => thread.id === active.id ? { ...thread, messages: [...thread.messages, message] } : thread));

  const selectMode = (next: "moblink" | "sebenza") => {
    setMode(next);
    if (next === "sebenza" && !active.messages.some((message) => message.speaker === "sebenza")) {
      addMessage({ id: `sebenza_${Date.now()}`, speaker: "sebenza", body: "Hi, we’re the Sebenza Consulting team. We’ve received the context from this funding conversation and can see the IRAAC evidence being considered. A consultant can review the opportunity and respond within 48 hours. This is a demonstration handoff; no request has been sent." });
    }
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    addMessage({ id: `iraac_${Date.now()}`, speaker: "iraac", body: draft.trim() });
    setDraft("");
    window.setTimeout(() => addMessage({ id: `reply_${Date.now()}`, speaker: mode, body: replyFor(mode) }), 250);
  };

  const newThread = () => {
    const id = `thread_${Date.now()}`;
    setThreads((current) => [{ id, title: "New funding conversation", preview: "Ask MobLink about an IRAAC funding need.", messages: [{ id: `${id}_welcome`, speaker: "moblink", body: "What would you like to fund for IRAAC? I can use the programs, community needs, feedback and outcomes already recorded in MobLink." }] }, ...current]);
    setActiveId(id);
    setMode("moblink");
  };

  return <div className="admin-funding-chat-page"><div className={railOpen ? "funding-chat-shell" : "funding-chat-shell funding-chat-shell-collapsed"}>
    <aside className="funding-chat-rail" aria-label="Funding conversations">
      <div className="funding-rail-actions"><Link href="/admin/" aria-label="Back to provider overview">←</Link><button type="button" onClick={newThread}>+ New</button><button type="button" aria-label="Collapse funding conversations" onClick={() => setRailOpen(false)}>‹</button></div>
      <p>Funding chats</p><div className="funding-thread-inbox">{threads.map((thread) => <button type="button" key={thread.id} className={thread.id === active.id ? "active" : ""} onClick={() => setActiveId(thread.id)}><strong>{thread.title}</strong><span>{thread.preview}</span></button>)}</div>
    </aside>
    <section className="funding-conversation">
      {!railOpen ? <button type="button" className="funding-open-rail" onClick={() => setRailOpen(true)} aria-label="Open funding conversations">☰</button> : null}
      <header><div><span>IRAAC funding workspace</span><h1>{active.title}</h1></div><span className="funding-demo-label">Demonstration</span></header>
      <div className="funding-message-feed" aria-live="polite">{active.messages.map((message) => <article key={message.id} className={`funding-chat-message funding-chat-message-${message.speaker}`}><div className="funding-avatar" aria-hidden="true">{speakerInitial(message.speaker)}</div><div><strong>{speakerName(message.speaker)}</strong><p>{message.body}</p>{message.speaker === "sebenza" ? <p className="funding-sebenza-contact"><a href="https://sebenza-advisory.com.au/" target="_blank" rel="noreferrer">Visit Sebenza Consulting</a> · Consultant response target: 48 hours</p> : null}</div></article>)}</div>
      <form className="funding-chat-composer" onSubmit={send}>
        <div className="funding-mode-switch" aria-label="Choose who to speak with"><button type="button" className={mode === "moblink" ? "active" : ""} onClick={() => selectMode("moblink")}>MobLink agent</button><button type="button" className={mode === "sebenza" ? "active" : ""} onClick={() => selectMode("sebenza")}>Sebenza consultant</button></div>
        <div className="funding-input-row"><button type="button" aria-label="Add image" title="Add image" onClick={() => setNotice("Image attachment is ready for production storage; no file was uploaded in this demonstration.")}>＋</button><button type="button" aria-label="Record voice message" title="Voice message" onClick={() => setNotice("Voice input is shown as a demonstration; the microphone was not accessed.")}>◉</button><input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message funding assistant" placeholder={mode === "moblink" ? "Ask MobLink about funding…" : "Message a Sebenza consultant…"} /><button type="submit" aria-label="Send message" disabled={!draft.trim()}>↑</button></div>
        <small>{notice || "MobLink prepares evidence and drafts. People verify eligibility and approve every submission."}</small>
      </form>
    </section>
  </div></div>;
}

function speakerName(speaker: Speaker): string {
  if (speaker === "moblink") return "MobLink";
  if (speaker === "sebenza") return "Sebenza Consultant";
  return "IRAAC";
}

function speakerInitial(speaker: Speaker): string { return speakerName(speaker).charAt(0); }

function replyFor(mode: "moblink" | "sebenza"): string {
  if (mode === "moblink") return "I can use IRAAC’s program, member, response and survey evidence to help answer that. I’ll keep assumptions visible and check current eligibility before treating any opportunity as suitable.";
  return "Thanks — the Sebenza team has this question and the conversation context. A consultant would review it and respond within 48 hours in a connected service.";
}
