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
        <p>This service is not currently published in MobLink.</p>
        <Link href="/app/search">Browse other services</Link>
      </div>
    );
  }

  return (
    <>
      <ServiceCard service={effectiveService} showFull />
      <div className="detail-actions">
        <Link href={`/app/request-help/${effectiveService.id}`} className="service-card-button">
          Request help from this service
        </Link>
      </div>
    </>
  );
}
