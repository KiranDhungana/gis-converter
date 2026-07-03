"use client";

import dynamic from "next/dynamic";

interface LazyMapPreviewProps {
  url: string | null;
  format: string | null;
}

const MapPreview = dynamic(
  () => import("@/components/converter/map-preview").then((mod) => mod.MapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="map-preview empty">
        <p>Loading map preview…</p>
      </div>
    ),
  }
);

export function LazyMapPreview({ url, format }: LazyMapPreviewProps) {
  if (!url || !format) return null;

  return <MapPreview url={url} format={format} key={`${url}-${format}`} />;
}
