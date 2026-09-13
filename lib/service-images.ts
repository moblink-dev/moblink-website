import type { Service } from "../app/data";

/** Every catalogue entry has a corresponding, individually generated local image. */
export function serviceImage(service: Pick<Service, "id">): string {
  return `/images/services/${encodeURIComponent(service.id)}.webp`;
}
