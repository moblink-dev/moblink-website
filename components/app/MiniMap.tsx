"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { services } from "../../app/data";
import { useRouter } from "next/navigation";

const NOWRA_CENTER: [number, number] = [150.600, -34.882];

const categoryColors: Record<string, string> = {
  Crisis: "#dc2626",
  Health: "#059669",
  Legal: "#2563eb",
  Housing: "#d97706",
  Family: "#7c3aed",
  Youth: "#0891b2",
  Culture: "#c026d3",
  Education: "#65a30d",
  Employment: "#0d9488",
  Centrelink: "#78716c",
  Financial: "#ca8a04",
  "Mental Health": "#4f46e5",
  Addiction: "#b91c1c",
  Elderly: "#a21caf",
  Disability: "#6366f1",
};

export default function MiniMap() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: NOWRA_CENTER,
      zoom: 10,
      attributionControl: false,
      interactive: true,
      dragPan: true,
      scrollZoom: true,
    });

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    // Click anywhere on the map to open full map search
    m.on("click", () => {
      router.push("/app/map");
    });

    m.on("load", () => {
      setReady(true);
      addServiceMarkers(m);

      // User location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const el = document.createElement("div");
            el.className = "minimap-user-dot";
            el.innerHTML = '<div class="minimap-user-pulse"></div>';
            new maplibregl.Marker({ element: el })
              .setLngLat([pos.coords.longitude, pos.coords.latitude])
              .addTo(m);

            const bounds = new maplibregl.LngLatBounds();
            bounds.extend([pos.coords.longitude, pos.coords.latitude]);
            services
              .filter((s) => !s.isNational)
              .forEach((s) => bounds.extend([s.lng, s.lat]));
            m.fitBounds(bounds, { padding: 60, maxZoom: 11 });
          },
          () => undefined
        );
      }
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
  }, [router]);

  function addServiceMarkers(m: maplibregl.Map) {
    const local = services.filter((s) => !s.isNational);
    const clusters = clusterMarkers(local, 0.008);

    clusters.forEach((cluster) => {
      if (cluster.count === 1) {
        const s = cluster.services[0];
        const el = document.createElement("div");
        el.className = "minimap-dot";
        el.style.backgroundColor = categoryColors[s.category] ?? "#666";
        el.title = s.name;
        el.setAttribute("aria-label", s.name);

        new maplibregl.Marker({ element: el })
          .setLngLat([s.lng, s.lat])
          .addTo(m);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          router.push(`/app/service/${s.id}`);
        });
      } else {
        const el = document.createElement("div");
        el.className = "minimap-cluster";
        el.textContent = String(cluster.count);
        el.style.backgroundColor = categoryColors[cluster.services[0]?.category] ?? "#666";

        new maplibregl.Marker({ element: el })
          .setLngLat(cluster.center)
          .addTo(m);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          m.flyTo({ center: cluster.center, zoom: 13 });
        });
      }
    });
  }

  return (
    <div className="minimap-wrapper">
      <div ref={mapContainer} className="minimap" />
      <div className={`minimap-static-pins ${ready ? "is-ready" : ""}`} aria-label="Nearby service locations">
        {[
          { id: "nsw-housing-nowra", name: "Housing NSW Nowra", x: 42, y: 44, color: "#d97706" },
          { id: "centrelink-nowra", name: "Centrelink Nowra", x: 57, y: 56, color: "#166a5e" },
          { id: "south-coast-medical", name: "South Coast Medical Service", x: 68, y: 36, color: "#059669" },
          { id: "waminda", name: "Waminda", x: 34, y: 66, color: "#7c3aed" },
          { id: "als-nowra", name: "Aboriginal Legal Service Nowra", x: 73, y: 70, color: "#2563eb" },
        ].map((pin) => (
          <button key={pin.id} type="button" title={pin.name} aria-label={pin.name} style={{ left: `${pin.x}%`, top: `${pin.y}%`, backgroundColor: pin.color }} onClick={() => router.push(`/app/service/${pin.id}`)} />
        ))}
      </div>
      <div className="minimap-hint">
        <span className="minimap-hint-text">Explore services near Nowra →</span>
      </div>
      {ready && <div className="minimap-legend"><span /> Local services</div>}
    </div>
  );
}

interface Cluster {
  center: [number, number];
  count: number;
  services: typeof services;
}

function clusterMarkers(svcs: typeof services, radius: number): Cluster[] {
  const clusters: Cluster[] = [];
  const assigned = new Set<string>();

  svcs.forEach((s) => {
    if (assigned.has(s.id)) return;
    const nearby = svcs.filter((s2) => {
      if (assigned.has(s2.id)) return false;
      const dLat = s2.lat - s.lat;
      const dLng = s2.lng - s.lng;
      return Math.sqrt(dLat * dLat + dLng * dLng) < radius;
    });
    nearby.forEach((s2) => assigned.add(s2.id));
    clusters.push({ center: [s.lng, s.lat], count: nearby.length, services: nearby });
  });

  return clusters;
}
