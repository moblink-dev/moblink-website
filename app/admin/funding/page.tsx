"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Advisor = "moblink" | "sebenza";
type Speaker = Advisor | "iraac";
type Message = { id: string; speaker: Speaker; body: string; source?: { label: string; url: string } };
type Thread = { id: string; title: string; preview: string; conversations: Record<Advisor, Message[]> };

const sebenzaWelcome = (): Message[] => [
  {
    id: `sebenza_intro_${Date.now()}`,
    speaker: "sebenza",
    body: "Hi, I’m Simone O’Dowd, Principal Advisor at Sebenza Advisory. I work directly with Aboriginal community organisations on funding strategy, government grants, governance and reporting. I’ve joined this conversation as a real person, and I’m here to help IRAAC turn a promising opportunity into a clear, evidence-backed application.",
    source: { label: "Meet Sebenza Advisory", url: "https://www.sebenza-advisory.com.au/" },
  },
  {
    id: `sebenza_context_${Date.now() + 1}`,
    speaker: "sebenza",
    body: "From the context IRAAC has chosen to share in this thread, I can see strong stories across YouthScape, MCC, The Crew and DARC, supported by member demand, check-ins and service outcomes. I’d begin with youth justice and early-intervention funding, culture and Country programs, and practical community participation. Sebenza can help shape the case, test eligibility, organise evidence, prepare the application and get your team comfortable using MobLink. Tell me which program you want to fund first, or ask me to recommend the best starting point.",
    source: { label: "Talk with Simone", url: "https://www.sebenza-advisory.com.au/contact.html" },
  },
];

const initialThreads: Thread[] = [
  { id: "opportunities", title: "Funding opportunities for IRAAC", preview: "Official sources checked 16 August 2026.", conversations: { moblink: [
    { id: "m1", speaker: "moblink", body: "Hi, I’m MobLink. I reviewed IRAAC’s programs, member outcomes and feedback. I found four funding paths worth discussing." },
    { id: "m2", speaker: "moblink", body: "First Nations Clean Energy Advice Grants may help if IRAAC has a real community energy project. The listed range is $5,000–$80,000 and the page says applications close 3 September 2026.", source: { label: "Open official grant page", url: "https://business.gov.au/grants-and-programs/first-nations-clean-energy-advice-grants" } },
    { id: "m3", speaker: "moblink", body: "The NSW Local Sport Grant lists $2,000–$20,000 and closes 24 August 2026, but IRAAC is unlikely to qualify alone. It would need an eligible, affiliated grassroots sports-club partner for a genuine sport activity.", source: { label: "Open NSW grant page", url: "https://www.nsw.gov.au/grants-and-funding/local-sport-grant-program-lsgp-2026/27" } },
    { id: "m4", speaker: "moblink", body: "Protecting Our Places is closed for 2026, but it is a strong next-round watchlist for MCC culture and Healthy Country work.", source: { label: "Open NSW program page", url: "https://www.nsw.gov.au/grants-and-funding/protecting-our-places-2026" } },
    { id: "m5", speaker: "moblink", body: "Which one should I assess first? I can compare the rules with IRAAC’s evidence, then prepare questions or a draft for staff review." },
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

  useEffect(() => {
    if (window.matchMedia("(max-width: 760px)").matches) setRailOpen(false);
  }, []);

  const addMessage = (advisor: Advisor, message: Message) => setThreads((current) => current.map((thread) => thread.id === active.id ? { ...thread, conversations: { ...thread.conversations, [advisor]: [...thread.conversations[advisor], message] } } : thread));
  const selectMode = (next: Advisor) => {
    setMode(next);
    setNotice("");
    if (next === "sebenza" && active.conversations.sebenza.length === 0) {
      setThreads((current) => current.map((thread) => thread.id === active.id ? { ...thread, conversations: { ...thread.conversations, sebenza: sebenzaWelcome() } } : thread));
    }
  };
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
      <header><div><span>{mode === "moblink" ? "IRAAC funding workspace" : "Live chat with Simone · Sebenza Advisory"}</span><h1>{active.title}</h1></div></header>
      <div key={`${active.id}_${mode}`} className={`funding-message-feed funding-message-feed-${mode}`} aria-live="polite">
        {messages.map((message) => <article key={message.id} className={`funding-chat-message funding-chat-message-${message.speaker}`}><div className={message.speaker === "sebenza" ? "funding-avatar funding-avatar-photo" : "funding-avatar"} aria-hidden="true">{message.speaker === "sebenza" ? <img src="/images/simone-odowd.png" alt="" /> : speakerInitial(message.speaker)}</div><div><strong>{speakerName(message.speaker)}</strong><p>{message.body}</p>{message.source ? <a className="funding-source-link" href={message.source.url} target="_blank" rel="noreferrer">{message.source.label} ↗</a> : null}</div></article>)}
      </div>
      <form className="funding-chat-composer" onSubmit={send}>
        <div className="funding-mode-switch" aria-label="Choose conversation"><button type="button" aria-pressed={mode === "moblink"} className={mode === "moblink" ? "active" : ""} onClick={() => selectMode("moblink")}>{mode === "sebenza" ? "← " : ""}MobLink agent</button><button type="button" aria-pressed={mode === "sebenza"} className={mode === "sebenza" ? "active funding-sebenza-mode" : "funding-sebenza-mode"} onClick={() => selectMode("sebenza")}><img src="/images/simone-odowd.png" alt="" /> Simone at Sebenza{mode === "moblink" ? " →" : ""}</button></div>
        <div className="funding-input-row"><button type="button" aria-label="Add image" title="Add image" onClick={() => setNotice("Image attachment is ready for production storage; no file was uploaded in this demonstration.")}>＋</button><button type="button" aria-label="Record voice message" title="Voice message" onClick={() => setNotice("Voice input is shown as a demonstration; the microphone was not accessed.")}>◉</button><input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message funding assistant" placeholder={mode === "moblink" ? "Ask MobLink about funding…" : "Message your Sebenza consultant…"} /><button type="submit" aria-label="Send message" disabled={!draft.trim()}>↑</button></div>
        {notice || mode === "moblink" ? <small>{notice || "Official sources first. IRAAC staff verify eligibility and approve every submission."}</small> : null}
      </form>
    </section>
  </div></div>;
}

function speakerName(speaker: Speaker): string { if (speaker === "moblink") return "MobLink"; if (speaker === "sebenza") return "Simone O’Dowd · Principal Advisor"; return "IRAAC"; }
function speakerInitial(speaker: Speaker): string { return speakerName(speaker).charAt(0); }
function replyFor(mode: Advisor): string { return mode === "moblink" ? "I’ll check the current official rules against IRAAC’s programs and evidence, then bring back the strongest fit and any missing information." : "Thanks. The Sebenza team has your question and this thread. A consultant would review it and respond here within 48 hours."; }
