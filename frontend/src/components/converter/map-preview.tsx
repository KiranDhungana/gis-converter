"use client";

import type { GeoJsonObject } from "geojson";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "@/lib/api/client";
import "leaflet/dist/leaflet.css";

const RASTER_FORMATS = new Set(["cog", "geotiff"]);

interface MapPreviewProps {
  url: string | null;
  format: string | null;
}

function fitMapToLayer(map: L.Map, layer: L.Layer) {
  const bounds = (layer as L.GeoJSON).getBounds?.() ?? (layer as { getBounds?: () => L.LatLngBounds }).getBounds?.();
  if (bounds?.isValid?.()) {
    map.fitBounds(bounds, { padding: [20, 20] });
  }
}

export function MapPreview({ url, format }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.Layer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isRaster = !!format && RASTER_FORMATS.has(format);
  const isGeoJson = format === "geojson";

  useEffect(() => {
    setError(null);
  }, [url, format]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, { scrollWheelZoom: true }).setView([27.7, 85.3], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setReady(true);

    const resize = () => map.invalidateSize({ animate: false });
    resize();
    requestAnimationFrame(resize);
    const t1 = window.setTimeout(resize, 100);
    const t2 = window.setTimeout(resize, 400);
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
      layerRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !url) return;

    let cancelled = false;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    (async () => {
      try {
        if (isGeoJson) {
          const res = await fetchWithAuth(url);
          if (!res.ok) throw new Error(`Failed to load GeoJSON (${res.status})`);
          const json = (await res.json()) as GeoJsonObject;
          if (cancelled) return;

          const layer = L.geoJSON(json, {
            style: {
              color: "#3b82f6",
              weight: 2,
              fillColor: "#3b82f6",
              fillOpacity: 0.25,
            },
          }).addTo(map);

          layerRef.current = layer;
          fitMapToLayer(map, layer);
          return;
        }

        if (isRaster) {
          const [{ default: parseGeoraster }, { default: GeoRasterLayer }] = await Promise.all([
            import("georaster"),
            import("georaster-layer-for-leaflet"),
          ]);

          const res = await fetchWithAuth(url);
          if (!res.ok) throw new Error(`Failed to load raster (${res.status})`);
          const buffer = await res.arrayBuffer();
          const georaster = await parseGeoraster(buffer);
          if (cancelled) return;

          const noData = georaster.noDataValue;
          const bands = georaster.numberOfRasters;
          const mins = georaster.mins;
          const maxs = georaster.maxs;

          const layer = new GeoRasterLayer({
            georaster,
            opacity: 0.85,
            resolution: 256,
            pixelValuesToColorFn: (values: number[]) => {
              const valid = values.some(
                (v) => v !== null && v !== undefined && !Number.isNaN(v) && v !== noData
              );
              if (!valid) return null;

              if (bands >= 3) {
                const [r, g, b] = values;
                return `rgb(${r}, ${g}, ${b})`;
              }

              const v = values[0];
              if (v === noData || v === null || Number.isNaN(v)) return null;
              let scaled = v;
              if (mins && maxs && maxs[0] !== mins[0]) {
                scaled = Math.round(((v - mins[0]) / (maxs[0] - mins[0])) * 255);
              }
              scaled = Math.max(0, Math.min(255, scaled));
              return `rgb(${scaled}, ${scaled}, ${scaled})`;
            },
          });

          layer.addTo(map);
          layerRef.current = layer;
          fitMapToLayer(map, layer);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render map layer");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, url, isGeoJson, isRaster]);

  if (!url || (!isRaster && !isGeoJson)) {
    return (
      <div className="map-preview empty">
        <p>Complete a GeoJSON or COG/GeoTIFF conversion to preview it on the map.</p>
      </div>
    );
  }

  return (
    <div className="map-preview">
      {error && <div className="map-overlay-error">Map preview: {error}</div>}
      <div
        ref={containerRef}
        className="map-preview-canvas"
        style={{ height: "100%", width: "100%" }}
        aria-label="Interactive map preview"
      />
    </div>
  );
}
