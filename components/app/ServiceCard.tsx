"use client";

import { type Service } from "../../app/data";
import Link from "next/link";

const categoryEmoji: Record<string, string> = {
  Crisis: "🚨",
  Health: "🏥",
  Legal: "⚖️",
  Housing: "🏠",
  Family: "👨‍👩‍👧‍👦",
  Youth: "🧑‍🤝‍🧑",
  Culture: "🪶",
  Education: "📚",
  Employment: "💼",
  Centrelink: "🏛️",
  Financial: "💰",
  "Mental Health": "🧠",
  Addiction: "🫂",
  Elderly: "👴",
  Disability: "♿",
};

export default function ServiceCard({ service, showFull = false }: { service: Service; showFull?: boolean }) {
  const callablePhone = /\d/.test(service.phone);
  return (
    <article className={`service-card ${service.isCrisis ? "service-card-crisis" : ""}`} data-service-id={service.id}>
      <div className="service-card-header">
        <div className="service-card-category">
          <span className="service-card-emoji" aria-hidden="true">
            {categoryEmoji[service.category] ?? "📌"}
          </span>
          <span className="service-card-category-label">{service.subcategory}</span>
        </div>
        {service.isAboriginalLed && <span className="service-card-badge">Aboriginal-led</span>}
      </div>

      <h3 className="service-card-name">{service.name}</h3>

      <div className="service-card-meta">
        <span className="service-card-distance">{service.distance}</span>
        {service.isCrisis && <span className="service-card-alert">Available 24/7</span>}
        {service.isFree && !service.isCrisis && <span className="service-card-free">Free</span>}
      </div>

      <p className="service-card-description">{service.description}</p>

      <div className="service-card-tags">
        {service.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className="service-card-info">
        <p className="service-card-address">
          {service.isNational ? service.address : `${service.address}, ${service.suburb} ${service.state}`}
        </p>
        <p className="service-card-phone">
          {callablePhone ? (
            <a href={`tel:${service.phone.replace(/[^0-9+]/g, "")}`} onClick={(e) => e.stopPropagation()}>
              {service.phone}
            </a>
          ) : service.phone}
        </p>
        {service.hours && <p className="service-card-hours">{service.hours}</p>}
      </div>

      {showFull && (
        <div className="service-card-full">
          {service.eligibility && (
            <div className="service-card-detail">
              <strong>Eligibility:</strong> {service.eligibility}
            </div>
          )}
          {service.website && (
            <a
              href={service.website}
              target="_blank"
              rel="noopener noreferrer"
              className="service-card-website"
            >
              Visit website ↗
            </a>
          )}
        </div>
      )}

      <div className="service-card-actions">
        <Link href={`/app/service/${service.id}`} className="service-card-button">
          View details
        </Link>
        <Link
          href={`/app/request-help/${service.id}`}
          className="service-card-button service-card-button-secondary"
        >
          Request help
        </Link>
      </div>
    </article>
  );
}
