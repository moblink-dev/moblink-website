import Link from "next/link";
import SiteShell from "./SiteShell";

const steps = [
  { number: "01", title: "Tell Mobli what is going on", body: "Use your own words. You can explain what you need, where you are, and how you would like someone to contact you." },
  { number: "02", title: "See services that fit", body: "Mobli can suggest nearby and national services for housing, Centrelink, legal support, health, culture and more." },
  { number: "03", title: "Choose who you connect with", body: "You stay in control. When you agree, MobLink can introduce you and open a conversation with the service you choose." },
];

const supportAreas = [
  { title: "Housing", body: "Find homelessness, tenancy and housing support near you." },
  { title: "Centrelink", body: "Get help understanding payments, claims and applications." },
  { title: "Legal help", body: "Connect with suitable legal and advocacy services." },
  { title: "Health & wellbeing", body: "Look for health, disability and social-emotional wellbeing support." },
  { title: "Family & young people", body: "Find practical support for children, families and young people." },
  { title: "Culture & Country", body: "Discover organisations supporting culture, community and connection to Country." },
];

const exampleJourneys = [
  { category: "Housing", quote: "I could explain that I needed somewhere safe to stay, then see the housing services that covered my area.", outcome: "A clearer housing pathway" },
  { category: "Centrelink", quote: "Mobli helped me work out which service could sit with me and go through my Centrelink claim.", outcome: "Application support" },
  { category: "Legal", quote: "I did not know who to call. MobLink showed me a legal service nearby and helped me start the conversation.", outcome: "Connected legal support" },
  { category: "Culture", quote: "I wanted to feel more connected to culture and Country. Mobli showed me community organisations I could contact.", outcome: "Community and cultural connection" },
];

export default function Home() {
  return (
    <SiteShell>
      <main>
        <section className="community-hero">
          <div className="container community-hero-grid">
            <div className="community-hero-copy">
              <div className="eyebrow">Meet Mobli, your guide to local support</div>
              <h1>Tell us what&apos;s going on. We&apos;ll help you find the next step.</h1>
              <p>MobLink helps Aboriginal and Torres Strait Islander people find services that match what they need and where they live—without having to know which organisation to call first.</p>
              <div className="hero-actions">
                <Link href="/app/" className="btn btn-primary">Open the MobLink app</Link>
                <Link href="#how-it-works" className="btn btn-cream-outline">See how it works</Link>
              </div>
              <div className="channel-note"><strong>Use the web app today.</strong><span>Phone and text conversations with Mobli are being prepared for launch.</span></div>
            </div>

            <div className="mobli-demo" aria-label="Example conversation with Mobli">
              <div className="mobli-demo-head">
                <span className="mobli-avatar">M</span>
                <div><strong>Mobli</strong><small>Your MobLink guide</small></div>
                <span className="mobli-status">Ready to help</span>
              </div>
              <div className="mobli-thread">
                <p className="mobli-message mobli-message-user">I need help with Centrelink and I don&apos;t know where to start.</p>
                <div className="mobli-message mobli-message-agent"><strong>Mobli</strong><p>I can help with that. Based on postcode 2541, here are services that can help with a Centrelink application.</p></div>
                <div className="mobli-result"><span>Suggested nearby service</span><strong>Shoalhaven Aboriginal Pension Support</strong><small>Centrelink help · Nowra area</small><span className="mobli-result-action">View service →</span></div>
              </div>
              <small className="example-label">Illustrative conversation using fictional details</small>
            </div>
          </div>
        </section>

        <section className="community-promises" aria-label="Why use MobLink">
          <div className="container community-promise-grid">
            <div><strong>Start with your story</strong><span>You do not need to know the service system.</span></div>
            <div><strong>Find support near you</strong><span>Search by location, need and service type.</span></div>
            <div><strong>Stay connected</strong><span>Message the organisation after you connect.</span></div>
          </div>
        </section>

        <section id="how-it-works" className="moblink-section community-how">
          <div className="container">
            <div className="section-heading-row"><div><p className="section-kicker">How MobLink works</p><h2 className="section-title">You talk. Mobli helps make sense of the options.</h2></div><p>Mobli is the guide inside MobLink. It helps turn what you say into practical service options, while leaving the choice with you.</p></div>
            <div className="journey-grid">{steps.map((step) => <article className="journey-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
          </div>
        </section>

        <section id="ways-we-can-help" className="moblink-section support-section">
          <div className="container">
            <p className="section-kicker">Ways MobLink can help</p>
            <div className="section-heading-row compact"><h2 className="section-title">Whatever is happening, you can start here.</h2><Link href="/app/search/" className="text-link">Browse all services →</Link></div>
            <div className="support-area-grid">{supportAreas.map((area, index) => <article className="support-area-card" key={area.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{area.title}</h3><p>{area.body}</p></article>)}</div>
          </div>
        </section>

        <section id="community-stories" className="moblink-section story-section">
          <div className="container">
            <div className="story-intro"><p className="section-kicker">What support could look like</p><h2 className="section-title">One good connection can change what happens next.</h2><p>These are illustrative journeys showing the kinds of outcomes MobLink is being designed to support. They are not verified customer testimonials.</p></div>
            <div className="story-grid">{exampleJourneys.map((story) => <article className="story-card" key={story.category}><span>{story.category}</span><blockquote>“{story.quote}”</blockquote><p>{story.outcome}</p></article>)}</div>
          </div>
        </section>

        <section className="moblink-section connected-section">
          <div className="container connected-grid">
            <div className="connected-copy"><p className="section-kicker">More than a directory</p><h2 className="section-title">Once you connect, you can keep the conversation in one place.</h2><p>A service can message you with the next step, tell you what to bring, arrange a call or invite you to their office. You can reply when it suits you and keep track of what is happening.</p><Link href="/app/connected/" className="btn btn-primary">See your connections</Link></div>
            <div className="connected-chat" aria-label="Example connected service conversation">
              <div><span className="connected-avatar">S</span><p><strong>South Coast Housing Support</strong><small>Connected through MobLink</small></p></div>
              <p className="connected-bubble provider">Hi, we can help you understand the housing application. Would you like us to call tomorrow morning?</p>
              <p className="connected-bubble person">Yes please, after 10 would be good.</p>
              <small>Illustrative conversation · no real customer information</small>
            </div>
          </div>
        </section>

        <section className="community-safety">
          <div className="container safety-grid">
            <div><p className="section-kicker">Your choice matters</p><h2>You decide what to share and who you connect with.</h2></div>
            <div className="safety-points"><p><strong>Permission first.</strong> MobLink asks before sharing a request with a service.</p><p><strong>Use only what is needed.</strong> Never share passwords, bank details or tax file numbers in MobLink.</p><p><strong>Not an emergency service.</strong> Call 000 if you or someone else is in immediate danger.</p></div>
          </div>
        </section>

        <section className="moblink-cta community-final-cta">
          <div className="container"><span className="mobli-avatar large">M</span><div><p className="section-kicker">Start with Mobli</p><h2>Find the support that fits your life, your need and your area.</h2></div><Link href="/app/messages/" className="btn btn-light">Talk to Mobli</Link></div>
        </section>
      </main>
    </SiteShell>
  );
}
