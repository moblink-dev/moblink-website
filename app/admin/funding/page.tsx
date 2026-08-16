"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type Advisor = "moblink" | "sebenza";
type Speaker = Advisor | "iraac";
type FundingOpportunity = { name: string; url: string; status: string; detail: string; fit: string };
type Message = { id: string; speaker: Speaker; body: string; opportunities?: FundingOpportunity[] };
type Thread = { id: string; title: string; preview: string; conversations: Record<Advisor, Message[]> };

const sebenzaWelcome = (): Message => ({
  id: `sebenza_${Date.now()}`,
  speaker: "sebenza",
  body: "Hi, I’m with Sebenza Consulting. I can see the MobLink funding context for this thread, including the IRAAC programs and evidence being discussed. Our team can review the opportunity and respond here within 48 hours. This is a demonstration handoff; no request has been sent.",
});

const opportunities: FundingOpportunity[] = [
  { name: "First Nations Clean Energy Advice Grants", url: "https://business.gov.au/grants-and-programs/first-nations-clean-energy-advice-grants", status: "Open · closes 3 Sep 2026", detail: "$5,000–$80,000 for advice on a real clean-energy development opportunity.", fit: "Conditional fit for an eligible IRAAC community energy project." },
  { name: "Country Passenger Transport Infrastructure Grants", url: "https://www.nsw.gov.au/grants-and-funding/2026/27-country-passenger-transport-infrastructure-grants-scheme-cptigs", status: "Open · closes 31 Aug 2026", detail: "Bus-stop infrastructure funding for eligible NSW community organisations.", fit: "Partnership pathway only; this is not general program transport funding." },
  { name: "NSW Local Sport Grant Program", url: "https://www.nsw.gov.au/grants-and-funding/local-sport-grant-program-lsgp-2026/27", status: "Open · closes 24 Aug 2026", detail: "$2,000–$20,000 for local sport participation, equipment and events.", fit: "Potential fit only if The Crew delivers an eligible sport activity." },
  { name: "Protecting Our Places", url: "https://www.nsw.gov.au/grants-and-funding/protecting-our-places-2026", status: "Watch next round", detail: "Aboriginal-led culture and Healthy Country projects; the 2026 round is closed.", fit: "Strong thematic watchlist for MCC, subject to the next guidelines." },
];

const initialThreads: Thread[] = [
  { id: "opportunities", title: "Funding opportunities for IRAAC", preview: "Official sources checked 16 August 2026.", conversations: { moblink: [
    { id: "m1", speaker: "moblink", body: "Hi, I’m MobLink. I’ve reviewed IRAAC’s four programs, 16 fictional member records, service outcomes and feedback. The strongest evidence is around youth legal pathways, culture and Country, practical skills, and coordinated family support." },
    { id: "m2", speaker: "moblink", body: "I checked current official sources on 16 August 2026. These are leads to assess, not eligibility decisions. The open opportunities are conditional; the culture grant is a useful watchlist for the next round.", opportunities },
  ], sebenza: [] } },
  { id: "youthscape", title: "YouthScape legal pathways", preview: "Evidence for youth justice and safe bail support.", conversations: { moblink: [{ id: "y1", speaker: "moblink", body: "YouthScape has useful evidence for a youth justice funding case: urgent legal navigation, family communication and safe support pathways. I can draft the need, outcomes and evidence sections while we monitor NIAA and GrantConnect for a suitable live round." }], sebenza: [] } },
  { id: "mcc", title: "MCC culture and Country", preview: "Culture, Country and community capability.", conversations: { moblink: [{ id: "c1", speaker: "moblink", body: "MCC has a strong thematic fit with Aboriginal culture and Healthy Country programs. Protecting Our Places 2026 is closed, so I have marked it as a next-round watchlist rather than an open opportunity." }], sebenza: [] } },
  { id: "crew", title: "The Crew equipment", preview: "Practical skills, participation and materials.", conversations: { moblink: [{ id: "t1", speaker: "moblink", body: "The Crew has a clear practical participation story. The NSW Local Sport Grant is worth checking only if the proposed activity is genuinely sport-based; otherwise we should keep searching rather than force the fit." }], sebenza: [] } },
  { id: "darc", title: "DARC family pathways", preview: "Family coordination, advocacy and navigation.", conversations: { moblink: [{ id: "d1", speaker: "moblink", body: "DARC’s strongest funding story is coordinated support: helping families navigate several services without repeating their story. Member surveys and response-time evidence can support a future application." }], sebenza: [] } },
  { id: "transport", title: "Community transport", preview: "Transport barriers across IRAAC programs.", conversations: { moblink: [{ id: "tr1", speaker: "moblink", body: "The current NSW passenger transport scheme funds bus-stop infrastructure, not general vehicles or program travel. IRAAC may need an eligible partnership with a council or Aboriginal Land Council, while we continue searching for a better direct program-transport fit." }], sebenza: [] } },
];

