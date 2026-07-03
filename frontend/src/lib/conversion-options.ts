export const FORMATS = [
  "GeoJSON",
  "CSV",
  "GeoTIFF (COG)",
  "Shapefile",
  "KML",
  "KMZ",
  "GeoPackage",
] as const;

export const CONVERSION_TYPES = [
  "Vector to Raster",
  "Raster to Vector",
  "Reprojection",
  "Format Only",
] as const;

export const RESAMPLING_METHODS = ["Bilinear", "Nearest", "Cubic", "Average"] as const;
export const COMPRESSION_METHODS = ["LZW", "DEFLATE", "JPEG", "None"] as const;
export const TILE_SIZES = ["256 x 256", "512 x 512", "1024 x 1024"] as const;
export const BAND_OPTIONS = ["All Bands", "Band 1", "RGB", "NIR"] as const;
export const RESOLUTION_UNITS = ["meters", "feet", "degrees"] as const;

export interface CrsOption {
  code: string;
  label: string;
}

export const CRS: CrsOption[] = [
  { code: "3857", label: "WGS 84 / Pseudo-Mercator" },
  { code: "4326", label: "WGS 84" },
  { code: "3395", label: "World Mercator" },
  { code: "32633", label: "UTM zone 33N" },
];
