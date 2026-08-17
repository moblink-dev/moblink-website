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
    body: "Hi, I’m Simone O’Dowd, Principal Advisor at Sebenza Advisory. I work directly with Aboriginal community organisations on government grants, funding strategy, governance and reporting. I can see the program and evidence context IRAAC has chosen to share in this thread, so you do not have to begin again. I’m here to help turn a suitable opportunity into a clear, evidence-backed application.",
    source: { label: "Find out more about Sebenza Advisory", url: "https://www.sebenza-advisory.com.au/" },
  },
  {
    id: `sebenza_context_${Date.now() + 1}`,
    speaker: "sebenza",
    body: "IRAAC’s clearest cases are YouthScape’s community-led bail navigation and transport pathway, MCC’s invited governance support for other Aboriginal organisations, and culture, Country and participation through MCC and The Crew. Sebenza can test the rules, organise consented member evidence, build the budget and outcomes, prepare the application, and help IRAAC use Moblink properly. Tell me which program matters most. Simone will respond within the next 48 hours.",
  },
];

const initialThreads: Thread[] = [
  { id: "opportunities", title: "Funding opportunities for IRAAC", preview: "Official programs reviewed 17 August 2026.", conversations: { moblink: [
    { id: "m1", speaker: "moblink", body: "Hi, I’m Moblink. I reviewed IRAAC’s own program material, including YouthScape, MCC, The Crew, DARC and its emerging community-led bail support proposal. The strongest funding story is not a generic grant search: it is earlier legal navigation, transport and trusted coordination, backed by consented Illawarra member evidence." },
    { id: "m2", speaker: "moblink", body: "Immediate check: NSW Clubgrants community infrastructure lists $50,000–$300,000 and a 17 August 2026 close. It is only relevant if IRAAC controls, leases or has authority for a real facility upgrade such as a community hub—not for ordinary program delivery. Confirm the deadline and property evidence before spending time on it.", source: { label: "Official NSW infrastructure grant", url: "https://www.nsw.gov.au/grants-and-funding/clubgrants-category-3-fund/clubgrants-infrastructure" } },
    { id: "m3", speaker: "moblink", body: "Conditional live option: the NSW Local Sport Grant offers $2,000–$20,000 and closes 24 August 2026. The Crew cannot apply on its current description alone; an eligible affiliated grassroots sports club would need to lead or partner on a genuine ongoing sport activity. Do not force this fit.", source: { label: "Official NSW Local Sport Grant", url: "https://www.nsw.gov.au/grants-and-funding/local-sport-grant-program-lsgp-2026/27" } },
    { id: "m4", speaker: "moblink", body: "Strong next-round watchlist: Aboriginal Affairs NSW Cultural Grants fund Aboriginal-led cultural events, gatherings on Country and intergenerational knowledge. The 2025–26 round is closed, but MCC or YouthScape could prepare a specific cultural activity, cultural authority, budget and participation evidence for the next round.", source: { label: "Official AANSW Cultural Grants", url: "https://www.nsw.gov.au/grants-and-funding/aboriginal-affairs-nsw-cultural-grants-program" } },
    { id: "m5", speaker: "moblink", body: "Strategic pathway: NSW Justice Reinvestment directly aligns with IRAAC’s community-led bail, transport and legal-navigation evidence, but the published grant round is not currently open. IRAAC should build a local coalition, define the cohort and outcomes, and monitor future commissioning rather than present this as an available application today.", source: { label: "Official NSW Justice Reinvestment program", url: "https://dcj.nsw.gov.au/legal-and-justice/strategies-and-plans/justice-reinvestment.html" } },
    { id: "m6", speaker: "moblink", body: "Federal pathway: NIAA’s Indigenous Advancement Strategy funds First Nations outcomes, but opportunities and application methods vary. I would package YouthScape’s need, Moblink response data, governance evidence and delivery partners, then check each live GrantConnect opportunity before drafting. Which pathway should I assess first?", source: { label: "Official NIAA grants and funding", url: "https://www.niaa.gov.au/our-work/grants-and-funding" } },
  ], sebenza: [] } },
  { id: "youthscape", title: "YouthScape legal pathways", preview: "Community-led bail, transport and safe support.", conversations: { moblink: [{ id: "y1", speaker: "moblink", body: "YouthScape can make a credible justice-reinvestment case around early legal navigation, transport to court and appointments, stable accommodation referrals, family communication and one trusted coordinator. IRAAC’s own material says these practical barriers sit alongside bail conditions. Before applying, define who qualifies, the legal-service partner, safeguarding, transport model and measures such as completed referrals and avoided missed appointments." }], sebenza: [] } },
  { id: "mcc", title: "MCC capability and Country", preview: "Peer governance support and culture.", conversations: { moblink: [{ id: "c1", speaker: "moblink", body: "MCC’s documented core is invited, peer-to-peer governance, administration and reporting support for other Aboriginal organisations. That fits capability-building more strongly than a generic Country project. Protecting Our Places is a separate future option only if IRAAC develops an Aboriginal-led land, water or Healthy Country project with the required local authority and partnerships." }], sebenza: [] } },
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
    setThreads((current) => [{ id, title: "New funding conversation", preview: "Ask Moblink about an IRAAC funding need.", conversations: { moblink: [{ id: `${id}_welcome`, speaker: "moblink", body: "What would you like to fund for IRAAC? I can use the programs, community needs, feedback and outcomes already recorded in Moblink." }], sebenza: [] } }, ...current]);
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
        <div className="funding-mode-switch" aria-label="Choose conversation"><button type="button" aria-pressed={mode === "moblink"} className={mode === "moblink" ? "active" : ""} onClick={() => selectMode("moblink")}>{mode === "sebenza" ? "← " : ""}🤖 Moblink AI Agent</button><button type="button" aria-pressed={mode === "sebenza"} className={mode === "sebenza" ? "active funding-sebenza-mode" : "funding-sebenza-mode"} onClick={() => selectMode("sebenza")}><img src="/images/simone-odowd.png" alt="" /> Speak with a grants expert{mode === "moblink" ? " →" : ""}</button></div>
        <div className="funding-input-row"><button type="button" aria-label="Add image" title="Add image" onClick={() => setNotice("Image attachment is ready for production storage; no file was uploaded in this demonstration.")}>＋</button><button type="button" aria-label="Record voice message" title="Voice message" onClick={() => setNotice("Voice input is shown as a demonstration; the microphone was not accessed.")}>◉</button><input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message funding assistant" placeholder={mode === "moblink" ? "Ask Moblink about funding…" : "Message your Sebenza consultant…"} /><button type="submit" aria-label="Send message" disabled={!draft.trim()}>↑</button></div>
        {notice || mode === "moblink" ? <small>{notice || "Official sources first. IRAAC staff verify eligibility and approve every submission."}</small> : null}
      </form>
    </section>
  </div></div>;
}

function speakerName(speaker: Speaker): string { if (speaker === "moblink") return "Moblink AI Agent"; if (speaker === "sebenza") return "Simone O’Dowd · Principal Advisor"; return "IRAAC"; }
function speakerInitial(speaker: Speaker): string { return speaker === "moblink" ? "🤖" : speakerName(speaker).charAt(0); }
function replyFor(mode: Advisor): string { return mode === "moblink" ? "I’ll check the current official rules against IRAAC’s programs and evidence, then bring back the strongest fit, deadlines and missing information." : "Thanks. I have your question and the shared thread context. Simone will respond here within the next 48 hours."; }
