import type { Metadata } from "next";
import Link from "next/link";

import SiteShell from "../SiteShell";

export const metadata: Metadata = {
  title: "Services Moblink can help you find",
  description: "Explore the kinds of local, Aboriginal-led and national services available through the Moblink app.",
};

const serviceGroups = [
  ["Housing and a safe place", "Homelessness support, tenancy help, emergency accommodation and longer-term housing pathways.", "Housing"],
  ["Centrelink and money", "Help with payments, claims, applications, financial counselling and understanding what to prepare.", "Centrelink"],
  ["Legal and bail support", "Qualified legal services, advocacy, youth justice pathways and practical help around court or bail.", "Legal"],
  ["Health and wellbeing", "Aboriginal health, mental health, disability, addiction and social-emotional wellbeing services.", "Health"],
  ["Family and young people", "Support for children, parents, carers, young people, education, mentoring and safe activities.", "Youth"],
  ["Culture and Country", "Programs that strengthen culture, community connection, identity and time on Country.", "Culture"],
  ["Work, training and education", "Employment pathways, practical skills, study support, training and help preparing for work.", "Employment"],
  ["Urgent and crisis support", "Crisis lines and urgent support when someone is unsafe or needs to speak with a person now.", "Crisis"],
];

export default function ServicesPage() {
  return (
    <SiteShell>
      <main>
        <section className="info-hero services-info-hero">
          <div className="container info-hero-grid"><div><p className="section-kicker">Services</p><h1>Tell Moblink what you need. Explore support that fits.</h1></div><div><p>You do not need to know the right program name. Start with what is happening, your area and how you would like to connect.</p><div className="hero-actions"><Link className="btn btn-primary" href="/app/search/">Browse all services</Link><Link className="btn btn-dark-outline" href="/app/messages/">Talk to Moblink</Link></div></div></div>
        </section>

        <section className="moblink-section service-groups-section">
          <div className="container"><div className="section-heading-row"><div><p className="section-kicker">Ways we can help</p><h2 className="section-title">Support for everyday needs, difficult moments and stronger connections.</h2></div><p>Moblink brings together Aboriginal-led, local community and national services. Availability depends on where you live, eligibility and each organisation’s current capacity.</p></div><div className="service-group-grid">{serviceGroups.map(([title, body, category], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p><Link href={`/app/search/?q=${encodeURIComponent(category.toLowerCase())}`}>See {category.toLowerCase()} support →</Link></article>)}</div></div>
        </section>

        <section className="moblink-section services-connection-section"><div className="container connected-grid"><div><p className="section-kicker">More than a list</p><h2 className="section-title">Choose a service and keep the conversation moving.</h2><p>When you agree to connect, the organisation can receive your request, reply in Moblink, arrange a phone call or invite you to their office. Your connected services stay together so you can see what happens next.</p></div><div className="service-route-card"><strong>1. Explain the need</strong><span>Use your own words.</span><strong>2. Check suitable options</strong><span>Compare location, coverage and service type.</span><strong>3. Choose to connect</strong><span>Share only what is needed for this request.</span><Link className="btn btn-primary" href="/app/">Start in the app</Link></div></div></section>
      </main>
    </SiteShell>
  );
}
