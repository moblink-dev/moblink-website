import type { Service } from "../app/data.ts";

/** Straight-line distance from the Browse area's Nowra centre, not device location. */
export function distanceFromNowra(service: Pick<Service, "lat" | "lng">): number {
  const radians = Math.PI / 180;
  const a = Math.sin((service.lat + 34.882) * radians / 2) ** 2
    + Math.cos(-34.882 * radians) * Math.cos(service.lat * radians)
    * Math.sin((service.lng - 150.600) * radians / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function serviceDistanceLabel(service: Pick<Service, "lat" | "lng" | "isNational">): string {
  if (service.isNational) return "Phone / national listing";
  const km = distanceFromNowra(service);
  if (!Number.isFinite(km)) return "Distance unavailable";
  return km < 0.1 ? "Under 0.1 km from Nowra" : `Approx. ${km.toFixed(1)} km from Nowra`;
}
