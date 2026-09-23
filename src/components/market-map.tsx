import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { MarketItem } from "@/lib/demo-data";
import { markerEmoji } from "@/lib/market-utils";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function ensureLeafletCss() {
  if (document.querySelector(`link[href="${LEAFLET_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
}

export function MarketMap({
  items,
  selectedId,
  onSelect,
}: {
  items: MarketItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<number, LeafletMarker>>(new Map());
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    void (async () => {
      try {
        ensureLeafletCss();
        const L = await import("leaflet");
        if (cancelled || !containerRef.current) return;
        map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([51.1657, 10.4515], 6);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap-Mitwirkende",
          maxZoom: 18,
        }).addTo(map);
        mapRef.current = map;
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      items.forEach((item) => {
        const active = item.id === selectedId;
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:grid;place-items:center;width:38px;height:38px;border-radius:50%;font-size:18px;background:${active ? "#f97316" : "#ffffff"};border:2px solid ${active ? "#f97316" : "#1d4ed8"};box-shadow:0 4px 14px rgba(15,23,42,.25)">${markerEmoji(item)}</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });
        const marker = L.marker([item.lat, item.lng], { icon, title: item.title })
          .addTo(mapRef.current!)
          .on("click", () => onSelect(item.id));
        markersRef.current.set(item.id, marker);
      });

      if (items.length > 0) {
        const bounds = L.latLngBounds(items.map((i) => [i.lat, i.lng] as [number, number]));
        mapRef.current.fitBounds(bounds.pad(0.25), { maxZoom: 11 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [items, selectedId, ready, onSelect]);

  if (failed) {
    return (
      <div className="grid h-[420px] place-items-center rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        Die Karte konnte nicht geladen werden. Bitte Internetverbindung prüfen und erneut versuchen.
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-lg border bg-muted lg:h-[560px]" aria-label="Karte mit Demo-Einträgen" />
      {!ready && <div className="absolute inset-0 grid place-items-center rounded-lg bg-muted/70 text-sm font-semibold">Karte wird geladen …</div>}
    </div>
  );
}

export default MarketMap;
