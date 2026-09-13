"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Service } from "../../app/data";
import { useProviderServices } from "../../lib/provider-services";
import ServiceCard from "./ServiceCard";

export default function ServiceDetailHero({ service }: { service: Service }) {
  const canonicalService = useMemo(() => [service], [service]);
  const [effectiveService] = useProviderServices(canonicalService);

  if (!effectiveService) {
    return (
      <div className="service-list-empty">
        <p>This service is not currently published in Moblink.</p>
        <Link href="/app/search">Browse other services</Link>
      </div>
    );
  }

  return (
    <>
      <ServiceCard service={effectiveService} showFull />
      <div className="detail-actions">
        <Link href={`/app/messages?service=${effectiveService.id}`} className="service-card-button">
          Ask MobLink about this service
        </Link>
        <Link href={`/app/request-help/${effectiveService.id}`} className="service-card-button">
          Prepare a support request
        </Link>
      </div>
      {effectiveService.id.startsWith("iraac-") ? (
        <p className="service-contact-note">Explore an IRAAC demo conversation with service guidance and an adviser preview. Requests and messages stay in this browser; no live adviser is connected.</p>
      ) : (
        <a className="service-invite-link" href={`mailto:?subject=${encodeURIComponent(`Please join Moblink — ${effectiveService.name}`)}&body=${encodeURIComponent(`Hello ${effectiveService.name}, I found your service through Moblink and would like to message your team. Please consider joining Moblink so you can respond to community enquiries in the app.`)}`}>
          Email this organisation and ask them to join Moblink
        </a>
      )}
    </>
  );
}
