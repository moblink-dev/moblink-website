"use client";

import { useState, useMemo } from "react";
import { type Service, type ServiceCategory, serviceCategories } from "../../app/data";
import ServiceCard from "./ServiceCard";
import { useProviderServices } from "../../lib/provider-services";

interface ServiceListProps {
  services: Service[];
  title?: string;
  initialSearch?: string;
}

export default function ServiceList({ services, title, initialSearch = "" }: ServiceListProps) {
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const availableServices = useProviderServices(services);

  const filtered = useMemo(() => {
    let result = availableServices;

    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (q === "local") return result.filter(s => !s.isNational);
      if (q === "national") return result.filter(s => s.isNational);
      if (q === "free") return result.filter(s => s.isFree);
      if (q === "aboriginal") return result.filter(s => s.isAboriginalLed);
      result = result.filter(
        (s) =>
          s.postcode.includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.subcategory.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.suburb.toLowerCase().includes(q)
      );
    }

    return result;
  }, [availableServices, search, activeCategory]);

  return (
    <div className="service-list">
      <div className="service-list-search">
        <input
          type="search"
          placeholder="Try housing, Nowra or a postcode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="service-list-input"
          aria-label="Search services"
        />
      </div>

      <div className="service-list-categories" role="group" aria-label="Filter by category">
        <button
          type="button"
          aria-pressed={activeCategory === "all"}
          className={`service-list-cat-btn ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {serviceCategories.map((cat) => (
          <button
            type="button"
              aria-pressed={activeCategory === cat}
            className={`service-list-cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
            key={cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {title && <h2 className="service-list-title">{title}</h2>}

      <div className="service-list-results">
        {filtered.length === 0 ? (
          <div className="service-list-empty">
            <p>No services found matching your search.</p>
            <p className="service-list-empty-hint">Try another word or a nearby suburb.</p>
            <button type="button" className="service-card-button" onClick={() => { setSearch(""); setActiveCategory("all"); }}>Clear filters</button>
          </div>
        ) : (
          <>
            <p className="service-list-count">{filtered.length} service{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.map((service) => (
              <ServiceCard service={service} key={service.id} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