export default function AdminFundingPage() {
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState(initialThreads[0].id);
  const [railOpen, setRailOpen] = useState(true);
  const [mode, setMode] = useState<Advisor>("moblink");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const active = threads.find((thread) => thread.id === activeId) || threads[0];
  const messages = active.conversations[mode];

  const addMessage = (advisor: Advisor, message: Message) => setThreads((current) => current.map((thread) => thread.id === active.id ? { ...thread, conversations: { ...thread.conversations, [advisor]: [...thread.conversations[advisor], message] } } : thread));
  const selectMode = (next: Advisor) => { setMode(next); setNotice(""); if (next === "sebenza" && active.conversations.sebenza.length === 0) addMessage("sebenza", sebenzaWelcome()); };
  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const advisor = mode;
    addMessage(advisor, { id: `iraac_${Date.now()}`, speaker: "iraac", body: draft.trim() });
    setDraft("");
    window.setTimeout(() => addMessage(advisor, { id: `reply_${Date.now()}`, speaker: advisor, body: replyFor(advisor) }), 250);
  };
  const newThread = () => {
    const id = `thread_${Date.now()}`;
    setThreads((current) => [{ id, title: "New funding conversation", preview: "Ask MobLink about an IRAAC funding need.", conversations: { moblink: [{ id: `${id}_welcome`, speaker: "moblink", body: "What would you like to fund for IRAAC? I can use the programs, community needs, feedback and outcomes already recorded in MobLink." }], sebenza: [] } }, ...current]);
    setActiveId(id); setMode("moblink");
  };
  const openThread = (id: string) => { setActiveId(id); setMode("moblink"); if (window.matchMedia("(max-width: 760px)").matches) setRailOpen(false); };

  return <div className="admin-funding-chat-page"><div className={railOpen ? "funding-chat-shell" : "funding-chat-shell funding-chat-shell-collapsed"}>
    <aside className="funding-chat-rail" aria-label="Funding conversations">
      <div className="funding-rail-actions"><Link href="/admin/" aria-label="Back to provider dashboard">←</Link><button type="button" onClick={newThread}>+ New chat</button><button type="button" aria-label="Collapse funding conversations" onClick={() => setRailOpen(false)}>‹</button></div>
      <p>Funding chats</p><div className="funding-thread-inbox">{threads.map((thread) => <button type="button" key={thread.id} className={thread.id === active.id ? "active" : ""} onClick={() => openThread(thread.id)}><strong>{thread.title}</strong><span>{thread.preview}</span></button>)}</div>
    </aside>
    <section className={`funding-conversation funding-conversation-${mode}`}>
      {!railOpen ? <button type="button" className="funding-open-rail" onClick={() => setRailOpen(true)} aria-label="Open funding conversations">☰</button> : null}
      <header><div><span>{mode === "moblink" ? "IRAAC funding workspace" : "Sebenza consultant · shared thread context"}</span><h1>{active.title}</h1></div><span className="funding-demo-label">Demonstration</span></header>
      <div key={`${active.id}_${mode}`} className={`funding-message-feed funding-message-feed-${mode}`} aria-live="polite">
        {mode === "sebenza" ? <div className="funding-lane-note"><span>MobLink context shared</span><strong>This is now a private Sebenza conversation within the same funding thread.</strong></div> : null}
        {messages.map((message) => <article key={message.id} className={`funding-chat-message funding-chat-message-${message.speaker}`}><div className="funding-avatar" aria-hidden="true">{speakerInitial(message.speaker)}</div><div><strong>{speakerName(message.speaker)}</strong><p>{message.body}</p>{message.opportunities ? <div className="funding-opportunity-list">{message.opportunities.map((item) => <a key={item.name} href={item.url} target="_blank" rel="noreferrer"><span>{item.status}</span><strong>{item.name}</strong><small>{item.detail}</small><em>{item.fit}</em></a>)}</div> : null}{message.speaker === "sebenza" ? <p className="funding-sebenza-contact"><a href="https://sebenza-advisory.com.au/" target="_blank" rel="noreferrer">Sebenza Consulting</a> · Response target: 48 hours</p> : null}</div></article>)}
      </div>
      <form className="funding-chat-composer" onSubmit={send}>
        <div className="funding-mode-switch" aria-label="Choose conversation"><button type="button" aria-pressed={mode === "moblink"} className={mode === "moblink" ? "active" : ""} onClick={() => selectMode("moblink")}>{mode === "sebenza" ? "← " : ""}MobLink agent</button><button type="button" aria-pressed={mode === "sebenza"} className={mode === "sebenza" ? "active" : ""} onClick={() => selectMode("sebenza")}>Sebenza consultant{mode === "moblink" ? " →" : ""}</button></div>
        <div className="funding-input-row"><button type="button" aria-label="Add image" title="Add image" onClick={() => setNotice("Image attachment is ready for production storage; no file was uploaded in this demonstration.")}>＋</button><button type="button" aria-label="Record voice message" title="Voice message" onClick={() => setNotice("Voice input is shown as a demonstration; the microphone was not accessed.")}>◉</button><input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message funding assistant" placeholder={mode === "moblink" ? "Ask MobLink about funding…" : "Message your Sebenza consultant…"} /><button type="submit" aria-label="Send message" disabled={!draft.trim()}>↑</button></div>
        <small>{notice || (mode === "moblink" ? "Official sources first. IRAAC staff verify eligibility and approve every submission." : "This lane keeps the same thread context and moves the conversation to Sebenza.")}</small>
      </form>
    </section>
  </div></div>;
}

function speakerName(speaker: Speaker): string { if (speaker === "moblink") return "MobLink"; if (speaker === "sebenza") return "Sebenza Consultant"; return "IRAAC"; }
function speakerInitial(speaker: Speaker): string { return speakerName(speaker).charAt(0); }
function replyFor(mode: Advisor): string { return mode === "moblink" ? "I’ll compare that need with current official guidelines and use IRAAC’s program, member, response and survey evidence without treating a thematic match as confirmed eligibility." : "Thanks — the Sebenza team has this question and the shared thread context. A consultant would review it and respond here within 48 hours in a connected service."; }
