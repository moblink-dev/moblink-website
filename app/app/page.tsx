"use client";

import Link from "next/link";
import { useState } from "react";
import { serviceImage } from "../../lib/service-images";
import { distanceFromNowra, serviceDistanceLabel } from "../../lib/service-distance";
import { services } from "../data";
import BottomNav from "../../components/app/BottomNav";
import { useProviderServices } from "../../lib/provider-services";

function sortByDistance(servicesList: typeof services) {
  return [...servicesList].sort((a, b) => {
    const da = a.isNational ? Infinity : distanceFromNowra(a);
    const db = b.isNational ? Infinity : distanceFromNowra(b);
    return da - db;
  });
}

function ServiceRailCard({ service }: { service: typeof services[0] }) {
  return (
    <Link href={`/app/service/${service.id}`} className="rail-card">
      <div className="rail-card-img">
        <img src={serviceImage(service)} alt="" width="336" height="270" loading="lazy" />
        {service.isAboriginalLed && <span className="photo-badge">Aboriginal-led</span>}
      </div>
      <div className="rail-card-body">
        <h3 className="rail-card-name">{service.name}</h3>
        <p className="service-card-summary">{service.description}</p>
        <div className="rail-card-meta"><span>{service.suburb}</span></div>
        <p className="service-card-proximity">{serviceDistanceLabel(service)}</p>
        <p className="service-card-rating"><span aria-hidden="true">☆</span> Not yet rated</p>
        <span className="service-card-cost">{service.isFree ? "Free support" : "Check costs with service"}</span>
      </div>
    </Link>
  );
}

function ServiceRail({ title, services: items, link }: { title: string; services: typeof services; link?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="app-section">
      <div className="section-row">
        <h2 className="app-section-title">{title}</h2>
        {link && <Link href={link} className="section-link">See all</Link>}
      </div>
      <div className="rail-scroll">
        {items.map((s) => (
          <ServiceRailCard service={s} key={s.id} />
        ))}
      </div>
    </section>
  );
}

export default function MoblinkHome() {
  const effectiveServices = useProviderServices(services);
  const [topic, setTopic] = useState("All support");
  const filtered = topic === "All support" ? [] : effectiveServices.filter(s => s.category === topic);
  // Recommended for you — top local services, sorted by distance, non-crisis
  const nearby = sortByDistance(
    effectiveServices.filter((s) => !s.isNational && !s.isCrisis && s.suburb !== "National")
  );
  const recommended = nearby.filter((service, index, items) => items.findIndex(item => item.category === service.category) === index).slice(0, 8);

  // Newly added — services with createdAt >= 2026-08-05
  const newlyAdded = effectiveServices
    .filter((s) => s.createdAt >= "2026-08-05" && !s.isNational)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  // National support
  const national = effectiveServices.filter((s) => s.isNational && !s.isCrisis).slice(0, 6);

  // Aboriginal specific — all Aboriginal-led services, sorted by distance
  const aboriginal = sortByDistance(
    effectiveServices.filter((s) => s.isAboriginalLed && !s.isNational && ["Culture", "Youth"].includes(s.category))
  ).slice(0, 8);

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <header className="browse-head"><Link className="browse-brand" href="/app/">moblink<span aria-hidden="true">.</span></Link><span className="browse-area">Nowra &amp; South Coast</span></header>
        <div className="browse-intro"><h1>A little help.<br />A world of possibility.</h1><p>Find support, connection and your next step.</p></div>
        <Link href="/app/search" className="browse-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><span>What can we help you find?</span></Link>
        <div className="browse-topics" aria-label="Filter services">{["All support", "Health", "Housing", "Youth", "Culture", "Family", "Legal", "Employment"].map(item => <button type="button" key={item} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}</div>
        {topic !== "All support" ? <ServiceRail title={`${topic} support`} services={filtered} link={`/app/search?q=${encodeURIComponent(topic)}`} /> : <>
        <ServiceRail title="Support close to home" services={recommended} link="/app/search?q=local" />
        <Link href="/app/messages?assistant=1" className="browse-assistant"><span className="assistant-mark" aria-hidden="true">✳</span><span><strong>Not sure where to start?</strong><small>Have a chat with MobLink. We’ll help.</small></span><b aria-hidden="true">↗</b></Link>
        <ServiceRail title="Culture & connection" services={aboriginal} link="/app/search?q=culture" />
        <ServiceRail title="Discover something new" services={newlyAdded} link="/app/search" />
        <ServiceRail title="Support over the phone" services={national} link="/app/search?q=national" />
        </>}

        {/* Compact crisis strip */}
        <div className="crisis-mini">
          <span className="crisis-mini-label">Need help right now?</span>
          <div className="crisis-mini-links">
            <a href="tel:000" className="crisis-mini-link crisis-mini-000">000</a>
            <a href="tel:139276" className="crisis-mini-link">13YARN</a>
            <a href="tel:131114" className="crisis-mini-link">Lifeline</a>
            <a href="tel:1800737732" className="crisis-mini-link">1800RESPECT</a>
          </div>
        </div>

        <p className="illustration-note">Images are AI-generated illustrations of support, not actual staff or premises. Distances are approximate straight-line estimates from Nowra using directory map locations, not travel distances. Public ratings are not available yet. Check each service for eligibility and availability.</p>

        <BottomNav current="/app/" />
      </div>
    </main>
  );
}
