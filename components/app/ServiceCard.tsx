"use client";

import { type Service } from "../../app/data";
import Link from "next/link";
import { serviceImage } from "../../lib/service-images";
import { serviceDistanceLabel } from "../../lib/service-distance";

export default function ServiceCard({ service, showFull = false }: { service: Service; showFull?: boolean }) {
  const callablePhone = /\d/.test(service.phone);
  if (!showFull) {
    return <article className="service-result-card" data-service-id={service.id}>
      <Link href={`/app/service/${service.id}`} className="service-result-image" aria-label={`View ${service.name}`}><img src={serviceImage(service)} alt="" width="120" height="150" loading="lazy" /></Link>
      <div className="service-result-body">
        <span className="service-result-category">{service.category}{service.isAboriginalLed ? " · Aboriginal-led" : ""}</span>
        <h3><Link href={`/app/service/${service.id}`}>{service.name}</Link></h3>
        <p className="service-card-summary">{service.description}</p>
        <p>{service.suburb}</p>
        <p className="service-card-proximity">{serviceDistanceLabel(service)}</p>
        <p className="service-card-rating"><span aria-hidden="true">☆</span> Not yet rated</p>
        <span className="service-card-cost">{service.isFree ? "Free support" : "Check costs with service"}</span>
        <div className="service-result-actions"><Link href={`/app/service/${service.id}`}>Details</Link><Link href={`/app/request-help/${service.id}`}>Request help ↗</Link></div>
      </div>
    </article>;
  }
  return (
    <article className={`service-card ${service.isCrisis ? "service-card-crisis" : ""}`} data-service-id={service.id}>
      <img className="service-photo" src={serviceImage(service)} alt="AI-generated illustration of this kind of support; not actual staff or premises" width="640" height="340" loading="lazy" />
      <div className="service-card-content">
      <div className="service-card-header">
        <div className="service-card-category">
          <span className="service-card-category-label">{service.subcategory}</span>
        </div>
        {service.isAboriginalLed && <span className="service-card-badge">Aboriginal-led</span>}
      </div>

      <h1 className="service-card-name">{service.name}</h1>

      <div className="service-card-meta">
        <span className="service-card-distance">{serviceDistanceLabel(service)}</span>
        {service.isCrisis && <span className="service-card-alert">Available 24/7</span>}
        {service.isFree && !service.isCrisis && <span className="service-card-free">Free</span>}
      </div>

      <p className="service-card-description">{service.description}</p>
      <p className="service-card-rating"><span aria-hidden="true">☆</span> Not yet rated</p>

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

      </div>
    </article>
  );
}
