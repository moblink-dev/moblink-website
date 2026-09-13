import Link from "next/link";
import SiteShell from "./SiteShell";

const areas = [
  { title: "A place to call home", category: "Housing", image: "shoalhaven-aboriginal-housing", body: "Housing, tenancy and finding somewhere safe to stay." },
  { title: "Health & wellbeing", category: "Health", image: "waminda", body: "Care for your physical, emotional and family wellbeing." },
  { title: "Money & Centrelink", category: "Centrelink", image: "centrelink-nowra", body: "Help with payments, applications and getting organised." },
  { title: "Legal help", category: "Legal", image: "wollongong-als", body: "Find legal advice, advocacy and practical support." },
  { title: "Young people & family", category: "Youth", image: "iraac-youthscape", body: "Support with opportunities, connection and next steps." },
  { title: "Culture & Country", category: "Culture", image: "bush-tucker-walk", body: "Explore community programs and cultural connections." },
];
const steps = [
  { title: "Start where you are", body: "Search for what you need, or explain it in your own words to the MobLink assistant." },
  { title: "Explore your options", body: "See services, read what they offer and explore the map. You choose what feels right." },
  { title: "Take your next step", body: "Open a service’s details to find contact options. Try an example conversation to see how support could work." },
];

export default function Home() {
  return <SiteShell><main id="main-content" className="welcome-page">
    <section className="welcome-hero"><div className="welcome-container welcome-hero-grid">
      <div className="welcome-copy"><p className="welcome-eyebrow">Local support. A place to start.</p>
        <h1>Your next step.<br /><em>A little closer.</em></h1>
        <p className="welcome-intro">Find Aboriginal and Torres Strait Islander community services for what’s happening in your life. You don’t need to know who to call first.</p>
        <form action="/app/search/" className="welcome-search"><label htmlFor="support-search">What can we help you find?</label><div><input id="support-search" name="q" type="search" placeholder="Housing, health, Nowra…" maxLength={120} /><button type="submit" aria-label="Find support">Search <span aria-hidden="true">→</span></button></div></form>
        <div className="welcome-start"><Link href="/app/messages/?assistant=1">Not sure? Ask the MobLink assistant <span aria-hidden="true">↗</span></Link><span>Explore the web demo · No download needed</span></div>
      </div>
      <figure className="welcome-visual"><img src="/images/services/iraac-mcc.webp" alt="Illustration of people talking together around a table" width="800" height="600" fetchPriority="high" /><div className="welcome-photo-note"><span aria-hidden="true">✳</span><div><strong>A conversation can be a beginning.</strong><p>Find support at your own pace.</p></div></div><figcaption>AI-generated illustration · not actual staff or premises</figcaption></figure>
    </div></section>
    <div className="welcome-values welcome-container"><span>Built around your needs</span><span>Local &amp; national services</span><span>Your choices, at your pace</span></div>
    <section id="ways-we-can-help" className="welcome-section welcome-container"><div className="welcome-section-head"><div><p className="welcome-eyebrow">Find your starting point</p><h2>What would help today?</h2></div><Link href="/app/">Explore all services <span aria-hidden="true">↗</span></Link></div>
      <div className="welcome-service-grid">{areas.map(area => <Link className="welcome-service" key={area.category} href={`/app/list/?q=${encodeURIComponent(area.category)}`}><img src={`/images/services/${area.image}.webp`} alt="" width="800" height="600" loading="lazy" /><div><h3>{area.title}<span aria-hidden="true">↗</span></h3><p>{area.body}</p></div></Link>)}</div>
      <div className="welcome-map-link"><div><strong>Prefer to see what’s nearby?</strong><p>Start around Nowra and explore services on the map.</p></div><Link href="/app/search/">Open the service map →</Link></div><p className="welcome-image-caption">Service images are AI-generated illustrations.</p>
    </section>
    <section id="how-it-works" className="welcome-how"><div className="welcome-container"><p className="welcome-eyebrow">A simpler way to find support</p><h2>You don’t have to work it all out at once.</h2><div className="welcome-steps">{steps.map((step,i)=><article key={step.title}><span>0{i+1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></div></section>
    <section id="community-stories" className="welcome-section welcome-container welcome-story"><div><p className="welcome-eyebrow">See a journey in the demo</p><h2>Less repeating.<br />More understanding.</h2><p>Follow Jayden’s example conversation with IRAAC YouthScape, from explaining what’s happening to planning a next step with an adviser.</p><Link className="welcome-button" href="/app/connected/lead_demo_youthscape/">Explore Jayden’s conversation →</Link><p className="welcome-small">Fictional people and messages. Live staff messaging is not yet connected.</p></div><div className="welcome-chat-preview"><header><span aria-hidden="true">I</span><div><strong>IRAAC YouthScape</strong><small>Example conversation</small></div></header><p className="welcome-chat-user">I get stressed when there’s a lot at once.</p><p className="welcome-chat-adviser">We can keep each message short and check that it makes sense before moving on. You can ask questions or take a break at any point.</p><Link href="/app/connected/lead_demo_youthscape/">See the whole conversation ↗</Link></div></section>
    <section className="welcome-container welcome-choice"><div><p className="welcome-eyebrow">Your choice matters</p><h2>Support starts with trust.</h2></div><div><p><strong>Share at your own pace.</strong> Explore the directory without telling us your story. Keep passwords, bank details and identity documents out of demo chats.</p><p><strong>Know who you’re speaking with.</strong> Assistant and example adviser conversations are clearly labelled. The app tells you when human support is unavailable.</p></div></section>
    <section className="welcome-container welcome-final"><div><p className="welcome-eyebrow">Whenever you’re ready</p><h2>Let’s find your next step.</h2><p>Start with a service, a place or a conversation.</p></div><div><Link className="welcome-button" href="/app/">Explore the app <span aria-hidden="true">↗</span></Link><Link className="welcome-final-secondary" href="/providers/">Working with your community? For organisations →</Link></div></section>
    <p className="welcome-emergency">In immediate danger? Call <a href="tel:000">000</a>. MobLink is not an emergency service.</p>
  </main></SiteShell>;
}
