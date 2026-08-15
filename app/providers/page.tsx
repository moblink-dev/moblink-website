import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../SiteShell";

export const metadata: Metadata = {
  title: "For service organisations | MobLink",
  description: "See how community service organisations can join MobLink, receive suitable enquiries and keep people connected to support.",
};

const providerSteps = [
  { number: "01", title: "Show where and how you help", body: "Keep your services, locations, eligibility and contact details clear so Mobli can recommend you appropriately." },
  { number: "02", title: "Receive suitable enquiries", body: "When a person chooses your service and agrees to connect, the request appears in your provider portal with the context needed to respond." },
  { number: "03", title: "Turn a lead into support", body: "Message the person, arrange a call or visit, record the next step and keep follow-up visible to your team." },
];

export default function ProvidersPage() {
  return (
    <SiteShell>
      <main>
        <section className="provider-hero">
          <div className="container provider-hero-grid">
            <div className="provider-hero-copy">
              <p className="section-kicker">For Aboriginal organisations and community service providers</p>
              <h1>Help more people find the support you already provide.</h1>
              <p>MobLink gives community members one place to explain what they need. When your organisation is a suitable match, they can choose to connect with you and begin a conversation.</p>
              <div className="hero-actions"><Link href="/admin/" className="btn btn-primary">Open provider portal</Link><Link href="/" className="btn btn-dark-outline">See the community experience</Link></div>
              <small className="provider-boundary">The current portal is a fictional-data demonstration. Provider onboarding and verified accounts are still being prepared.</small>
            </div>
            <div className="provider-lead-preview">
              <div className="provider-preview-top"><span>New matched enquiry</span><b>New</b></div>
              <h2>Centrelink application support</h2>
              <dl><div><dt>Area</dt><dd>Nowra · 2541</dd></div><div><dt>Preferred contact</dt><dd>Text message</dd></div><div><dt>Matched service</dt><dd>Shoalhaven Aboriginal Pension Support</dd></div></dl>
              <p>The person agreed to share this request and would like help understanding which documents to prepare.</p>
              <span className="provider-preview-action">Open enquiry and reply →</span>
              <small>Illustrative lead · fictional details</small>
            </div>
          </div>
        </section>

        <section className="provider-value-band">
          <div className="container"><p><strong>Right need</strong><span>See why the person is looking for help.</span></p><p><strong>Right place</strong><span>Receive enquiries that fit your coverage area.</span></p><p><strong>Permission to connect</strong><span>Follow up only when the person has agreed.</span></p></div>
        </section>

        <section className="moblink-section">
          <div className="container">
            <div className="section-heading-row"><div><p className="section-kicker">How the provider connection works</p><h2 className="section-title">From a community need to a useful next step.</h2></div><p>MobLink is designed to help organisations spend less time chasing incomplete enquiries and more time helping people who have chosen to connect.</p></div>
            <div className="journey-grid">{providerSteps.map((step) => <article className="journey-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
          </div>
        </section>

        <section className="moblink-section provider-benefits-section">
          <div className="container provider-benefits-grid">
            <div className="provider-benefits-copy"><p className="section-kicker">Built around the work your team does</p><h2 className="section-title">One place for enquiries, conversations and follow-up.</h2><p>Each connection brings together the person&apos;s stated need, location, preferred contact method, consent and the service they selected.</p></div>
            <ul className="provider-benefit-list"><li><span>01</span><div><strong>A clearer lead inbox</strong><p>See new, triaged and follow-up enquiries together.</p></div></li><li><span>02</span><div><strong>Connected messaging</strong><p>Reply to the person without losing the context of their request.</p></div></li><li><span>03</span><div><strong>Visible next steps</strong><p>Keep notes and progress clear for your team.</p></div></li><li><span>04</span><div><strong>Funding support</strong><p>Use the funding workspace to explore and prepare suitable opportunities.</p></div></li></ul>
          </div>
        </section>

        <section className="provider-principles">
          <div className="container"><div><p className="section-kicker">A respectful network</p><h2>People choose the connection. Providers earn the trust.</h2></div><div><p>MobLink is being designed around request-specific consent, minimal information, clear service coverage and provider-specific access.</p><p>Before real enquiries are accepted, the production service still needs verified onboarding, secure accounts, audited consent and protected records.</p></div></div>
        </section>

        <section className="moblink-cta community-final-cta provider-final-cta">
          <div className="container"><div><p className="section-kicker">Explore the provider experience</p><h2>See how MobLink can help community find your organisation.</h2></div><Link href="/admin/" className="btn btn-light">Open provider portal</Link></div>
        </section>
      </main>
    </SiteShell>
  );
}
