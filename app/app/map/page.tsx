"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { serviceDistanceLabel } from "../../../lib/service-distance";
import { serviceImage } from "../../../lib/service-images";
import { services, serviceCategories, type Service } from "../../data";
import BottomNav from "../../../components/app/BottomNav";
import dynamic from "next/dynamic";

const FullMap = dynamic(() => import("../../../components/app/FullMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading-fill">
      <div className="map-loading-spinner" />
      <p>Loading map...</p>
    </div>
  ),
});

export default function MapPage({ initialSearch = "" }: { initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showSheet, setShowSheet] = useState(true);

  const filtered = useMemo(() => {
    let result = services.filter((s) => !s.isNational);
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.suburb.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeCategory]);

  const handleSelectService = useCallback((s: Service) => {
    setSelectedService(s);
    setShowSheet(true);
  }, []);

  const handleToggleSheet = useCallback(() => {
    if (showSheet) {
      setShowSheet(false);
      setSelectedService(null);
    } else {
      setShowSheet(true);
    }
  }, [showSheet]);

  return (
    <main className="app-page">
      <div className="phone-shell phone-shell-compact map-search-shell">
      <div className="map-mobile-page">
        {/* Full-screen map */}
        <div className="map-mobile-canvas">
          <FullMap focusResults={Boolean(search.trim())} services={filtered} onSelectService={handleSelectService} />
        </div>

        {/* Overlaid search bar */}
        <div className="map-mobile-top">
          <div className="map-mobile-search">
            <span className="map-mobile-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="map-mobile-search-input"
              placeholder="Search services around Nowra…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedService(null); }}
              aria-label="Search services"
            />
          </div>
          <div className="map-mobile-cats">
            <button
              type="button"
              className={`map-mobile-cat ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => { setActiveCategory("all"); setSelectedService(null); }}
            >
              All
            </button>
            {serviceCategories.map((cat) => (
              <button
                type="button"
                className={`map-mobile-cat ${activeCategory === cat ? "active" : ""}`}
                onClick={() => { setActiveCategory(cat); setSelectedService(null); }}
                key={cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count badge */}
        {!showSheet && <button type="button" className="map-mobile-count" onClick={() => { setSelectedService(null); setShowSheet(!showSheet); }}>
          {filtered.length} services · Show list
        </button>}

        {/* Bottom sheet */}
        <section aria-label="Service results" className={`map-mobile-sheet ${showSheet ? "open" : ""}`}>
          <button type="button" aria-label="Hide service list" className="map-mobile-sheet-handle" onClick={handleToggleSheet}>
            <span className="map-mobile-sheet-bar" />
          </button>

          {selectedService ? (
            <div className="map-mobile-sheet-body">
              <div className="map-mobile-sheet-top">
                <div>
                  <h3 className="map-mobile-sheet-name">{selectedService.name}</h3>
                  <span className="map-mobile-sheet-sub">{selectedService.subcategory}</span>
                </div>
                <button type="button" className="map-mobile-sheet-x" onClick={() => { setSelectedService(null); }}>Back to list</button>
              </div>
              <img className="map-service-image" src={serviceImage(selectedService)} alt="" />
              <div className="map-mobile-sheet-info">
                <span>{serviceDistanceLabel(selectedService)} · {selectedService.suburb}</span>
                {selectedService.isFree && <span className="map-mobile-sheet-free">Free</span>}
                {selectedService.isAboriginalLed && <span className="map-mobile-sheet-ac">Aboriginal-led</span>}
              </div>
              <p className="map-mobile-sheet-desc">{selectedService.description}</p>
              <div className="map-mobile-sheet-actions">
                <Link href={`/app/service/${selectedService.id}`} className="map-mobile-btn">Details</Link>
                <a href={`tel:${selectedService.phone.replace(/[^0-9+]/g, "")}`} className="map-mobile-btn map-mobile-btn-outline">Call</a>
              </div>
            </div>
          ) : (
            <div className="map-mobile-sheet-body">
              <div className="map-mobile-sheet-top">
                <div><h3 className="map-mobile-sheet-name">Explore services <span>({filtered.length})</span></h3><p className="map-results-hint">Find the right support, at your pace</p></div>
                <button type="button" className="map-mobile-sheet-x" onClick={() => setShowSheet(false)}>Hide list</button>
              </div>
              <div className="map-mobile-sheet-list">
                {filtered.length === 0 && <p className="map-location-note">No services match. Try another search or category.</p>}
                {filtered.map((s) => (
                  <Link href={`/app/service/${s.id}`} className="map-mobile-sheet-item" key={s.id}>
                    <img className="map-result-thumbnail" src={serviceImage(s)} alt="" loading="lazy" />
                    <div className="map-mobile-sheet-item-body">
                      <span className="map-result-category">{s.category}{s.isAboriginalLed ? " · Aboriginal-led" : ""}</span>
                      <strong>{s.name}</strong>
                      <p className="map-result-summary">{s.description}</p>
                      <span className="map-result-distance">{serviceDistanceLabel(s)} · {s.suburb}</span>
                      <span className="map-result-footer">{s.isFree ? "Free support" : "Contact for costs"}<span>View details →</span></span>
                    </div>
                  </Link>
                ))}
                <p className="map-location-note">Pins show directory service areas. Confirm the address before travelling.</p><Link href="/app/list">All services, including phone support ↗</Link>
              </div>
            </div>
          )}
        </section>

        {/* Toggle sheet FAB */}
        <button type="button" className="map-mobile-fab" onClick={handleToggleSheet} aria-label="Toggle list">
          {showSheet ? "🗺️" : "📋"}
        </button>
      </div>
      <p className="map-source-credit">Service areas · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a></p>
      <BottomNav current="/app/search" />
      </div>
    </main>
  );
}
