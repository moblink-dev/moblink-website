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
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
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
          placeholder="Search services by name, keyword, or suburb..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="service-list-input"
          aria-label="Search services"
        />
      </div>

      <div className="service-list-categories" role="tablist" aria-label="Filter by category">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === "all"}
          className={`service-list-cat-btn ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {serviceCategories.map((cat) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === cat}
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
            <p className="service-list-empty-hint">
              Try a different category or search term, or check the{" "}
              <a href="tel:139276" className="crisis-link-text">
                13YARN
              </a>{" "}
              crisis line for immediate support.
            </p>
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
