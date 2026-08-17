"use client";

import Link from "next/link";
import { services } from "../data";
import BottomNav from "../../components/app/BottomNav";
import { useProviderServices } from "../../lib/provider-services";

// Nowra center point for distance calculations
const NOWRA_LAT = -34.882;
const NOWRA_LNG = 150.600;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortByDistance(servicesList: typeof services) {
  return [...servicesList].sort((a, b) => {
    const da = a.isNational ? 99999 : haversineKm(NOWRA_LAT, NOWRA_LNG, a.lat, a.lng);
    const db = b.isNational ? 99999 : haversineKm(NOWRA_LAT, NOWRA_LNG, b.lat, b.lng);
    return da - db;
  });
}

function distanceFromNowra(lat: number, lng: number): string {
  if (lat === -33.868 && lng === 151.209) return "National";
  const km = haversineKm(NOWRA_LAT, NOWRA_LNG, lat, lng);
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(0)} km`;
}

// Color palette for card images
const cardColors = [
  "from-emerald-700 to-teal-600",
  "from-amber-700 to-orange-600",
  "from-blue-700 to-indigo-600",
  "from-rose-700 to-pink-600",
  "from-violet-700 to-purple-600",
  "from-cyan-700 to-sky-600",
  "from-lime-700 to-green-600",
  "from-red-700 to-rose-600",
];

function getCardColor(index: number) {
  return cardColors[index % cardColors.length];
}

function ServiceRailCard({ service, index }: { service: typeof services[0]; index: number }) {
  return (
    <Link href={`/app/service/${service.id}`} className="rail-card">
      <div className={`rail-card-img service-art-${index % 4} ${getCardColor(index)}`}>
        <span className="rail-card-emoji" aria-hidden="true">
          {service.isAboriginalLed ? "🪶" : service.isCrisis ? "🚨" : service.isFree ? "🎯" : "📍"}
        </span>
      </div>
      <div className="rail-card-body">
        <h3 className="rail-card-name">{service.name}</h3>
        <div className="rail-card-meta">
          <span className="rail-card-dist">{distanceFromNowra(service.lat, service.lng)}</span>
          {service.isFree && <span className="rail-card-free">Free</span>}
          {service.isAboriginalLed && <span className="rail-card-ac">Aboriginal-led</span>}
        </div>
        <span className="rail-card-cat">{service.subcategory}</span>
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
        {items.map((s, i) => (
          <ServiceRailCard service={s} index={i} key={s.id} />
        ))}
      </div>
    </section>
  );
}

export default function MoblinkHome() {
  const effectiveServices = useProviderServices(services);
  // Recommended for you — top local services, sorted by distance, non-crisis
  const recommended = sortByDistance(
    effectiveServices.filter((s) => !s.isNational && !s.isCrisis && s.suburb !== "National")
  ).slice(0, 8);

  // Newly added — services with createdAt >= 2026-08-05
  const newlyAdded = effectiveServices
    .filter((s) => s.createdAt >= "2026-08-05" && !s.isNational)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  // National support
  const national = effectiveServices.filter((s) => s.isNational && !s.isCrisis).slice(0, 6);

  // Closest to me — sorted by distance from Nowra, non-national, non-crisis
  const closest = sortByDistance(
    effectiveServices.filter((s) => !s.isNational && !s.isCrisis)
  ).slice(0, 6);

  // Aboriginal specific — all Aboriginal-led services, sorted by distance
  const aboriginal = sortByDistance(
    effectiveServices.filter((s) => s.isAboriginalLed && !s.isNational)
  ).slice(0, 8);

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact">
        <header className="app-top app-top-compact">
          <div>
            <p className="app-kicker">Support that fits your situation</p>
            <h1>Help near Nowra</h1>
          </div>
        </header>

        <Link href="/app/search" className="location-search-card"><span>📍</span><div><strong>Nowra 2541</strong><small>Using your current area · change</small></div><b>⌕</b></Link>

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

        <ServiceRail title="Best matches nearby" services={recommended} link="/app/search" />
        <ServiceRail title="Newly added" services={newlyAdded} link="/app/search" />
        <ServiceRail title="Closest to me" services={closest} link="/app/search" />
        <ServiceRail title="Aboriginal specific" services={aboriginal} link="/app/search" />
        <ServiceRail title="National support" services={national} link="/app/search" />

        <BottomNav current="/app/" />
      </div>
    </main>
  );
}
