"use client";

import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Service } from "../../app/data";

const NOWRA: L.LatLngTuple = [-34.882, 150.6];

export default function FullMap({
  services,
  onSelectService,
  focusResults = false,
}: {
  services: Service[];
  onSelectService: (service: Service) => void;
  focusResults?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(NOWRA, 13);
    map.current = instance;
    instance.on("zoomend", () => setZoom(instance.getZoom()));
    L.control.zoom({ position: "bottomright" }).addTo(instance);
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      },
    ).addTo(instance);
    tiles.on("tileerror", () => setTileError(true));
    tiles.on("tileload", () => setTileError(false));
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    setReady(true);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !map.current) return;
    const group = L.layerGroup().addTo(map.current);
    // Shared coordinates represent service areas, not invented street addresses.
    const locations = new Map<string, Service[]>();
    services.forEach((service) => {
      if (!Number.isFinite(service.lat) || !Number.isFinite(service.lng))
        return;
      const point = map.current!.project([service.lat, service.lng], zoom);
      const key = `${Math.round(point.x / 44)},${Math.round(point.y / 44)}`;
      locations.set(key, [...(locations.get(key) ?? []), service]);
    });
    locations.forEach((items) => {
      const icon = L.divIcon({
        className: "service-map-pin",
        html: `<span>${items.length > 1 ? items.length : ""}</span>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });
      const label =
        items.length === 1
          ? items[0].name
          : `${items.length} services near ${items[0].suburb}`;
      const marker = L.marker([items[0].lat, items[0].lng], {
        icon,
        title: label,
        alt: label,
        keyboard: true,
      }).addTo(group);
      marker.getElement()?.setAttribute("aria-label", label);
      if (items.length === 1)
        marker.on("click", () => onSelectService(items[0]));
      else {
        const list = document.createElement("div");
        list.className = "map-pin-services";
        items.forEach((service) => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = service.name;
          button.addEventListener("click", () => {
            onSelectService(service);
            marker.closePopup();
          });
          list.appendChild(button);
        });
        marker.bindPopup(list, { maxHeight: 200 });
      }
    });
    return () => {
      group.remove();
    };
  }, [services, ready, onSelectService, zoom]);

  useEffect(() => {
    if (!map.current || !ready || !focusResults || !services.length) return;
    map.current.fitBounds(
      L.latLngBounds(services.map((service) => [service.lat, service.lng])),
      { paddingTopLeft: [40, 140], paddingBottomRight: [40, 80], maxZoom: 14 },
    );
  }, [services, ready, focusResults]);

  return (
    <div className="map-full-inner">
      <div
        ref={container}
        className="map-full-canvas"
        role="region"
        aria-label="Nowra service map"
      />
      <button
        type="button"
        className="map-reset"
        onClick={() => map.current?.setView(NOWRA, 13)}
      >
        ⌖ Nowra
      </button>
      {tileError && (
        <p className="map-tile-error" role="status">
          Map tiles couldn’t load. Check your connection or open the service
          list.
        </p>
      )}
    </div>
  );
}
