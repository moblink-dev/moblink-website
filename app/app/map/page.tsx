"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
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

const categoryColorMap: Record<string, string> = {
  Crisis: "#dc2626", Health: "#059669", Legal: "#2563eb",
  Housing: "#d97706", Family: "#7c3aed", Youth: "#0891b2",
  Culture: "#c026d3", Education: "#65a30d", Employment: "#0d9488",
  Centrelink: "#78716c", Financial: "#ca8a04",
  "Mental Health": "#4f46e5", Addiction: "#b91c1c",
  Elderly: "#a21caf", Disability: "#6366f1",
};

export default function MapPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showSheet, setShowSheet] = useState(false);

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
      <div className="phone-shell phone-shell-compact">
        <div className="phone-status" aria-hidden="true">
          <span className="phone-time">Map</span>
          <span className="phone-signal">Moblink</span>
        </div>
      <div className="map-mobile-page">
        {/* Full-screen map */}
        <div className="map-mobile-canvas">
          <FullMap services={filtered} onSelectService={handleSelectService} />
        </div>

        {/* Overlaid search bar */}
        <div className="map-mobile-top">
          <div className="map-mobile-search">
            <span className="map-mobile-search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="map-mobile-search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search services"
            />
          </div>
          <div className="map-mobile-cats">
            <button
              type="button"
              className={`map-mobile-cat ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All
            </button>
            {serviceCategories.map((cat) => (
              <button
                type="button"
                className={`map-mobile-cat ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                key={cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count badge */}
        <div className="map-mobile-count" onClick={() => setShowSheet(!showSheet)}>
          {filtered.length} services
        </div>

        {/* Bottom sheet */}
        <div className={`map-mobile-sheet ${showSheet ? "open" : ""}`}>
          <div className="map-mobile-sheet-handle" onClick={handleToggleSheet}>
            <div className="map-mobile-sheet-bar" />
          </div>

          {selectedService ? (
            <div className="map-mobile-sheet-body">
              <div className="map-mobile-sheet-top">
                <div>
                  <h3 className="map-mobile-sheet-name">{selectedService.name}</h3>
                  <span className="map-mobile-sheet-sub">{selectedService.subcategory}</span>
                </div>
                <button type="button" className="map-mobile-sheet-x" onClick={() => { setSelectedService(null); }}>✕</button>
              </div>
              <div className="map-mobile-sheet-info">
                <span>{selectedService.distance} · {selectedService.suburb}</span>
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
                <h3 className="map-mobile-sheet-name">Services ({filtered.length})</h3>
                <button type="button" className="map-mobile-sheet-x" onClick={() => setShowSheet(false)}>✕</button>
              </div>
              <div className="map-mobile-sheet-list">
                {filtered.slice(0, 30).map((s) => (
                  <Link href={`/app/service/${s.id}`} className="map-mobile-sheet-item" key={s.id}>
                    <div className="map-mobile-sheet-dot" style={{ background: categoryColorMap[s.category] || "#666" }} />
                    <div className="map-mobile-sheet-item-body">
                      <strong>{s.name}</strong>
                      <span>{s.distance} · {s.suburb}</span>
                    </div>
                  </Link>
                ))}
                {filtered.length > 30 && (
                  <p className="map-mobile-sheet-more">+{filtered.length - 30} more</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle sheet FAB */}
        <button type="button" className="map-mobile-fab" onClick={handleToggleSheet} aria-label="Toggle list">
          {showSheet ? "🗺️" : "📋"}
        </button>
      </div>
      </div>
      <BottomNav current="/app/map" />
    </main>
  );
}