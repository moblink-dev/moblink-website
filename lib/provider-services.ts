import type { Service } from "../app/data";
import { useEffect, useState } from "react";

export type ProviderServiceOverride = Pick<Service, "name" | "description" | "address"> & { published: boolean };
export type ProviderServiceOverrides = Record<string, ProviderServiceOverride>;

const STORAGE_KEY = "moblink_iraac_services";

export function readProviderServiceOverrides(): ProviderServiceOverrides {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, ProviderServiceOverride] => isProviderServiceOverride(entry[1])));
  } catch {
    return {};
  }
}

export function writeProviderServiceOverrides(overrides: ProviderServiceOverrides): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function toProviderServiceOverrides(services: Array<Service & { published: boolean }>): ProviderServiceOverrides {
  return Object.fromEntries(services.map((service) => [service.id, {
    name: service.name,
    description: service.description,
    address: service.address,
    published: service.published,
  }]));
}

export function applyProviderServiceOverrides(
  services: Service[],
  overrides: ProviderServiceOverrides,
): Service[] {
  return services.flatMap((service) => {
    const override = overrides[service.id];
    if (override?.published === false) return [];
    return [{ ...service, ...override }];
  });
}

export function useProviderServices(services: Service[]): Service[] {
  const [effectiveServices, setEffectiveServices] = useState(services);

  useEffect(() => {
    setEffectiveServices(applyProviderServiceOverrides(services, readProviderServiceOverrides()));
  }, [services]);

  return effectiveServices;
}

function isProviderServiceOverride(value: unknown): value is ProviderServiceOverride {
  if (!value || typeof value !== "object") return false;
  const override = value as Partial<ProviderServiceOverride>;
  return typeof override.name === "string"
    && typeof override.description === "string"
    && typeof override.address === "string"
    && typeof override.published === "boolean";
}
