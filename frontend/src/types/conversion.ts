export type ConversionStatus = "pending" | "processing" | "completed" | "failed";

export type ConversionFormat =
  | "geojson"
  | "csv"
  | "geotiff"
  | "cog"
  | "shapefile"
  | "kml"
  | "geopackage";

export interface Conversion {
  id: string;
  inputFormat: ConversionFormat;
  outputFormat: ConversionFormat;
  inputFileName: string;
  outputFileName?: string;
  status: ConversionStatus;
  createdAt: string;
  completedAt?: string;
}
