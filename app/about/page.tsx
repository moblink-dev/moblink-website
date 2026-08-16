import type { Metadata } from "next";
import Link from "next/link";

import SiteShell from "../SiteShell";

export const metadata: Metadata = {
  title: "About MobLink | Find support without knowing where to start",
  description: "Learn why MobLink is being built and how it helps Aboriginal and Torres Strait Islander people find suitable local support.",
};

const principles = [
  ["Start with the person", "People can explain what is happening in their own words instead of learning the service system first."],
  ["Keep choice with community", "MobLink can suggest options, but the person chooses whether and where their information is shared."],
  ["Make local support easier to find", "Location, service coverage and the person’s need help bring suitable nearby organisations forward."],
  ["Keep the connection going", "After a person connects, the service can message, call or arrange an in-person next step."],
];

export default function AboutPage() {
  return (
    <SiteShell>
      <main>
        <section className="info-hero">
          <div className="container info-hero-grid">
            <div><p className="section-kicker">About MobLink</p><h1>One place to explain what is going on and find the right next step.</h1></div>
            <div><p>MobLink is being built as a national, mobile-first doorway to Aboriginal and community services. It is for people who need support but may not know which organisation, program or phone number is right.</p><div className="hero-actions"><Link className="btn btn-primary" href="/app/">Open the app</Link><Link className="btn btn-dark-outline" href="/services/">Explore services</Link></div></div>
          </div>
        </section>

        <section className="moblink-section">
          <div className="container info-split">
            <div><p className="section-kicker">What we are trying to achieve</p><h2 className="section-title">Less searching. Fewer dead ends. More useful connections.</h2></div>
            <div className="info-prose"><p>Finding help can mean repeating the same story, calling several organisations or being sent somewhere that does not cover your area. MobLink is designed to make that first step clearer.</p><p>A person can use the web app and, as the service develops, may also be able to speak with MobLink by phone or text. MobLink can understand the need, suggest suitable services and help start a connection when the person agrees.</p><p>The current website is a working prototype. Phone, text, verified provider accounts and secure shared records still require production systems and community-led governance before launch.</p></div>
          </div>
        </section>

        <section className="moblink-section info-principles-section">
          <div className="container"><p className="section-kicker">How MobLink should work</p><div className="info-principles">{principles.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{body}</p></article>)}</div></div>
        </section>

        <section className="community-safety">
          <div className="container safety-grid"><div><p className="section-kicker">Trust has to be earned</p><h2>Support should be safe, respectful and clear.</h2></div><div className="safety-points"><p><strong>Your choice:</strong> a service only receives the details you agree to share for that request.</p><p><strong>Your privacy:</strong> MobLink should collect only what is needed to help with the next step.</p><p><strong>Human support:</strong> people and qualified services remain responsible for important advice and decisions.</p><p><strong>Emergency help:</strong> MobLink does not replace 000 or crisis services.</p></div></div>
        </section>
      </main>
    </SiteShell>
  );
}
